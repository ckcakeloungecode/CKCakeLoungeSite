'use client';

import { useState, useMemo } from 'react';
import styles from './page.module.css';

import { useCart } from '../../context/CartContext';

export default function ProductSelector({ product, variants }) {
  const { addToCart } = useCart();
  
  // If there are no variants, just use the base product info
  const hasVariants = variants && variants.length > 0;
  
  // Extract unique sizes and flavors from the variants data
  const uniqueSizes = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Set(variants.map(v => v.size))].filter(Boolean);
  }, [variants, hasVariants]);

  const uniqueFlavors = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Set(variants.map(v => v.flavor))].filter(Boolean);
  }, [variants, hasVariants]);

  // State to hold the user's current selections. Default to the first available option.
  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] || '');
  const [selectedFlavor, setSelectedFlavor] = useState(uniqueFlavors[0] || '');
  const [quantity, setQuantity] = useState(1);

  // Find the exact variant based on current selections
  const currentVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(v => v.size === selectedSize && v.flavor === selectedFlavor);
  }, [selectedSize, selectedFlavor, variants, hasVariants]);

  // Determine final display price
  const displayPrice = currentVariant ? currentVariant.price : product.base_price;
  const total = displayPrice * quantity;

  // Real function for Add to Cart
  const handleAddToCart = () => {
    addToCart(product, currentVariant, quantity);
  };

  return (
    <div className={styles.selectorContainer}>
      <h2 className={styles.price}>${displayPrice} <span className={styles.perUnit}>each</span></h2>

      {hasVariants && (
        <div className={styles.optionsGrid}>
          {uniqueSizes.length > 0 && (
            <div className={styles.optionGroup}>
              <label>Size</label>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                className={styles.dropdown}
              >
                {uniqueSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}

          {uniqueFlavors.length > 0 && (
            <div className={styles.optionGroup}>
              <label>Flavor</label>
              <select 
                value={selectedFlavor} 
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className={styles.dropdown}
              >
                {uniqueFlavors.map(flavor => (
                  <option key={flavor} value={flavor}>{flavor}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Warning if a specific combination isn't found in the database */}
      {hasVariants && !currentVariant && (
        <p className={styles.warning}>This specific combination is not available.</p>
      )}

      <div className={styles.actionRow}>
        <div className={styles.quantityControl}>
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
        
        <button 
          className={`btn-primary ${styles.addToCartBtn}`}
          onClick={handleAddToCart}
          disabled={hasVariants && !currentVariant}
        >
          Add to Cart - ${total}
        </button>
      </div>
    </div>
  );
}
