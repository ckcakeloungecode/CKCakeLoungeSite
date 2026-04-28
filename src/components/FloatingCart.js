'use client';

import { useCart } from '../context/CartContext';
import styles from './FloatingCart.module.css';

export default function FloatingCart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) {
    return (
      <button 
        className={styles.cartToggleButton} 
        onClick={() => setIsCartOpen(true)}
      >
        🛒 Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
      </button>
    );
  }

  return (
    <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
      <div className={styles.cartDrawer} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Your Cart</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <p className={styles.emptyMsg}>Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <h4>{item.product.name}</h4>
                  <p className={styles.variantInfo}>
                    {item.variant ? `${item.variant.size} - ${item.variant.flavor}` : 'Standard'}
                  </p>
                  <p className={styles.price}>
                    ${item.variant ? item.variant.price : item.product.base_price}
                  </p>
                </div>
                
                <div className={styles.itemControls}>
                  <div className={styles.quantityControl}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <strong>${cartTotal}</strong>
            </div>
            <button className={`btn-primary ${styles.checkoutBtn}`}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
