'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';
import cartStyles from './FloatingCart.module.css';

export default function Navbar() {
  const { toggleCart, cartCount, isLoaded } = useCart();

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          CK Cake Lounge
        </Link>
        <div className={styles.navLinks}>
          <Link href="/menu" className={styles.navLink}>
            Everyday Menu
          </Link>
          <Link href="/special-cakes" className={`${styles.navLink} ${styles.specialLink}`}>
            Special Cakes
          </Link>
          
          {/* Cart Icon */}
          <button className={cartStyles.cartToggleBtn} onClick={toggleCart} aria-label="Open Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {isLoaded && cartCount > 0 && (
              <span className={cartStyles.cartBadge}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
