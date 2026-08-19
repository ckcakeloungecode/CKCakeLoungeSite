'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../menu/page.module.css';

export default function SpecialCakeCard({ product }) {
  const isPinata = product.name?.toLowerCase().includes('pinata') || product.name?.toLowerCase().includes('piñata');
  
  // Set images array: multi-photo carousel for Piñata Cake, or single image
  const images = isPinata 
    ? ['/pinata-cake.jpg', '/pinata-cake-2.jpg'] 
    : (product.image_url ? [product.image_url] : []);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-cycle slideshow every 5 seconds if there are multiple images
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`glass-panel ${styles.card}`}>
      <div className={styles.imagePlaceholder} style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        {images.length > 0 ? (
          <img 
            src={images[currentIndex]} 
            alt={`${product.name} - ${currentIndex + 1}`} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center', 
              display: 'block', 
              position: 'absolute', 
              inset: 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#8c766b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🪅</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{product.name}</span>
          </div>
        )}

        {/* Carousel Overlay Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(42, 27, 20, 0.65)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5
              }}
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(42, 27, 20, 0.65)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5
              }}
              aria-label="Next image"
            >
              ›
            </button>

            {/* Dots indicator */}
            <div 
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.4rem',
                zIndex: 5
              }}
            >
              {images.map((img, idx) => (
                <span
                  key={img}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  style={{
                    width: idx === currentIndex ? '18px' : '8px',
                    height: '8px',
                    borderRadius: '50px',
                    background: idx === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.cardContent}>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <Link href={`/product/${product.id}`} className="btn-primary" style={{ background: 'var(--rose)', borderColor: 'var(--rose)' }}>
          View Options
        </Link>
      </div>
    </div>
  );
}
