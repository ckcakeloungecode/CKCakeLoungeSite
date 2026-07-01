'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './FruitSlider.module.css';

export default function FruitSlider({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [maxIndex, setMaxIndex] = useState(1);

  const sliderRef = useRef(null);

  // Dynamically calculate visible cards and maxIndex based on screen width
  useEffect(() => {
    const updateMaxIndex = () => {
      const width = window.innerWidth;
      let visible = 4;
      if (width <= 600) visible = 1;
      else if (width <= 1024) visible = 2;
      
      setMaxIndex(Math.max(0, products.length - visible));
    };
    
    updateMaxIndex();
    window.addEventListener('resize', updateMaxIndex);
    return () => window.removeEventListener('resize', updateMaxIndex);
  }, [products.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Drag event handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const offset = clientX - startX;
    
    // Apply resistance at boundaries
    if (currentIndex === 0 && offset > 0) {
      setDragOffset(offset * 0.3);
    } else if (currentIndex === maxIndex && offset < 0) {
      setDragOffset(offset * 0.3);
    } else {
      setDragOffset(offset);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 60; // Pixels to trigger slide transition
    if (dragOffset < -threshold && currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
    setDragOffset(0);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, dragOffset, currentIndex, maxIndex]);

  return (
    <div className={styles.sliderContainer} ref={sliderRef}>
      {/* Slide Navigation Buttons */}
      <div className={styles.sliderControls}>
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0} 
          className={styles.controlBtn}
          aria-label="Previous Slide"
          type="button"
        >
          &larr;
        </button>
        <button 
          onClick={handleNext} 
          disabled={currentIndex === maxIndex} 
          className={styles.controlBtn}
          aria-label="Next Slide"
          type="button"
        >
          &rarr;
        </button>
      </div>

      <div 
        className={styles.sliderViewport}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className={styles.sliderTrack}
          style={{
            '--current-index': currentIndex,
            '--drag-offset': `${dragOffset}px`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {products.map((product) => {
            let emoji = '🍰';
            const nameLower = product.name.toLowerCase();
            if (nameLower.includes('mango')) emoji = '🥭';
            else if (nameLower.includes('pineapple')) emoji = '🍍';
            else if (nameLower.includes('strawberry')) emoji = '🍓';
            else if (nameLower.includes('blue berry') || nameLower.includes('blueberry')) emoji = '🫐';
            else if (nameLower.includes('mix fruit')) emoji = '🥝';
            else if (nameLower.includes('coconut')) emoji = '🥥';

            const productUrl = product.isFallback 
              ? '/ready-to-go-cakes' 
              : `/product/${product.id}`;

            return (
              <div key={product.id} className={styles.sliderCardWrapper}>
                <div className={`glass-panel ${styles.productCard}`}>
                  <div className={`${styles.imagePlaceholder} ${styles[nameLower.replace(/\s+/g, '')]}`}>
                    <span className={styles.placeholderEmoji}>{emoji}</span>
                    <span className={styles.placeholderText}>Photo Coming Soon</span>
                  </div>
                  <div className={styles.productCardContent}>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Starts from</span>
                      <span className={styles.priceValue}>${product.price.toFixed(2)}</span>
                    </div>
                    <Link 
                      href={productUrl} 
                      className="btn-primary" 
                      style={{ width: '100%', textAlign: 'center', display: 'block' }}
                      draggable="false"
                    >
                      View Sizes & Prices
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
