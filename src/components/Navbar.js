'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import AuthModal from './AuthModal';
import styles from './Navbar.module.css';
import cartStyles from './FloatingCart.module.css';

export default function Navbar() {
  const { toggleCart, cartCount, isLoaded } = useCart();
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();
  
  // Search and autocomplete suggestions state
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
  const searchRef = useRef(null);

  // Fetch product list for autocomplete suggestions
  const handleSearchFocus = async () => {
    setShowSuggestions(true);
    if (hasFetchedProducts) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category')
        .eq('is_available', true);
      if (data && !error) {
        setAllProducts(data);
        setHasFetchedProducts(true);
      }
    } catch (err) {
      console.error("Error fetching search suggestions:", err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setActiveSuggestionIndex(-1);
    
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    
    const queryTerm = value.toLowerCase();
    const filtered = allProducts
      .filter(product => product.name.toLowerCase().includes(queryTerm))
      .slice(0, 6);
    setSuggestions(filtered);
  };

  const handleSelectSuggestion = (product) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/product/${product.id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/menu');
    }
  };

  // Keyboard navigation for suggestions dropdown
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[activeSuggestionIndex];
        handleSelectSuggestion(selected);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      {/* Main Navigation */}
      <nav className={styles.navbar}>
        <div className={`container ${styles.navContainer}`}>
          <Link href="/" className={styles.logo}>
            CK Cake Lounge
          </Link>

          {/* Dynamic Search Bar */}
          <form onSubmit={handleSearchSubmit} className={styles.searchForm} ref={searchRef}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search treats..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                className={styles.searchInput}
                autoComplete="off"
              />
              <button type="submit" className={styles.searchButton} aria-label="Search">
                🔍
              </button>
              
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestionsDropdown}>
                  {suggestions.map((product, index) => (
                    <div
                      key={product.id}
                      className={`${styles.suggestionItem} ${index === activeSuggestionIndex ? styles.activeSuggestion : ''}`}
                      onClick={() => handleSelectSuggestion(product)}
                    >
                      <span className={styles.suggestionName}>{product.name}</span>
                      <span className={styles.suggestionCategory}>{product.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>

            <div 
              className={styles.dropdown}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button 
                className={`${styles.navLink} ${styles.dropdownTrigger}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                type="button"
              >
                Our Products <span className={styles.dropdownArrow}>▼</span>
              </button>
              <div className={`${styles.dropdownMenu} ${dropdownOpen ? styles.showDropdown : ''}`}>
                <Link href="/menu" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  Everyday Treats
                </Link>
                <Link href="/ready-to-go-cakes" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  Ready to Go Cakes
                </Link>
                <Link href="/cakes" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  Custom Cakes
                </Link>
                <Link href="/international-flavors" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  International Flavors
                </Link>
                <Link href="/special-cakes" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  Special Cakes
                </Link>
              </div>
            </div>

            <Link href="/about" className={styles.navLink}>
              About Us
            </Link>

            <Link href="/special-events" className={`${styles.navLink} ${styles.specialLink}`}>
              Events
            </Link>
            
            {/* User Auth Action */}
            {isLoaded && (
              user ? (
                <div className={styles.userMenu}>
                  <span className={styles.userName}>Hi, {user.user_metadata?.first_name || 'User'}</span>
                  <button onClick={signOut} className={styles.logoutBtn} type="button">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className={styles.loginBtn} type="button">
                  Log In
                </button>
              )
            )}

            {/* Cart Icon */}
            <button className={cartStyles.cartToggleBtn} onClick={toggleCart} aria-label="Open Cart" type="button">
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
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
