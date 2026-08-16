'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { CUSTOM_DESIGNS, CATEGORIES } from '../../utils/customDesignsData';

export default function CustomDesignsGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All Designs');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter designs based on category and search
  const filteredDesigns = CUSTOM_DESIGNS.filter(design => {
    const matchesCategory = selectedCategory === 'All Designs' || design.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (design.themeMessage && design.themeMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className={styles.main}>
      <div className={`container ${styles.galleryContainer}`}>
        <h1 className={styles.title}>Custom Design Showcase</h1>
        <p className={styles.subtitle}>
          Browse our bespoke cake creations! Select any design below to choose your custom size and flavor.
        </p>

        {/* Menu Tabs Navigation */}
        <div className={styles.tabs}>
          <Link href="/menu" className={styles.tab}>Everyday Treats</Link>
          <Link href="/ready-to-go-cakes" className={styles.tab}>Ready to Go Cakes</Link>
          <Link href="/cakes" className={styles.tab}>Custom Cakes</Link>
          <Link href="/international-flavors" className={styles.tab}>International Flavors</Link>
          <Link href="/special-cakes" className={styles.tab}>Special Cakes</Link>
          <Link href="/custom-designs" className={styles.activeTab}>Custom Designs Gallery</Link>
        </div>

        {/* Category Pill Filters & Search */}
        <div className={styles.filterSection}>
          <div className={styles.categoryPills}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`${styles.pillBtn} ${selectedCategory === cat ? styles.activePillBtn : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search custom designs (e.g. Wedding, Drip, Vintage)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Gallery Grid - Clean Cards matching Custom Cakes layout */}
        <div className={styles.grid}>
          {filteredDesigns.map((design) => {
            return (
              <div key={design.id} className={styles.card}>
                {/* Image or Placeholder Frame */}
                <div className={styles.imageFrame}>
                  {design.imageUrl ? (
                    <img src={design.imageUrl} alt={design.title} />
                  ) : (
                    <div className={styles.placeholderBox}>
                      <span className={styles.placeholderIcon}>🎂</span>
                      <span className={styles.placeholderTitle}>{design.title}</span>
                      <code className={styles.placeholderHint}>
                        📷 Insert image: /public/designs/{design.placeholderCode}
                      </code>
                    </div>
                  )}
                  <span className={styles.badge}>{design.category}</span>
                </div>

                {/* Card Details */}
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{design.title}</h2>
                  <p className={styles.description}>
                    {design.themeMessage}
                  </p>

                  {/* Choose Flavor & Size Action Button */}
                  <Link
                    href={`/custom-designs/${design.id}`}
                    className="btn-primary"
                    style={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      marginTop: 'auto',
                      background: 'var(--rose)', 
                      borderColor: 'var(--rose)',
                      fontWeight: '600'
                    }}
                  >
                    Choose Flavor & Size &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDesigns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6e5c54' }}>
            <h3>No designs matched your search</h3>
            <p style={{ marginTop: '0.5rem' }}>Try clearing your search query or selecting a different category pill above.</p>
          </div>
        )}

        {/* Custom Design Inquiry Notice */}
        <div className={styles.noticeBox}>
          <h3>Have Your Own Unique Design in Mind?</h3>
          <p>
            Don't see the exact design you're looking for? You can upload any reference photo or sketch directly using our Custom Cake Quote form!
          </p>
          <Link href="/custom-quote" className="btn-primary">
            Upload Your Own Design & Get Quote
          </Link>
        </div>
      </div>
    </main>
  );
}
