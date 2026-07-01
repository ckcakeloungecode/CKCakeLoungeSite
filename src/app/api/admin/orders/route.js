import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../utils/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

const isProduction = !process.env.NEXT_PUBLIC_SQUARE_APP_ID?.startsWith('sandbox-');

// Helper to authenticate administrator against BAKERY_EMAIL
async function authenticateAdmin(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Use a fresh guest client initialized with the token to check authorization
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error } = await tempClient.auth.getUser(token);
    if (error || !user) {
      console.error("Auth verification failed:", error);
      return null;
    }

    if (user.email?.toLowerCase() === process.env.BAKERY_EMAIL?.toLowerCase()) {
      return user;
    }
    return null;
  } catch (err) {
    console.error("authenticateAdmin error:", err);
    return null;
  }
}

export async function GET(req) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('store_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json({ error: 'Database failed to query orders.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error) {
    console.error("Admin GET Orders Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, newStatus, refundReason } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing orderId or newStatus parameters.' }, { status: 400 });
    }

    // 1. If transitioning to refunded, call Square API
    if (newStatus === 'refunded') {
      const { data: order, error: fetchError } = await supabaseAdmin
        .from('store_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      }

      if (order.status !== 'paid' && order.status !== 'completed') {
        return NextResponse.json({ error: 'Only paid or completed orders can be refunded.' }, { status: 400 });
      }

      if (!order.payment_id || order.payment_id.startsWith('processing_') || order.payment_id.startsWith('failed_')) {
        // If it's a sandbox/mock transaction, we can skip Square and allow the DB refund
        if (order.payment_id === 'sandbox_success_id' || !isProduction) {
          console.log("Sandbox transaction refund simulated without Square API call.");
        } else {
          return NextResponse.json({ error: 'Order has no valid Square payment ID associated.' }, { status: 400 });
        }
      } else {
        // Call Square to issue full refund
        const amountInCents = Math.round(order.total_amount * 100);
        const client = new SquareClient({
          token: process.env.SQUARE_ACCESS_TOKEN,
          environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
        });

        try {
          const refundResponse = await client.refunds.refundPayment({
            idempotencyKey: crypto.randomUUID(),
            amountMoney: {
              amount: BigInt(amountInCents),
              currency: 'CAD'
            },
            paymentId: order.payment_id,
            reason: refundReason || 'Customer requested cancellation'
          });
          
          console.log("Square Refund Success:", refundResponse);
        } catch (squareError) {
          console.error("Square Refund API Error:", squareError);
          let errorDetail = squareError.errors?.[0]?.detail || squareError.message || String(squareError);
          return NextResponse.json({ error: `Square refund failed: ${errorDetail}` }, { status: 400 });
        }
      }
    }

    // 2. Perform database update
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('store_orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update order status:", updateError);
      return NextResponse.json({ error: 'Failed to update order status in database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });

  } catch (error) {
    console.error("Admin PUT Orders Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
