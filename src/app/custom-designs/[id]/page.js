'use client';

import { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../utils/supabaseClient';
import { CUSTOM_DESIGNS, ALL_CUSTOM_SIZES, ALL_CUSTOM_FLAVORS } from '../../../utils/customDesignsData';
import styles from '../../product/[id]/page.module.css';

export default function CustomDesignDetailPage({ params }) {
  const resolvedParams = use(params);
  const designId = resolvedParams.id;
  const router = useRouter();

  // Find design by ID
  const design = CUSTOM_DESIGNS.find(d => d.id === designId || d.id === `design-${designId}`);

  // Selections state
  const [selectedSize, setSelectedSize] = useState(design?.defaultSize || ALL_CUSTOM_SIZES[1].label);
  const [selectedFlavor, setSelectedFlavor] = useState(ALL_CUSTOM_FLAVORS[0]);
  const [quantity, setQuantity] = useState(1);

  const [isPhotoCake, setIsPhotoCake] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic price calculation based on selected size
  const sizeObj = useMemo(() => {
    return ALL_CUSTOM_SIZES.find(s => s.label === selectedSize) || ALL_CUSTOM_SIZES[1];
  }, [selectedSize]);

  const displayPrice = sizeObj.price;
  const total = displayPrice * quantity;
  const formattedDisplayPrice = Number(displayPrice).toFixed(2);
  const formattedTotal = Number(total).toFixed(2);

  // Image source
  const displayImage = useMemo(() => {
    if (design?.imageUrl) return design.imageUrl;
    const lowerSize = (selectedSize || '').toLowerCase();
    if (lowerSize.includes('2-tier') || lowerSize.includes('tier') || lowerSize.includes('6 lb') || lowerSize.includes('7 lb')) {
      return '/custom-cake-tiered.jpg';
    }
    return '/custom-cake-single.jpg';
  }, [design, selectedSize]);

  if (!design) {
    return (
      <main className={styles.main}>
        <div className="container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <h2>Custom Design Not Found</h2>
          <br />
          <Link href="/custom-designs" className="btn-primary">Back to Custom Designs Showcase</Link>
        </div>
      </main>
    );
  }

  const handleGetQuote = async () => {
    let finalPhotoUrl = design.imageUrl || null;

    if (isPhotoCake && photoFile) {
      setIsUploading(true);
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('cake_photos')
        .upload(fileName, photoFile);

      if (error) {
        alert("Failed to upload reference photo. Please try again.");
        setIsUploading(false);
        return;
      }

      const { data: publicData } = supabase.storage.from('cake_photos').getPublicUrl(fileName);
      finalPhotoUrl = publicData.publicUrl;
      setIsUploading(false);
    }

    const item = {
      productId: `custom-design-${design.id}`,
      variantId: null,
      name: design.title,
      size: selectedSize,
      flavor: selectedFlavor,
      price: displayPrice,
      quantity: quantity,
      isPhotoCake: isPhotoCake,
      photoUrl: finalPhotoUrl,
      displayImage: displayImage,
      category: 'Cakes',
      designCategory: design.category,
      designNotes: `Custom design "${design.title}" (${design.category}).`
    };

    sessionStorage.setItem('pendingQuoteItem', JSON.stringify(item));
    router.push('/custom-quote');
  };

  return (
    <main className={styles.main}>
      <div className={`container ${styles.productContainer}`}>
        <Link href="/custom-designs" className={styles.backLink}>&larr; Back to Custom Designs</Link>

        <div className={`glass-panel ${styles.productLayout}`}>
          {/* Left Side: Design Image */}
          <div className={styles.imageColumn}>
            <div 
              className={styles.imagePlaceholder}
              style={{ position: 'relative', overflow: 'hidden', padding: 0 }}
            >
              <img 
                src={displayImage} 
                alt={design.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', inset: 0 }} 
              />
            </div>
          </div>

          {/* Right Side: Design Customization Options */}
          <div className={styles.detailsColumn}>
            <h1 className={styles.title}>{design.title}</h1>
            <p className={styles.description}>{design.themeMessage}</p>

            <div className={styles.selectorContainer}>
              <h2 className={styles.price}>
                Starts from ${formattedDisplayPrice}
              </h2>

              {/* Size & Flavor Options Grid matching Image 3 */}
              <div className={styles.optionsGrid}>
                {/* Size Dropdown */}
                <div className={styles.optionGroup}>
                  <label>Size</label>
                  <select 
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className={styles.dropdown}
                  >
                    {ALL_CUSTOM_SIZES.map(sz => (
                      <option key={sz.label} value={sz.label}>{sz.label}</option>
                    ))}
                  </select>
                </div>

                {/* Flavor Dropdown */}
                <div className={styles.optionGroup}>
                  <label>Flavor</label>
                  <select 
                    value={selectedFlavor} 
                    onChange={(e) => setSelectedFlavor(e.target.value)}
                    className={styles.dropdown}
                  >
                    {ALL_CUSTOM_FLAVORS.map(flavor => (
                      <option key={flavor} value={flavor}>{flavor}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference Photo Upload Checkbox */}
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
                  <span> 📷 Upload reference design photo (Free)</span>
                </label>

                {isPhotoCake && (
                  <div style={{ marginTop: '10px', padding: '12px', border: '1px dashed #c4b6b0', borderRadius: '8px', background: 'rgba(255,255,255,0.5)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#6b5a52', fontWeight: 'bold' }}>
                      Upload High-Res Photo (Optional)
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

              {/* Action Row: Quantity + Get Quote button */}
              <div className={styles.actionRow}>
                <div className={styles.quantityControl}>
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>

                <button 
                  type="button"
                  className={`btn-primary ${styles.addToCartBtn}`}
                  onClick={handleGetQuote}
                  disabled={isUploading}
                  style={{ background: '#543b32', borderColor: '#543b32' }}
                >
                  {isUploading ? "Uploading Photo..." : "Get Quote"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
