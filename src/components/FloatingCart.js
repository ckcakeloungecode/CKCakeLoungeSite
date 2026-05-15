'use client';

import { useCart } from '../context/CartContext';
import styles from './FloatingCart.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FloatingCart() {
  const router = useRouter();
  const { 
    cartItems, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal,
    isLoaded
  } = useCart();

  if (!isLoaded) return null; // Wait for localStorage to load to prevent hydration mismatch

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.cartOverlay} ${isCartOpen ? styles.open : ''}`} 
        onClick={toggleCart}
      />

      {/* Slide-out Drawer */}
      <div className={`${styles.cartDrawer} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.cartHeader}>
          <h2>Your Cart</h2>
          <button className={styles.closeBtn} onClick={toggleCart}>✕</button>
        </div>

        <div className={styles.cartItems}>
          {cartItems.length === 0 ? (
            <p className={styles.emptyCart}>Your cart is currently empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartItemId} className={styles.cartItem}>
                <div 
                  className={styles.itemImage} 
                  style={{ backgroundImage: item.displayImage ? `url(${item.displayImage})` : 'none' }}
                />
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  
                  {/* Variant info: Only show size/flavor if they exist and aren't default "Standard/Original" if those aren't helpful, but let's just show them if they exist */}
                  <div className={styles.itemVariant}>
                    {[item.size !== 'Standard' && item.size, item.flavor !== 'Original' && item.flavor].filter(Boolean).join(' • ')}
                  </div>
                  
                  <div className={styles.itemPrice}>${Number(item.price).toFixed(2)}</div>
                  
                  {item.isPhotoCake && (
                    <span className={styles.photoCakeBadge}>+ Photo Cake</span>
                  )}
                  
                  <div className={styles.quantityControls}>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  className={styles.removeBtn} 
                  onClick={() => removeFromCart(item.cartItemId)}
                  title="Remove Item"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.subtotalRow}>
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {/* Checkout action */}
          <button 
            className={`btn-primary ${styles.checkoutBtn}`} 
            disabled={cartItems.length === 0}
            onClick={() => {
              toggleCart();
              router.push('/checkout');
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}
