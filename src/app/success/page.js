'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function SuccessPage() {
  const [waLink, setWaLink] = useState('');
  const [isQuote, setIsQuote] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const ticketData = sessionStorage.getItem('lastOrderTicket');
    if (ticketData) {
      try {
        const order = JSON.parse(ticketData);
        setIsQuote(!!order.isQuote);
        setCustomerName(`${order.firstName} ${order.lastName}`.trim());

        let msg = '';
        if (order.isQuote) {
          const receiptId = order.receiptId;
          msg = `🎂 *New Custom Cake Quote Request!* 🎂%0A%0A`;
          msg += `*Customer:* ${order.firstName} ${order.lastName}%0A`;
          msg += `*Phone:* ${order.phone}%0A%0A`;

          if (receiptId) {
            const baseUrl = window.location.origin;
            const secureLink = `${baseUrl}/receipt/${receiptId}`;
            msg += `*View Secure Quote Ticket here:*%0A${secureLink}%0A%0A`;
          } else {
            msg += `(Error: Quote ID missing. Please check email for full details.)%0A%0A`;
          }
          msg += `Please provide me with a custom quote for this order. Thank you!%0A%0A`;
          msg += `(This is an automated, tamper-proof notification)`;
        } else {
          // Standard order
          const receiptId = order.receiptId;
          msg = `🎂 *New Paid Order Received!* 🎂%0A%0A`;
          msg += `*Customer:* ${order.firstName} ${order.lastName}%0A`;
          msg += `*Phone:* ${order.phone}%0A%0A`;
          
          if (receiptId) {
            const baseUrl = window.location.origin;
            const secureLink = `${baseUrl}/receipt/${receiptId}`;
            msg += `*View Secure Order Ticket here:*%0A${secureLink}%0A%0A`;
          } else {
            msg += `(Error: Receipt ID missing. Please check email for full details.)%0A%0A`;
          }
          msg += `(This is an automated, tamper-proof notification)`;
        }

        // WhatsApp number: 16478643713
        setWaLink(`https://wa.me/16478643713?text=${msg}`);
      } catch (e) {
        console.error('Error parsing order/quote ticket', e);
      }
    }
  }, []);

  return (
    <main className="container" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>🎉</h1>
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
          {isQuote ? 'Quote Requested!' : 'Payment Successful!'}
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-dark)' }}>
          {isQuote 
            ? `Thank you, ${customerName || 'Customer'}! Your custom cake quote request has been submitted to the bakery.`
            : 'Thank you for choosing CK Cake Lounge! Your secure payment has been processed.'}
        </p>
        
        {waLink && (
          <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '3rem' }}>
            <h3 style={{ color: '#166534', marginBottom: '1rem' }}>
              {isQuote ? 'Step 2: Send Quote Specifications' : 'Step 2: Send Your Order Ticket'}
            </h3>
            <p style={{ color: '#15803d', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {isQuote
                ? 'Click below to send your quote details and reference photo directly to the bakery via WhatsApp so they can review it!'
                : 'Click below to send your order details directly to the bakery via WhatsApp so they can begin preparing it!'}
            </p>
            <a 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#25D366',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
              }}
            >
              {isQuote ? '📱 Send Quote Details via WhatsApp' : '📱 Send Order via WhatsApp'}
            </a>
          </div>
        )}

        <Link href="/menu" className="btn-primary">
          Return to Menu
        </Link>
      </div>
    </main>
  );
}
