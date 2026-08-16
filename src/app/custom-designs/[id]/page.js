'use client';

import { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  const handleGetQuote = () => {
    const item = {
      productId: `custom-design-${design.id}`,
      variantId: null,
      name: design.title,
      size: selectedSize,
      flavor: selectedFlavor,
      price: displayPrice,
      quantity: quantity,
      isPhotoCake: false,
      photoUrl: design.imageUrl || null,
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

              {/* Size & Flavor Options Grid */}
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

              {/* Action Row: Quantity + Get Quote button */}
              <div className={styles.actionRow} style={{ marginTop: '2rem' }}>
                <div className={styles.quantityControl}>
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>

                <button 
                  type="button"
                  className={`btn-primary ${styles.addToCartBtn}`}
                  onClick={handleGetQuote}
                  style={{ background: '#543b32', borderColor: '#543b32' }}
                >
                  Get Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
