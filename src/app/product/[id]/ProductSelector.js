'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function ProductSelector({ product, variants }) {
  const router = useRouter();
  const hasVariants = variants && variants.length > 0;
  
  const isPinata = useMemo(() => {
    return product.name?.toLowerCase().includes('pinata') || product.name?.toLowerCase().includes('piñata');
  }, [product.name]);

  // Extract unique sizes and flavors/designs from the variants data
  const uniqueSizes = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Set(variants.map(v => v.size))].filter(Boolean);
  }, [variants, hasVariants]);

  const uniqueFlavors = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Set(variants.map(v => v.flavor))].filter(Boolean);
  }, [variants, hasVariants]);

  // State to hold the user's current selections.
  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] || '');
  const [selectedFlavor, setSelectedFlavor] = useState(uniqueFlavors[0] || '');
  const [selectedShape, setSelectedShape] = useState('Heart');
  
  const minQty = product.min_quantity || 1;
  const [quantity, setQuantity] = useState(minQty);
  
  const [isPhotoCake, setIsPhotoCake] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if product is in a cake category eligible for shape choice
  const isCakeCategory = product.category === 'Ready to Go Cakes' || product.category === 'Cakes' || product.category === 'Special Cakes';

  // Find the exact variant based on current selections
  const currentVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(v => v.size === selectedSize && v.flavor === selectedFlavor);
  }, [selectedSize, selectedFlavor, variants, hasVariants]);

  const isCustomCake = product.category === 'Cakes';

  // Photo option is always eligible for Custom Cakes (free upload), or if product allows photo and size is 1 or 2 Pound
  const isPhotoEligible = useMemo(() => {
    if (isCustomCake) return true;
    if (!product.allows_photo) return false;
    const lowerSize = (selectedSize || '').toLowerCase();
    return lowerSize.includes('1 pound') || lowerSize.includes('2 pound');
  }, [isCustomCake, product.allows_photo, selectedSize]);

  // Dynamic photo fee: +$15.00 for 1 Pound, +$20.00 for 2 Pound
  const photoFee = useMemo(() => {
    if (!isPhotoCake || isCustomCake) return 0;
    const lowerSize = (selectedSize || '').toLowerCase();
    if (lowerSize.includes('1 pound')) return 15;
    if (lowerSize.includes('2 pound')) return 20;
    return 0;
  }, [isPhotoCake, isCustomCake, selectedSize]);

  // Auto-reset photo checkbox if selected size changes to an ineligible one
  useEffect(() => {
    if (!isPhotoEligible) {
      setIsPhotoCake(false);
      setPhotoFile(null);
    }
  }, [isPhotoEligible]);

  // Determine final display price
  const baseDisplayPrice = currentVariant ? currentVariant.price : product.price;
  const displayPrice = baseDisplayPrice + photoFee;
  const total = displayPrice * quantity;
  
  const formattedDisplayPrice = Number(displayPrice).toFixed(2);
  const formattedTotal = Number(total).toFixed(2);

  // Determine dynamic image based on selected size for Custom Cakes or flavor variant
  const displayImage = useMemo(() => {
    if (isCustomCake || product.category === 'Cakes') {
      const lowerSize = (selectedSize || '').toLowerCase();
      const match = lowerSize.match(/(\d+(\.\d+)?)/);
      const sizeNum = match ? parseFloat(match[1]) : null;

      if (lowerSize.includes('2-tier') || lowerSize.includes('3-tier') || lowerSize.includes('tier') || (sizeNum && sizeNum >= 6)) {
        return '/custom-cake-tiered.jpg';
      }
      return '/custom-cake-single.jpg';
    }
    const nameLower = (product.name || '').toLowerCase();
    const fallbackImg = (nameLower.includes('jamun') || nameLower.includes('gulab'))
      ? '/gulab-jamun-cake.jpg'
      : (nameLower.includes('mango')
        ? '/mango-cake.jpg'
        : ((nameLower.includes('ras') || nameLower.includes('rasmalai'))
          ? '/rasmalai-cake.jpg'
          : '/custom-cake-single.jpg'));

    return (currentVariant && currentVariant.image_url) ? currentVariant.image_url : (product.image_url || fallbackImg);
  }, [isCustomCake, product.category, product.name, product.image_url, selectedSize, currentVariant]);

  // Gallery slider images for multi-photo products like Piñata Cake
  const galleryImages = useMemo(() => {
    if (isPinata && variants && variants.length > 0) {
      const vImgs = variants.map(v => v.image_url).filter(Boolean);
      if (vImgs.length > 0) return vImgs;
    }
    if (isPinata) {
      return ['/pinata-cake.jpg', '/pinata-cake-2.jpg'];
    }
    return [displayImage];
  }, [isPinata, variants, displayImage]);

  // Handle slide changes via arrows / dots
  const handleSelectImageIndex = (idx) => {
    setCurrentImageIndex(idx);
    if (isPinata && variants && variants[idx]) {
      setSelectedFlavor(variants[idx].flavor);
    }
  };

  // Auto-cycle slideshow every 5 seconds if there are multiple images
  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIdx = prev < galleryImages.length - 1 ? prev + 1 : 0;
        if (isPinata && variants && variants[nextIdx]) {
          setSelectedFlavor(variants[nextIdx].flavor);
        }
        return nextIdx;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [galleryImages.length, isPinata, variants]);

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
      
      const { data: publicData } = supabase.storage.from('cake_photos').getPublicUrl(fileName);
      finalPhotoUrl = publicData.publicUrl;
      setIsUploading(false);
    }

    const item = {
      productId: product.id,
      variantId: currentVariant ? currentVariant.id : null,
      name: product.name,
      size: selectedSize || 'Standard',
      flavor: selectedFlavor || 'Standard',
      shape: (isCakeCategory && !isPinata) ? selectedShape : 'Heart',
      price: displayPrice,
      quantity,
      isPhotoCake,
      photoUrl: finalPhotoUrl,
      displayImage: galleryImages[currentImageIndex] || displayImage,
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
      {/* Left Side: Image Gallery Slider */}
      <div className={styles.imageColumn}>
        <div 
          className={styles.imagePlaceholder}
          style={{ position: 'relative', overflow: 'hidden', padding: 0 }}
        >
          {galleryImages.length > 0 && (
            <img 
              src={galleryImages[currentImageIndex] || displayImage} 
              alt={`${product.name} - Image ${currentImageIndex + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', inset: 0, transition: 'all 0.3s ease' }} 
            />
          )}

          {/* Carousel Arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => handleSelectImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : galleryImages.length - 1)}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(42, 27, 20, 0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'background 0.2s ease'
                }}
                aria-label="Previous Image"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => handleSelectImageIndex(currentImageIndex < galleryImages.length - 1 ? currentImageIndex + 1 : 0)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(42, 27, 20, 0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'background 0.2s ease'
                }}
                aria-label="Next Image"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Gallery Indicator Dots */}
        {galleryImages.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1rem' }}>
            {galleryImages.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => handleSelectImageIndex(idx)}
                style={{
                  width: idx === currentImageIndex ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '50px',
                  background: idx === currentImageIndex ? 'var(--primary)' : 'var(--accent-light)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Side: Details & Selectors */}
      <div className={styles.detailsColumn}>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.description}>{product.description}</p>
        
        <div className={styles.selectorContainer}>
          <h2 className={styles.price}>
            {isCustomCake 
              ? `Starts from $${formattedDisplayPrice}` 
              : `$${formattedDisplayPrice} each`}
          </h2>

          {(hasVariants || isCakeCategory) && (
            <div className={styles.optionsGrid}>
              {/* Size Selector */}
              {uniqueSizes.length === 1 ? (
                <div className={styles.optionGroup}>
                  <label>Size</label>
                  <span className={styles.staticSize}>{selectedSize}</span>
                </div>
              ) : uniqueSizes.length > 1 ? (
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
              ) : null}

              {/* Design / Style / Flavor Selector */}
              {uniqueFlavors.length === 1 ? (
                <div className={styles.optionGroup}>
                  <label>{isPinata ? 'Cake Design' : 'Flavor'}</label>
                  <span className={styles.staticSize}>{selectedFlavor}</span>
                </div>
              ) : uniqueFlavors.length > 1 ? (
                <div className={styles.optionGroup}>
                  <label>{isPinata ? 'Cake Design' : 'Flavor'}</label>
                  <select 
                    value={selectedFlavor} 
                    onChange={(e) => {
                      const newFlavor = e.target.value;
                      setSelectedFlavor(newFlavor);
                      if (isPinata && variants) {
                        const vIdx = variants.findIndex(v => v.flavor === newFlavor);
                        if (vIdx !== -1) setCurrentImageIndex(vIdx);
                      }
                    }}
                    className={styles.dropdown}
                  >
                    {uniqueFlavors.map(flavor => (
                      <option key={flavor} value={flavor}>{flavor}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Cake Shape Selector (Hidden for Piñata Cake) */}
              {isCakeCategory && !isCustomCake && !isPinata && (
                <div className={styles.optionGroup}>
                  <label>Cake Shape</label>
                  <select 
                    value={selectedShape} 
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className={styles.dropdown}
                  >
                    <option value="Circle">Circle (Standard)</option>
                    <option value="Heart">Heart Shape</option>
                    <option value="Square">Square</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Photo Customization Checkbox */}
          {isPhotoEligible && (
            <div className={styles.photoUploadContainer}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={isPhotoCake} 
                  onChange={(e) => {
                    setIsPhotoCake(e.target.checked);
                    if (!e.target.checked) setPhotoFile(null);
                  }} 
                />
                <span>
                  Add Custom Photo Print on Cake
                  {!isCustomCake && (
                    <strong style={{ marginLeft: '0.4rem', color: 'var(--accent)' }}>
                      (+${(selectedSize || '').toLowerCase().includes('1 pound') ? '15.00' : '20.00'})
                    </strong>
                  )}
                </span>
              </label>

              {isPhotoCake && (
                <div className={styles.fileInputWrapper}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className={styles.fileInput}
                  />
                  {photoFile && (
                    <p className={styles.fileSuccessNote}>
                      ✔ Attached: <strong>{photoFile.name}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add to Cart / Quantity Controls */}
          <div className={styles.actionRow}>
            <div className={styles.quantityControl}>
              <button 
                type="button" 
                onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                type="button" 
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            <button 
              type="button"
              className={`btn-primary ${styles.addToCartBtn}`}
              onClick={handleAddToCart}
              disabled={isUploading || (isPhotoCake && !photoFile)}
            >
              {isUploading ? 'Uploading Photo...' : isCustomCake ? 'Get Quote' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
