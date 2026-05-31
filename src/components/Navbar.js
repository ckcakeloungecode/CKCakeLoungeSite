'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';
import cartStyles from './FloatingCart.module.css';

export default function Navbar() {
  const { toggleCart, cartCount, isLoaded } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/menu');
    }
  };

  return (
    <header className={styles.header}>
      {/* Top Bar announcement info matching Rashmi's Bakery style */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContainer}`}>
          <div className={styles.topBarLeft}>
            <span>📍 London, ON</span>
            <span className={styles.separator}>•</span>
            <span>⏰ Open Daily: 9 AM - 6 PM</span>
          </div>
          <div className={styles.topBarRight}>
            <span>🥜 100% Nut-Free Facility</span>
            <span className={styles.separator}>•</span>
            <span>🌿 Vegan & 🌾 Gluten-Free Options</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={styles.navbar}>
        <div className={`container ${styles.navContainer}`}>
          <Link href="/" className={styles.logo}>
            CK Cake Lounge
          </Link>

          {/* Dynamic Search Bar */}
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search treats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton} aria-label="Search">
                🔍
              </button>
            </div>
          </form>

          <div className={styles.navLinks}>
            <Link href="/menu" className={styles.navLink}>
              Everyday Treats
            </Link>
            <Link href="/ready-to-go-cakes" className={styles.navLink}>
              Ready to Go Cakes
            </Link>
            <Link href="/cakes" className={styles.navLink}>
              Custom Cakes
            </Link>
            <Link href="/international-flavors" className={styles.navLink}>
              International Flavors
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
    </header>
  );
}
