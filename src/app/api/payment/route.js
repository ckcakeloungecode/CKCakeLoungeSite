import { SquareClient, SquareEnvironment } from 'square';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Uses Sandbox for testing, Production for real money
const isProduction = process.env.NODE_ENV === 'production';

export async function POST(req) {
  try {
    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    const { sourceId, amount } = await req.json();

    if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN.includes('YOUR_SANDBOX')) {
        return NextResponse.json({ success: false, error: 'Square Access Token is missing or invalid on the server.' }, { status: 500 });
    }

    // Square API requires amounts to be passed as integers representing the smallest denomination (cents).
    const amountInCents = Math.round(amount * 100);

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
    
    return NextResponse.json({ success: true, paymentId }, { status: 200 });

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
