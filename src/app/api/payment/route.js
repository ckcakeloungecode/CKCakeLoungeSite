import { SquareClient, SquareEnvironment } from 'square';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../utils/supabaseAdmin';
import { Resend } from 'resend';

// Uses Sandbox for testing, Production for real money
const isProduction = process.env.NODE_ENV === 'production';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { sourceId, amount, couponCode, discountAmount, formData, cartItems, orderType } = body;

    if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN.includes('YOUR_SANDBOX')) {
        return NextResponse.json({ success: false, error: 'Square Access Token is missing or invalid on the server.' }, { status: 500 });
    }

    // 🚨 Pre-Charge Security Check 🚨
    // Ensure the user hasn't bypassed the frontend UI to use a one-time code twice
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from('store_coupons')
        .select('is_one_time_use')
        .eq('code', couponCode)
        .single();
        
      if (coupon?.is_one_time_use) {
        const { data: pastOrders } = await supabaseAdmin
          .from('store_orders')
          .select('id')
          .eq('email', formData.email)
          .eq('coupon_code', couponCode);
          
        if (pastOrders && pastOrders.length > 0) {
          return NextResponse.json(
            { error: 'Security Block: You have already used this coupon on a previous order.' }, 
            { status: 403 }
          );
        }
      }
    }

    // Convert amount to cents for Square
    const amountInCents = Math.round(amount * 100);

    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    const response = await client.payments.create({
      sourceId: sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(amountInCents),
        currency: 'CAD', // Ensuring Canadian Dollars
      },
    });

    // The payment is successful!
    // We safely extract the ID depending on how the v44 SDK shapes the response
    const paymentId = response?.result?.payment?.id || response?.payment?.id || 'sandbox_success_id';
    
    // --- 1. SAVE TO SUPABASE TICKETING SYSTEM ---
    let receiptId = null;
    if (formData && cartItems) {
      try {
        // Use the Admin client to bypass RLS and insert the row
        const { data: insertedData, error: dbError } = await supabaseAdmin
          .from('store_orders')
          .insert([
            {
              payment_id: paymentId,
              customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email,
              phone: formData.phone,
              order_type: orderType,
              delivery_address: orderType === 'delivery' ? `${formData.address}, ${formData.city}, ${formData.postalCode}` : null,
              delivery_date: formData.date,
              delivery_time: formData.time,
              notes: formData.notes || '',
              cart_items: cartItems,
              total_amount: amount,
              coupon_code: couponCode || null,
              discount_amount: discountAmount || 0,
              status: 'pending'
            }
          ])
          .select()
          .single();
          
        if (dbError) {
          console.error("Supabase Insert Error:", dbError);
        } else if (couponCode) {
          // Increment the usage limit on the coupon
          const { data: cData } = await supabaseAdmin
            .from('store_coupons')
            .select('id, times_used')
            .eq('code', couponCode)
            .single();
            
          if (cData) {
            await supabaseAdmin
              .from('store_coupons')
              .update({ times_used: cData.times_used + 1 })
              .eq('id', cData.id);
          }
          receiptId = insertedData.id;
        } else if (insertedData) {
          receiptId = insertedData.id;
        }
      } catch (e) {
        console.error("Failed to insert ticket into database:", e);
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

          await resend.emails.send({
            from: 'Orders <onboarding@resend.dev>', // Free tier Resend sender
            to: bakeryEmail,
            subject: `🎂 New Order: ${formData.firstName} ${formData.lastName} - $${amount}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4a3f39;">New Bakery Order Received!</h2>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
                
                <h3 style="border-bottom: 2px solid #e0d5ce; padding-bottom: 10px; color: #4a3f39;">Customer Details</h3>
                <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
                <p><strong>Phone:</strong> ${formData.phone}</p>

                <h3 style="border-bottom: 2px solid #e0d5ce; padding-bottom: 10px; color: #4a3f39;">Fulfillment Details</h3>
                <p><strong>Type:</strong> ${orderType.toUpperCase()}</p>
                ${orderType === 'delivery' ? `<p><strong>Address:</strong> ${formData.address}, ${formData.city}, ${formData.postalCode}</p>` : ''}
                <p><strong>Date Needed:</strong> ${formData.date}</p>
                <p><strong>Time Needed:</strong> ${formData.time}</p>
                <p><strong>Notes:</strong> ${formData.notes || 'None'}</p>

                <h3 style="border-bottom: 2px solid #e0d5ce; padding-bottom: 10px; color: #4a3f39;">Order Items</h3>
                <ul style="list-style: none; padding: 0;">
                  ${itemsHtml}
                </ul>
                
                ${discountHtml}

                <h2 style="text-align: right; color: #4a3f39; margin-top: 20px;">Total Paid: $${amount}</h2>
                <p style="text-align: center; color: #888; font-size: 12px; margin-top: 40px;">
                  This is an automated message from the CK Cake Lounge Secure Checkout System.
                </p>
              </div>
            `
          });
        }
      } catch (e) {
        console.error("Failed to send Resend email:", e);
      }
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
