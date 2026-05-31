'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SquarePaymentForm from '../../components/SquarePaymentForm';
import AuthModal from '../../components/AuthModal';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cartItems, cartTotal, isLoaded, clearCart } = useCart();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orderType, setOrderType] = useState('pickup');
  const [postalCode, setPostalCode] = useState('');
  const [isReadyToPay, setIsReadyToPay] = useState(false);
  
  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const isQuoteOnly = cartItems.some(item => item.category === 'Cakes');
  
  // Professional Fallback: Manual Distance Selection until a paid API Key is provided
  const [distanceKm, setDistanceKm] = useState(0);

  // Database-Driven Calendar Blockouts
  const [blockedDates, setBlockedDates] = useState([]);
  const [isBlockedDatesLoading, setIsBlockedDatesLoading] = useState(true);

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
  
  // Form Data State
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

  // --- Date & Time Constraints ---
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minDateString = `${year}-${month}-${day}`;

  const oneHourFromNow = new Date(today.getTime() + 60 * 60 * 1000);
  const hours = String(oneHourFromNow.getHours()).padStart(2, '0');
  const minutes = String(oneHourFromNow.getMinutes()).padStart(2, '0');
  const dynamicMinTimeString = `${hours}:${minutes}`;
  
  // Only apply min time restrict to the HTML input if the selected date is today
  const minTimeString = formData.date === minDateString ? dynamicMinTimeString : "";

  // Auto-fill contact info when the user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.user_metadata?.first_name || prev.firstName,
        lastName: user.user_metadata?.last_name || prev.lastName,
        email: user.email || prev.email,
        phone: user.user_metadata?.phone_number || prev.phone
      }));
    }
  }, [user]);

  const deliveryFee = (() => {
    if (orderType !== 'delivery' || distanceKm <= 0) return 0;
    if (distanceKm <= 5) return 0;
    
    const roundedKm = Math.ceil(distanceKm);
    if (roundedKm === 6) return 4.99;
    return 4.99 + (roundedKm - 6);
  })();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal, email: user?.email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setCouponError(data.error || 'Failed to apply coupon.');
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          id: data.couponId
        });
        setCouponInput('');
      }
    } catch (e) {
      setCouponError("Network error. Try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Dynamic Math (Tax is calculated AFTER the discount is applied to the subtotal)
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, cartTotal - discountAmount);
  const hstTax = (discountedSubtotal + deliveryFee) * 0.13;
  const grandTotal = discountedSubtotal + deliveryFee + hstTax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      let newDate = value;
      // Calendar Blockout Check
      if (blockedDates.includes(value)) {
        alert("This date is fully booked or unavailable for orders. Please select another date.");
        newDate = '';
      }
      
      setFormData(prev => {
        let newTime = prev.time;
        // Verify time constraint for today's orders
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
        alert(`For today's orders, the earliest available time is ${dynamicMinTimeString} to allow for preparation.`);
        newTime = dynamicMinTimeString;
      }
      setFormData(prev => ({
        ...prev,
        time: newTime
      }));
      return;
    }

    // Default handler for all other text inputs (firstName, lastName, email, phone, address, notes)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // Validate minimal required fields
    if (!formData.firstName || !formData.email || !formData.phone || !formData.date || !formData.time) {
      alert("Please fill out all required fields.");
      return;
    }

    if (blockedDates.includes(formData.date)) {
      alert("The selected date is fully booked or unavailable. Please choose another date.");
      return;
    }

    if (formData.date === minDateString && formData.time < dynamicMinTimeString) {
      alert(`For today's orders, the earliest available time is ${dynamicMinTimeString}.`);
      return;
    }

    if (orderType === 'delivery' && (!formData.address || !postalCode)) {
      alert("Please provide a full delivery address and postal code.");
      return;
    }

    // Save ticket data to sessionStorage for the WhatsApp success page
    const orderTicket = {
      ...formData,
      orderType,
      distanceKm,
      cartItems,
      cartTotal,
      deliveryFee,
      discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      hstTax,
      grandTotal
    };
    sessionStorage.setItem('lastOrderTicket', JSON.stringify(orderTicket));

    if (isQuoteOnly) {
      setIsSubmittingQuote(true);
      fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isQuoteOnly: true,
          amount: grandTotal,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          discountAmount,
          formData,
          cartItems,
          orderType,
          distanceKm
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          handlePaymentSuccess(data.receiptId);
        } else {
          alert(data.error || "Failed to submit quote request. Please try again.");
        }
      })
      .catch(err => {
        console.error("Quote submit error:", err);
        alert("Network error submitting quote request.");
      })
      .finally(() => {
        setIsSubmittingQuote(false);
      });
    } else {
      // Transition to the secure Square payment form instead of instantly completing
      setIsReadyToPay(true);
    }
  };

  const handlePaymentSuccess = (receiptId) => {
    // Save the DB receipt ID into our session storage
    if (receiptId) {
      try {
        const ticket = JSON.parse(sessionStorage.getItem('lastOrderTicket') || '{}');
        ticket.receiptId = receiptId;
        sessionStorage.setItem('lastOrderTicket', JSON.stringify(ticket));
      } catch (e) {
        console.error("Failed to append receipt ID", e);
      }
    }

    // Clear cart and redirect to success after real payment
    clearCart();
    router.push('/success');
  };

  const handlePaymentCancel = () => {
    setIsReadyToPay(false);
  };

  if (!isLoaded) return <div className={styles.emptyState}>Loading...</div>;

  if (cartItems.length === 0) {
    return (
      <div className={`container ${styles.emptyState}`}>
        <h2>Your cart is empty!</h2>
        <p>You need to add some delicious treats before you can checkout.</p>
        <br />
        <Link href="/menu" className="btn-primary">Return to Menu</Link>
      </div>
    );
  }

  return (
    <main className={`container ${styles.checkoutContainer}`}>
      <h1 className={styles.checkoutTitle}>Secure Checkout</h1>

      <form onSubmit={handlePlaceOrder} className={styles.checkoutLayout}>
        {/* LEFT COLUMN */}
        <div className={styles.checkoutForm}>
          
          <div className={styles.formSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Contact Information</h2>
              {user && (
                <button type="button" onClick={() => signOut()} style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Sign Out
                </button>
              )}
            </div>
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
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input 
                  type="radio" 
                  name="orderType" 
                  value="pickup" 
                  checked={orderType === 'pickup'} 
                  onChange={() => setOrderType('pickup')} 
                />
                Store Pickup
              </label>
              <label className={styles.radioOption}>
                <input 
                  type="radio" 
                  name="orderType" 
                  value="delivery" 
                  checked={orderType === 'delivery'} 
                  onChange={() => setOrderType('delivery')} 
                />
                Local Delivery
              </label>
            </div>

            {orderType === 'pickup' ? (
              <div className={styles.mockDistanceBox}>
                <strong>Pickup Location:</strong><br />
                CK Cake Lounge<br />
                Evans Blvd, London, ON N6M 0A8
              </div>
            ) : (
              <div className="animate-in">
                <div className={styles.inputGroup}>
                  <label>Street Address *</label>
                  <input type="text" name="address" required={orderType === 'delivery'} value={formData.address} onChange={handleInputChange} />
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} readOnly />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Postal Code *</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      placeholder="e.g. N6M 1A1" 
                      required={orderType === 'delivery'} 
                      value={postalCode} 
                      onChange={(e) => setPostalCode(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Estimated Distance from Bakery (Evans Blvd) *</label>
                  <select 
                    required={orderType === 'delivery'} 
                    value={distanceKm} 
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                  >
                    <option value={0}>Select distance...</option>
                    <option value={5}>0 - 5 km (Free)</option>
                    <option value={6}>6 km ($4.99)</option>
                    <option value={7}>7 km ($5.99)</option>
                    <option value={8}>8 km ($6.99)</option>
                    <option value={9}>9 km ($7.99)</option>
                    <option value={10}>10 km ($8.99)</option>
                    <option value={15}>10+ km (Calculated upon review)</option>
                  </select>
                </div>
                
                {/* Delivery UI Feedback */}
                {distanceKm > 0 && (
                  <div className={styles.mockDistanceBox}>
                    {distanceKm <= 5 ? (
                      <span style={{color: 'green'}}>You qualify for FREE delivery! 🎉</span>
                    ) : distanceKm >= 15 ? (
                      <span>That's a bit far! We will contact you with a custom delivery quote.</span>
                    ) : (
                      <span>Delivery Fee: ${deliveryFee.toFixed(2)}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.formSection}>
            <h2>Order Details</h2>
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
              <label>Special Instructions / Cake Messages</label>
              <textarea 
                name="notes" 
                rows="3" 
                placeholder="e.g. Please write 'Happy Birthday Sarah' on the cake"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>
          
          <div className={styles.summaryItems}>
            {cartItems.map(item => (
              <div key={item.cartItemId} className={styles.summaryItem}>
                <div className={styles.summaryItemDetails}>
                  <span className={styles.summaryItemName}>{item.quantity}x {item.name}</span>
                  <span className={styles.summaryItemMeta}>
                    {[item.size !== 'Standard' && item.size, item.flavor !== 'Original' && item.flavor, item.isPhotoCake && 'Photo Cake'].filter(Boolean).join(' • ')}
                  </span>
                  {item.photoUrl && (
                    <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      High-Res Photo Attached
                    </div>
                  )}
                </div>
                <span className={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* COUPON SECTION */}
          {!isReadyToPay && (
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid #e0d5ce', borderBottom: '1px solid #e0d5ce', padding: '1.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#6b5a52', margin: 0 }}>Promo Code</h3>
              </div>
              
              {!user ? (
                <div style={{ background: '#fdfaf9', padding: '1rem', borderRadius: '8px', border: '1px solid #e0d5ce', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: '#6b5a52', marginBottom: '0.8rem' }}>
                    You must have an account to use promotional discounts.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setIsAuthModalOpen(true)}
                    style={{ background: '#c98c6b', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Log In / Sign Up
                  </button>
                </div>
              ) : appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#dcfce7', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px dashed #22c55e' }}>
                  <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ {appliedCoupon.code} Applied</span>
                  <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code here"
                    style={{ flex: 1, padding: '0.8rem', border: '1px solid #c4b6b0', borderRadius: '8px' }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    style={{ padding: '0 1.2rem', background: '#4a3f39', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponError}</div>}
            </div>
          )}

          <div className={styles.summaryTotals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className={styles.totalRow} style={{ color: '#16a34a', fontWeight: 'bold' }}>
                <span>Discount ({appliedCoupon.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            {orderType === 'delivery' && (
              <div className={styles.totalRow}>
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>HST (13%)</span>
              <span>${hstTax.toFixed(2)}</span>
            </div>
            <div className={styles.grandTotalRow}>
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {isQuoteOnly ? (
            <>
              <button 
                type="submit" 
                className={`btn-primary ${styles.placeOrderBtn}`} 
                disabled={isSubmittingQuote}
              >
                {isSubmittingQuote ? 'Submitting Request...' : 'Submit Quote Request'}
              </button>
              <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#16a34a', marginTop: '1rem', fontWeight: 'bold'}}>
                ✓ Custom quote request. You will not be charged anything at this stage.
              </p>
            </>
          ) : !isReadyToPay ? (
            <>
              <button type="submit" className={`btn-primary ${styles.placeOrderBtn}`}>
                Proceed to Payment
              </button>
              
              <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#6b5a52', marginTop: '1rem'}}>
                Clicking this will generate the secure Square checkout form to enter your credit card.
              </p>
            </>
          ) : (
            <SquarePaymentForm 
              amount={grandTotal} 
              couponCode={appliedCoupon ? appliedCoupon.code : null}
              discountAmount={discountAmount}
              formData={formData}
              cartItems={cartItems}
              orderType={orderType}
              distanceKm={distanceKm}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </div>
      </form>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}
