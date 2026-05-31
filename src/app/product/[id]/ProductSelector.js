'use client';

import { useState, useMemo } from 'react';
import { useCart } from '../../../context/CartContext';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ProductSelector({ product, variants }) {
  const router = useRouter();
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
  
  const minQty = product.min_quantity || 1;
  const [quantity, setQuantity] = useState(minQty);
  
  const [isPhotoCake, setIsPhotoCake] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Find the exact variant based on current selections
  const currentVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(v => v.size === selectedSize && v.flavor === selectedFlavor);
  }, [selectedSize, selectedFlavor, variants, hasVariants]);

  // Determine final display price
  const baseDisplayPrice = currentVariant ? currentVariant.price : product.price;
  const isCustomCake = product.category === 'Cakes';
  const displayPrice = baseDisplayPrice + ((isPhotoCake && !isCustomCake) ? 25 : 0);
  const total = displayPrice * quantity;
  
  const formattedDisplayPrice = Number(displayPrice).toFixed(2);
  const formattedTotal = Number(total).toFixed(2);

  // Determine dynamic image based on selected flavor variant
  const displayImage = (currentVariant && currentVariant.image_url) ? currentVariant.image_url : product.image_url;

  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    let finalPhotoUrl = null;

    if (isPhotoCake && photoFile) {
      setIsUploading(true);
      
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('cake_photos')
        .upload(fileName, photoFile);
        
      if (error) {
        alert("Failed to upload photo! Please try again.");
        setIsUploading(false);
        return;
      }
      
      // Get the permanent public URL
      const { data: publicData } = supabase.storage.from('cake_photos').getPublicUrl(fileName);
      finalPhotoUrl = publicData.publicUrl;
      setIsUploading(false);
    }

    const item = {
      productId: product.id,
      variantId: currentVariant ? currentVariant.id : null,
      name: product.name,
      size: selectedSize || 'Standard',
      flavor: selectedFlavor || 'Original',
      price: displayPrice,
      quantity: quantity,
      isPhotoCake: isPhotoCake,
      photoUrl: finalPhotoUrl,
      displayImage: displayImage,
      category: product.category
    };
    
    if (isCustomCake) {
      sessionStorage.setItem('pendingQuoteItem', JSON.stringify(item));
      router.push('/custom-quote');
    } else {
      addToCart(item);
    }
    
    // Reset state after adding
    setPhotoFile(null);
    setIsPhotoCake(false);
  };

  return (
    <>
      {/* Left Side: Image (Dynamically changes based on flavor!) */}
      <div className={styles.imageColumn}>
         <div 
           className={styles.imagePlaceholder}
           style={{ backgroundImage: displayImage ? `url(${displayImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
         >
         </div>
      </div>

      {/* Right Side: Details & Selectors */}
      <div className={styles.detailsColumn}>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.description}>{product.description}</p>
        
        <div className={styles.selectorContainer}>
      <h2 className={styles.price}>
        {isCustomCake 
          ? `Starts from $${Number(product.price).toFixed(2)}` 
          : `$${formattedDisplayPrice} each`}
      </h2>

      {hasVariants && (
        <div className={styles.optionsGrid}>
          {uniqueSizes.length > 1 && (
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

          {uniqueFlavors.length > 0 && (uniqueFlavors.length > 1 || product.category === 'Cakes') && (
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

      {product.allows_photo && (
        <div className={styles.photoToggle}>
          <label>
            <input 
              type="checkbox" 
              checked={isPhotoCake} 
              onChange={(e) => {
                setIsPhotoCake(e.target.checked);
                if (!e.target.checked) setPhotoFile(null);
              }} 
            />
            <span>
              {isCustomCake 
                ? " 📷 Upload reference design photo (Free)" 
                : " 📷 Make it a Photo Cake (+$25.00)"}
            </span>
          </label>
          
          {isPhotoCake && (
            <div style={{ marginTop: '10px', padding: '12px', border: '1px dashed #c4b6b0', borderRadius: '8px', background: 'rgba(255,255,255,0.5)' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#6b5a52', fontWeight: 'bold' }}>
                Upload High-Res Photo (Required)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setPhotoFile(e.target.files[0])}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
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
          <button onClick={() => setQuantity(Math.max(minQty, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
        
        <button 
          className={`btn-primary ${styles.addToCartBtn}`}
          onClick={handleAddToCart}
          disabled={(hasVariants && !currentVariant) || isUploading || (isPhotoCake && !photoFile)}
        >
          {isUploading ? "Uploading Photo..." : isCustomCake ? "Get Quote" : `Add to Cart - $${formattedTotal}`}
        </button>
      </div>
    </div>
    </div>
    </>
  );
}
