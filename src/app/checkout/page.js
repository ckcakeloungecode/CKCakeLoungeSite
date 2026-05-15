'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SquarePaymentForm from '../../components/SquarePaymentForm';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cartItems, cartTotal, isLoaded, clearCart } = useCart();
  const router = useRouter();

  const [orderType, setOrderType] = useState('pickup');
  const [postalCode, setPostalCode] = useState('');
  const [isReadyToPay, setIsReadyToPay] = useState(false);
  
  // Professional Fallback: Manual Distance Selection until a paid API Key is provided
  const [distanceKm, setDistanceKm] = useState(0);
  
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

  // (Removed unreliable free API fetch block)

  const deliveryFee = (() => {
    if (orderType !== 'delivery' || distanceKm <= 0) return 0;
    if (distanceKm <= 5) return 0;
    
    // Math.ceil ensures that 6.1km counts as 7km for pricing brackets, keeping it simple.
    // If it's exactly 6.0, ceil is 6.
    const roundedKm = Math.ceil(distanceKm);
    if (roundedKm === 6) return 4.99;
    return 4.99 + (roundedKm - 6); // $4.99 base + $1 for every km over 6
  })();

  const hstTax = (cartTotal + deliveryFee) * 0.13;
  const grandTotal = cartTotal + deliveryFee + hstTax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // Validate minimal required fields
    if (!formData.firstName || !formData.email || !formData.phone || !formData.date) {
      alert("Please fill out all required fields.");
      return;
    }

    if (orderType === 'delivery' && (!formData.address || !postalCode)) {
      alert("Please provide a full delivery address and postal code.");
      return;
    }

    // Transition to the secure Square payment form instead of instantly completing
    setIsReadyToPay(true);
  };

  const handlePaymentSuccess = () => {
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
                <input type="date" name="date" required value={formData.date} onChange={handleInputChange} />
              </div>
              <div className={styles.inputGroup}>
                <label>Requested Time *</label>
                <input type="time" name="time" required value={formData.time} onChange={handleInputChange} />
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
                </div>
                <span className={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
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

          {!isReadyToPay ? (
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
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </div>
      </form>
    </main>
  );
}
