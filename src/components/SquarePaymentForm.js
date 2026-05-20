'use client';

import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { useState } from 'react';

export default function SquarePaymentForm({ amount, couponCode, discountAmount, formData, cartItems, orderType, distanceKm, onSuccess, onCancel }) {
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

  if (!appId || !locationId || appId.includes('YOUR_SANDBOX_APP_ID')) {
    return (
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', border: '1px solid #c62828'}}>
        <strong>Square API Keys Missing!</strong><br/>
        Please update your `.env.local` file with your actual Square Sandbox keys from the Developer Dashboard.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--accent)'}}>
      <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>Secure Payment Details</h3>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
      
      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
          setIsProcessing(true);
          setError(null);
          try {
            // Send the secure token to our backend to actually process the charge
            const res = await fetch('/api/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sourceId: token.token,
                amount: amount,
                couponCode: couponCode,
                discountAmount: discountAmount,
                formData: formData,
                cartItems: cartItems,
                orderType: orderType,
                distanceKm: distanceKm
              }),
            });

            const data = await res.json();
            
            if (res.ok && data.success) {
              onSuccess(data.receiptId); // Triggers cart clear & redirect
            } else {
              setError(data.error || 'Payment failed. Please try again.');
            }
          } catch (e) {
            setError('Network error processing payment.');
          } finally {
            setIsProcessing(false);
          }
        }}
      >
        <CreditCard 
          buttonProps={{
            css: {
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontSize: '16px',
              fontFamily: 'var(--font-heading)',
              padding: '12px',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'var(--text-dark)',
              }
            }
          }}
        />
      </PaymentForm>

      {isProcessing && <p style={{marginTop: '1rem', color: 'var(--accent)', fontWeight: 'bold'}}>Processing your payment... Please do not close this window.</p>}
      
      <button 
        onClick={onCancel}
        style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: '#6b5a52', cursor: 'pointer', textDecoration: 'underline' }}
        disabled={isProcessing}
        type="button"
      >
        Cancel and go back
      </button>
    </div>
  );
}
