import Link from 'next/link';
import styles from './page.module.css';

// Re-using some checkout styles for simplicity or inline styling
export default function SuccessPage() {
  return (
    <main className="container" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>🎉</h1>
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Order Received!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-dark)' }}>
          Thank you for choosing CK Cake Lounge! Your order has been successfully placed. 
        </p>
        <p style={{ marginBottom: '3rem', color: '#6b5a52' }}>
          We will contact you shortly to confirm your requested date and time.
        </p>
        
        <Link href="/menu" className="btn-primary">
          Order More Treats
        </Link>
      </div>
    </main>
  );
}
