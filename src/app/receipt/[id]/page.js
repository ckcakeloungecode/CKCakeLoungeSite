import { supabaseAdmin } from '../../../../src/utils/supabaseAdmin';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

export default async function ReceiptPage({ params }) {
  // In Next.js 15+, params is a Promise and must be awaited
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Fetch the ticket from Supabase using the secure Admin client
  const { data: ticket, error } = await supabaseAdmin
    .from('store_orders')
    .select('*')
    .eq('id', id)
    .single();

  // If the ID is invalid or the query fails, show a 404 page
  if (error || !ticket) {
    notFound();
  }

  // Render the un-editable, secure digital ticket
  return (
    <main className="container" style={{ padding: '4rem 1rem', minHeight: 'calc(100vh - 80px)' }}>
      <div className={styles.receiptPaper}>
        <div className={styles.receiptHeader}>
          <h1>CK Cake Lounge</h1>
          <p>Official Digital Order Ticket</p>
          <div className={styles.ticketId}>TICKET ID: {ticket.id}</div>
          <div className={styles.ticketStatus}>{ticket.status.toUpperCase()}</div>
        </div>

        <div className={styles.receiptBody}>
          <div className={styles.section}>
            <h3>Customer</h3>
            <p className={styles.highlight}>{ticket.customer_name}</p>
            <p>{ticket.phone}</p>
            <p>{ticket.email}</p>
          </div>

          <div className={styles.section}>
            <h3>Fulfillment Details</h3>
            <p className={styles.highlight}>{ticket.order_type.toUpperCase()}</p>
            <p><strong>Date Needed:</strong> {ticket.delivery_date}</p>
            <p><strong>Time Needed:</strong> {ticket.delivery_time}</p>
            {ticket.order_type === 'delivery' && (
              <p><strong>Address:</strong> {ticket.delivery_address}</p>
            )}
            {ticket.notes && (
              <p><strong>Special Notes:</strong> {ticket.notes}</p>
            )}
          </div>

          <div className={styles.section}>
            <h3>Order Items</h3>
            <ul className={styles.itemList}>
              {ticket.cart_items.map((item, idx) => (
                <li key={idx} className={styles.itemRow}>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.quantity}x {item.name}</span>
                    <span className={styles.itemMeta}>
                      {[item.size !== 'Standard' && item.size, item.flavor !== 'Original' && item.flavor, item.isPhotoCake && 'Photo Cake'].filter(Boolean).join(' • ')}
                    </span>
                    {item.photoUrl && (
                      <a href={item.photoUrl} target="_blank" rel="noopener noreferrer" className={styles.photoLinkBtn}>
                        📸 View High-Res Attached Photo
                      </a>
                    )}
                  </div>
                  <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            
            {ticket.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', color: '#16a34a', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px dashed #ccc', paddingTop: '1rem' }}>
                <span>Discount ({ticket.coupon_code})</span>
                <span>-${Number(ticket.discount_amount).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className={styles.totals}>
            <h2>Total Paid: ${Number(ticket.total_amount).toFixed(2)}</h2>
            <p className={styles.paymentId}>Square Payment ID: {ticket.payment_id}</p>
          </div>
        </div>
        
        <div className={styles.printAction}>
          <p>🔒 This is a secure, read-only digital receipt generated directly from the CK Cake Lounge database.</p>
        </div>
      </div>
    </main>
  );
}
