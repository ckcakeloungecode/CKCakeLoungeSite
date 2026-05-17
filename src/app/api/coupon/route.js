import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../utils/supabaseAdmin';

export async function POST(request) {
  try {
    const { code, cartTotal, email } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code.' }, { status: 400 });
    }

    // 1. Fetch the coupon securely using Admin Client
    const { data: coupon, error } = await supabaseAdmin
      .from('store_coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    // 2. Validation Checks
    if (!coupon.is_active) {
      return NextResponse.json({ error: 'This coupon is no longer active.' }, { status: 400 });
    }

    // 🚨 ONE-TIME USE VALIDATION 🚨
    if (coupon.is_one_time_use) {
      if (!email) {
        return NextResponse.json({ error: 'You must be logged in with an account to use this coupon.' }, { status: 401 });
      }

      // Query past orders to see if this email has ever used this exact coupon code before
      const { data: pastOrders } = await supabaseAdmin
        .from('store_orders')
        .select('id')
        .eq('email', email)
        .eq('coupon_code', coupon.code);

      if (pastOrders && pastOrders.length > 0) {
        return NextResponse.json({ error: 'You have already used this coupon code on a previous order.' }, { status: 403 });
      }
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
    }

    if (cartTotal < coupon.min_spend) {
      return NextResponse.json({ error: `This coupon requires a minimum spend of $${coupon.min_spend.toFixed(2)}.` }, { status: 400 });
    }

    // 3. Calculate Discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = cartTotal * (coupon.discount_value / 100);
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = coupon.discount_value;
    }

    // Ensure we don't discount more than the cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
      success: true,
      couponId: coupon.id,
      code: coupon.code,
      discountAmount: discountAmount
    });

  } catch (err) {
    console.error("Coupon Validation Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
