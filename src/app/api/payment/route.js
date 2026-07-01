import { SquareClient, SquareEnvironment } from 'square';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../utils/supabaseAdmin';
import { Resend } from 'resend';

// Uses Sandbox for testing, Production for real money
const isProduction = !process.env.NEXT_PUBLIC_SQUARE_APP_ID?.startsWith('sandbox-');
const resend = new Resend(process.env.RESEND_API_KEY);

// In-Memory Rate Limiter Map
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 5;
const ipRequestCounts = new Map();

export async function POST(req) {
  try {
    const body = await req.json();
    const { sourceId, amount, couponCode, discountAmount, formData, cartItems, orderType, distanceKm, isQuoteOnly: clientIsQuoteOnly, isCustomQuoteRequest, isSpecialEventQuoteRequest } = body;
    const isQuoteOnly = clientIsQuoteOnly || isSpecialEventQuoteRequest;

    if (!formData || !cartItems) {
      return NextResponse.json({ success: false, error: 'Bad Request: Missing order details.' }, { status: 400 });
    }

    // --- CORS & ORIGIN PROTECTION ---
    const allowedOrigins = [
      'http://localhost:3000',
      'https://ckcakelounge.com',
      'https://www.ckcakelounge.com',
      'https://ckcakelounge.ca',
      'https://www.ckcakelounge.ca'
    ];
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');

    const isOriginAllowed = (url) => {
      if (!url) return false;
      if (allowedOrigins.some(allowed => url.startsWith(allowed))) return true;
      if (url.includes('.vercel.app')) return true;
      return false;
    };

    if (isProduction) {
      const sourceUrl = origin || referer;
      if (!sourceUrl || !isOriginAllowed(sourceUrl)) {
        console.warn(`SECURITY ALERT: Blocked payment request from unauthorized origin: ${sourceUrl}`);
        return NextResponse.json({ success: false, error: 'Security Block: Request origin not allowed.' }, { status: 403 });
      }
    }

    if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN.includes('YOUR_SANDBOX')) {
        return NextResponse.json({ success: false, error: 'Square Access Token is missing or invalid on the server.' }, { status: 500 });
    }

    // --- RATE LIMITER: Card Testing Protection ---
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
    const now = Date.now();
    
    for (const [key, value] of ipRequestCounts.entries()) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW_MS) ipRequestCounts.delete(key);
    }

    if (ip !== 'unknown_ip') {
      const record = ipRequestCounts.get(ip) || { count: 0, timestamp: now };
      if (now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
        record.count = 1;
        record.timestamp = now;
      } else {
        record.count++;
      }
      ipRequestCounts.set(ip, record);

      if (record.count > MAX_ATTEMPTS_PER_WINDOW) {
        return NextResponse.json({ success: false, error: 'Too many payment attempts. Please wait a minute before trying again.' }, { status: 429 });
      }
    }

    // 🚨 1. SERVER-SIDE PRICE VERIFICATION 🚨
    let serverCartTotal = 0;
    
    if (!isSpecialEventQuoteRequest) {
      for (const item of cartItems) {
        let truePrice = 0;
        if (item.variantId) {
          const { data: variant } = await supabaseAdmin.from('product_variants').select('price').eq('id', item.variantId).single();
          if (variant) truePrice = variant.price;
        } else {
          const { data: product } = await supabaseAdmin.from('products').select('price').eq('id', item.productId).single();
          if (product) truePrice = product.price;
        }
        
        if (item.isPhotoCake && item.category !== 'Cakes') {
          const lowerSize = (item.size || '').toLowerCase();
          if (lowerSize.includes('1 pound')) {
            truePrice += 15;
          } else if (lowerSize.includes('2 pound')) {
            truePrice += 20;
          } else {
            truePrice += 25;
          }
        }
        
        serverCartTotal += (truePrice * item.quantity);
      }
    }

    // 🚨 2. SERVER-SIDE COUPON VERIFICATION 🚨
    let serverDiscountAmount = 0;
    if (couponCode && !isSpecialEventQuoteRequest) {
      const { data: coupon } = await supabaseAdmin
        .from('store_coupons')
        .select('*')
        .eq('code', couponCode)
        .single();
        
      if (coupon) {
        if (coupon.discount_type === 'fixed') {
          serverDiscountAmount = coupon.discount_value;
        } else if (coupon.discount_type === 'percentage') {
          serverDiscountAmount = serverCartTotal * (coupon.discount_value / 100);
        }
        
        if (serverDiscountAmount > serverCartTotal) serverDiscountAmount = serverCartTotal;

        if (coupon.is_one_time_use) {
          const { data: pastOrders } = await supabaseAdmin
            .from('store_orders')
            .select('id')
            .eq('email', formData.email)
            .eq('coupon_code', couponCode);
            
          if (pastOrders && pastOrders.length > 0) {
            return NextResponse.json({ error: 'Security Block: You have already used this coupon.' }, { status: 403 });
          }
        }
      }
    }

    // 🚨 3. SERVER-SIDE DELIVERY FEE VERIFICATION 🚨
    let serverDeliveryFee = 0;
    if (orderType === 'delivery' && distanceKm && distanceKm > 0) {
      if (distanceKm > 5) {
        const roundedKm = Math.ceil(distanceKm);
        if (roundedKm === 6) {
          serverDeliveryFee = 4.99;
        } else {
          serverDeliveryFee = 4.99 + (roundedKm - 6);
        }
      }
    }

    // 🚨 4. THE MASTER MATH VERIFICATION 🚨
    const serverDiscountedSubtotal = Math.max(0, serverCartTotal - serverDiscountAmount);
    const serverHstTax = 0;
    const serverGrandTotal = serverDiscountedSubtotal + serverDeliveryFee;

    if (!isSpecialEventQuoteRequest && Math.abs(serverGrandTotal - amount) > 0.05) {
      console.warn(`SECURITY ALERT: Client amount ${amount} did not match server amount ${serverGrandTotal}`);
      return NextResponse.json({ success: false, error: 'Security Block: Price manipulation detected. Please refresh and try again.' }, { status: 403 });
    }

    // --- ESCAPE HTML HELPER ---
    function escapeHTML(str) {
      if (!str) return '';
      return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag]));
    }

    const safeFirstName = escapeHTML(formData.firstName);
    const safeLastName = escapeHTML(formData.lastName);
    const safeEmail = escapeHTML(formData.email);
    const safePhone = escapeHTML(formData.phone);
    const safeAddress = escapeHTML(formData.address);
    const safeCity = escapeHTML(formData.city);
    const safePostalCode = escapeHTML(formData.postalCode);
    const safeNotes = escapeHTML(formData.notes);

    // 🚨 5. TWO-PHASE COMMIT: Insert "Processing" Order 🚨
    let receiptId = null;
    let orderIdempotencyKey = crypto.randomUUID();

    try {
      const { data: insertedData, error: dbError } = await supabaseAdmin
        .from('store_orders')
        .insert([
          {
            payment_id: isQuoteOnly ? `quote_${orderIdempotencyKey}` : `processing_${orderIdempotencyKey}`,
            customer_name: `${safeFirstName} ${safeLastName}`.trim(),
            email: safeEmail,
            phone: safePhone,
            order_type: orderType,
            delivery_address: orderType === 'delivery' ? `${safeAddress}, ${safeCity}, ${safePostalCode}` : null,
            delivery_date: formData.date,
            delivery_time: formData.time,
            notes: safeNotes,
            cart_items: cartItems,
            total_amount: amount,
            coupon_code: couponCode || null,
            discount_amount: discountAmount || 0,
            status: isQuoteOnly ? 'pending_quote' : 'processing'
          }
        ])
        .select()
        .single();
        
      if (dbError) throw dbError;
      if (insertedData) receiptId = insertedData.id;
    } catch (e) {
      console.error("Failed to insert processing ticket:", e);
      return NextResponse.json({ success: false, error: 'Database error before charging.' }, { status: 500 });
    }

    let paymentId = isQuoteOnly ? `quote_${orderIdempotencyKey}` : 'sandbox_success_id';

    if (isQuoteOnly) {
      // Bypassed Square checkout for custom quote requests
      // Update coupon usage atomically
      if (couponCode) {
        const { error: rpcError } = await supabaseAdmin.rpc('increment_coupon_usage', { coupon_code_param: couponCode });
        if (rpcError) {
          console.error("Failed to increment coupon usage atomically:", rpcError);
        }
      }
    } else {
      // Convert amount to cents for Square
      const amountInCents = Math.round(amount * 100);

      const client = new SquareClient({
        token: process.env.SQUARE_ACCESS_TOKEN,
        environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      });

      paymentId = 'sandbox_success_id';
      
      try {
        const response = await client.payments.create({
          sourceId: sourceId,
          idempotencyKey: orderIdempotencyKey,
          amountMoney: {
            amount: BigInt(amountInCents),
            currency: 'CAD',
          },
        });
        paymentId = response?.result?.payment?.id || response?.payment?.id || paymentId;
      } catch (squareError) {
        // 🚨 SQUARE FAILED: Mark order as failed 🚨
        await supabaseAdmin.from('store_orders').update({ status: 'failed', payment_id: `failed_${orderIdempotencyKey}` }).eq('id', receiptId);
        throw squareError;
      }

      // 🚨 SQUARE SUCCEEDED: Mark order as paid 🚨
      await supabaseAdmin.from('store_orders').update({ status: 'paid', payment_id: paymentId }).eq('id', receiptId);

      // Update coupon usage atomically
      if (couponCode) {
        const { error: rpcError } = await supabaseAdmin.rpc('increment_coupon_usage', { coupon_code_param: couponCode });
        if (rpcError) {
          console.error("Failed to increment coupon usage atomically:", rpcError);
        }
      }
    }
    


      // --- 2. FIRE AUTOMATED EMAIL VIA RESEND ---
      try {
        const bakeryEmail = process.env.BAKERY_EMAIL;
        if (process.env.RESEND_API_KEY && bakeryEmail) {
          
          let itemsHtml = cartItems.map(item => {
                const meta = [
                  item.size !== 'Standard' && item.size, 
                  item.flavor !== 'Original' && item.flavor, 
                  item.isPhotoCake && 'Photo Cake'
                ].filter(Boolean).join(' &bull; ');
                
                return `
                <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <strong style="font-size: 16px; color: #4a3f39;">${item.quantity}x ${item.name}</strong>
                      ${meta ? `<div style="color: #8b7d77; font-size: 13px; margin-top: 4px;">${meta}</div>` : ''}
                      ${item.photoUrl ? `<div style="margin-top: 8px;"><a href="${item.photoUrl}" target="_blank" style="display: inline-block; padding: 6px 12px; background: #4a3f39; color: #fff; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold;">📷 Download High-Res Photo</a></div>` : ''}
                    </div>
                    <strong style="color: #4a3f39;">$${(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                </li>
                `;
              }).join('');
          
          let discountHtml = discountAmount > 0 
            ? `<div style="color: #16a34a; font-weight: bold; font-size: 16px; margin-top: 15px;">Discount Applied (${couponCode}): -$${discountAmount.toFixed(2)}</div>`
            : '';

          const subjectLine = isSpecialEventQuoteRequest
            ? `🎉 Special Event Quote Needed: ${safeFirstName} ${safeLastName}`
            : isCustomQuoteRequest
              ? `🎂 Custom Cake Quote Needed: ${safeFirstName} ${safeLastName}`
              : `🎂 New Order: ${safeFirstName} ${safeLastName} - $${amount}`;

          const requestTypeLabel = isSpecialEventQuoteRequest
            ? "Special Event Cake Quote Request"
            : isCustomQuoteRequest
              ? "Bespoke Custom Cake Quote"
              : "Paid Order";

          const headerTitle = isSpecialEventQuoteRequest
            ? "Special Event Cake Quote Request!"
            : isCustomQuoteRequest
              ? "Custom Cake Quote Request!"
              : "New Bakery Order Received!";

          const priceFooterLabel = isSpecialEventQuoteRequest || isCustomQuoteRequest
            ? `Estimated Base Price: $${amount}`
            : `Total Paid: $${amount}`;

          await resend.emails.send({
            from: 'Orders <onboarding@resend.dev>', // Free tier Resend sender
            to: bakeryEmail,
            subject: subjectLine,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4a3f39;">${headerTitle}</h2>
                <p><strong>Request Type:</strong> ${requestTypeLabel}</p>
                <p><strong>Payment/Quote ID:</strong> ${paymentId}</p>
                
                <h3 style="border-bottom: 2px solid #e0d5ce; padding-bottom: 10px; color: #4a3f39;">Customer Details</h3>
                <p><strong>Name:</strong> ${safeFirstName} ${safeLastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
                <p><strong>Phone:</strong> ${safePhone}</p>

                <h3 style="border-bottom: 2px solid #e0d5ce; padding-bottom: 10px; color: #4a3f39;">Fulfillment Details</h3>
                <p><strong>Type:</strong> ${orderType.toUpperCase()}</p>
                ${orderType === 'delivery' ? `<p><strong>Address:</strong> ${safeAddress}, ${safeCity}, ${safePostalCode}</p>` : ''}
                <p><strong>Date Needed:</strong> ${formData.date}</p>
                <p><strong>Time Needed:</strong> ${formData.time}</p>
                <p><strong>Notes:</strong> ${safeNotes || 'None'}</p>

                <h3 style="border-bottom: 2px solid #e0d5ce; padding-bottom: 10px; color: #4a3f39;">Order/Quote Specifications</h3>
                <ul style="list-style: none; padding: 0;">
                  ${itemsHtml}
                </ul>
                
                ${discountHtml}

                <h2 style="text-align: right; color: #4a3f39; margin-top: 20px;">
                  ${priceFooterLabel}
                </h2>
                <p style="text-align: center; color: #888; font-size: 12px; margin-top: 40px;">
                  This is an automated message from the CK Cake Lounge Secure Quote/Checkout System.
                </p>
              </div>
            `
          });
        }
      } catch (e) {
        console.error("Failed to send Resend email:", e);
      }

      return NextResponse.json({ success: true, paymentId, receiptId }, { status: 200 });

  } catch (error) {
    console.error("Square Payment Error:", error);
    
    // Parse Square specific errors
    let errorMessage = "An error occurred while processing the payment.";
    if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].detail;
    } else if (error.message) {
        errorMessage = error.message;
    } else {
        errorMessage = String(error);
    }
    
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
