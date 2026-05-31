'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../checkout/page.module.css';

export default function CustomQuotePage() {
  const router = useRouter();
  const [quoteItem, setQuoteItem] = useState(null);
  const orderType = 'pickup';
  const distanceKm = 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [isBlockedDatesLoading, setIsBlockedDatesLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'London',
    province: 'ON',
    notes: '',
    date: '',
    time: ''
  });

  // Load quote item from sessionStorage
  useEffect(() => {
    const itemData = sessionStorage.getItem('pendingQuoteItem');
    if (itemData) {
      try {
        setQuoteItem(JSON.parse(itemData));
      } catch (e) {
        console.error("Failed to parse pendingQuoteItem:", e);
      }
    }
  }, []);

  // Fetch calendar blocked dates
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await fetch('/api/blocked-dates');
        const data = res.ok ? await res.json() : null;
        if (data && data.success) {
          setBlockedDates(data.blockedDates || []);
        }
      } catch (err) {
        console.error("Failed to load blocked dates:", err);
      } finally {
        setIsBlockedDatesLoading(false);
      }
    };
    fetchBlockedDates();
  }, []);

  // Date and Time Constraints: Custom cakes require at least a 12-hour lead time.
  const today = new Date();
  const twelveHoursFromNow = new Date(today.getTime() + 12 * 60 * 60 * 1000);
  
  const year = twelveHoursFromNow.getFullYear();
  const month = String(twelveHoursFromNow.getMonth() + 1).padStart(2, '0');
  const day = String(twelveHoursFromNow.getDate()).padStart(2, '0');
  const minDateString = `${year}-${month}-${day}`;

  const hours = String(twelveHoursFromNow.getHours()).padStart(2, '0');
  const minutes = String(twelveHoursFromNow.getMinutes()).padStart(2, '0');
  const dynamicMinTimeString = `${hours}:${minutes}`;
  const minTimeString = formData.date === minDateString ? dynamicMinTimeString : "";

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      let newDate = value;
      if (blockedDates.includes(value)) {
        alert("This date is fully booked or unavailable for orders. Please select another date.");
        newDate = '';
      }
      
      setFormData(prev => {
        let newTime = prev.time;
        if (newDate === minDateString && prev.time && prev.time < dynamicMinTimeString) {
          newTime = dynamicMinTimeString;
        }
        return {
          ...prev,
          date: newDate,
          time: newTime
        };
      });
      return;
    }

    if (name === 'time') {
      let newTime = value;
      if (formData.date === minDateString && value < dynamicMinTimeString) {
        alert(`For today's orders, the earliest available time is ${dynamicMinTimeString} to allow for preparation (12 hours advance notice).`);
        newTime = dynamicMinTimeString;
      }
      setFormData(prev => ({
        ...prev,
        time: newTime
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const deliveryFee = 0;

  const handleSubmitQuote = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email || !formData.phone || !formData.date || !formData.time) {
      alert("Please fill out all required fields.");
      return;
    }

    if (blockedDates.includes(formData.date)) {
      alert("The selected date is fully booked or unavailable. Please choose another date.");
      return;
    }

    if (formData.date === minDateString && formData.time < dynamicMinTimeString) {
      alert(`For today's orders, the earliest available time is ${dynamicMinTimeString} (12 hours advance notice).`);
      return;
    }

    setIsSubmitting(true);

    const subtotal = quoteItem ? quoteItem.price * quoteItem.quantity : 0;
    const hstTax = 0;
    const grandTotal = subtotal + deliveryFee;

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isQuoteOnly: true,
          isCustomQuoteRequest: true,
          amount: grandTotal,
          formData,
          cartItems: [quoteItem],
          orderType,
          distanceKm
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save quote ticket details to sessionStorage for the success page
        const quoteTicket = {
          ...formData,
          orderType,
          distanceKm,
          cartItems: [quoteItem],
          cartTotal: subtotal,
          deliveryFee,
          hstTax,
          grandTotal,
          receiptId: data.receiptId,
          isQuote: true // Identifies it as a quote notification on the success screen
        };
        sessionStorage.setItem('lastOrderTicket', JSON.stringify(quoteTicket));
        sessionStorage.removeItem('pendingQuoteItem'); // Clear temporary item
        
        router.push('/success');
      } else {
        alert(data.error || "Failed to submit quote request. Please try again.");
      }
    } catch (err) {
      console.error("Quote submission error:", err);
      alert("Network error submitting quote request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quoteItem) {
    return (
      <div className={`container ${styles.emptyState}`} style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2>No quote request details found!</h2>
        <p>Please browse our Custom Cakes catalog and choose a flavor first.</p>
        <br />
        <Link href="/cakes" className="btn-primary">View Custom Cakes</Link>
      </div>
    );
  }

  const subtotal = quoteItem.price * quoteItem.quantity;
  const hstTax = 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <main className={`container ${styles.checkoutContainer}`}>
      <h1 className={styles.checkoutTitle}>Request Custom Cake Quote</h1>
      <p style={{ textAlign: 'center', color: '#6b5a52', marginTop: '-1rem', marginBottom: '2.5rem' }}>
        Provide your details and order specifications. We will review them and send you a custom invoice!
      </p>

      <form onSubmit={handleSubmitQuote} className={styles.checkoutLayout}>
        {/* LEFT COLUMN: FORM */}
        <div className={styles.checkoutForm}>
          
          <div className={styles.formSection}>
            <h2>Contact Information</h2>
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>First Name *</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
              </div>
            </div>
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Email Address *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
              </div>
              <div className={styles.inputGroup}>
                <label>Phone Number *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Fulfillment Method</h2>
            <p style={{ fontWeight: '600', color: '#4a3f39', marginBottom: '0.8rem' }}>Store Pickup Only</p>
            <div className={styles.mockDistanceBox}>
              <strong>Pickup Location:</strong><br />
              CK Cake Lounge<br />
              Evans Blvd, London, ON N6M 0A8
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Order Schedule Details</h2>
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Requested Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  min={minDateString}
                  value={formData.date} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Requested Time *</label>
                <input 
                  type="time" 
                  name="time" 
                  required 
                  min={minTimeString}
                  value={formData.time} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Design Notes / Messages on Cake</label>
              <textarea 
                name="notes" 
                rows="3" 
                placeholder="e.g. Please use pink frosting and add gold details. Write 'Happy Sweet 16' on top."
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SUMMARY & SUBMIT */}
        <div className={styles.orderSummary}>
          <h2>Quote Item Specifications</h2>
          
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryItemDetails}>
                <span className={styles.summaryItemName}>{quoteItem.quantity}x {quoteItem.name}</span>
                <span className={styles.summaryItemMeta}>
                  {`Flavor: ${quoteItem.flavor} • Size: Standard`}
                </span>
                {quoteItem.photoUrl && (
                  <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Reference Photo Attached
                  </div>
                )}
              </div>
              <span className={styles.summaryItemPrice}>Starts from ${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.totalRow}>
              <span>Est. Base Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.grandTotalRow}>
              <span>Est. Starting Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn-primary ${styles.placeOrderBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Get Custom Quote"}
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#15803d', marginTop: '1.2rem', fontWeight: 'bold' }}>
            ✓ Zero Payment Required at this stage. Submit details to receive your customized quote.
          </p>
        </div>
      </form>
    </main>
  );
}
