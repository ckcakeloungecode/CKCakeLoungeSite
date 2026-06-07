'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import styles from './PromoCarousel.module.css';

export default function PromoCarousel() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const timerRef = useRef(null);
  const progressStartRef = useRef(Date.now());
  const [progress, setProgress] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Exclusive CK Club",
      highlight: "10% Off First Order",
      description: user 
        ? "Welcome back to the CK Club! Enjoy 10% off your active order automatically at checkout."
        : "Become a member today to receive 10% off on your first order and unlock exclusive updates!",
      icon: "🎁",
      ctaText: user ? "Explore Catalog" : "Become a Member",
      action: user ? "link" : "auth",
      url: "/menu",
    },
    {
      id: 2,
      title: "Introducing New Cakes",
      highlight: "Ready-To-Go Couple Cakes",
      description: "Baked fresh daily in 21 delightful flavors! Pick up our new 4\" Couple Cakes starting at just $25.00.",
      icon: "🍰",
      ctaText: "Shop Ready-To-Go",
      action: "link",
      url: "/ready-to-go-cakes",
    },
    {
      id: 3,
      title: "Custom Creations",
      highlight: "Upload Reference Designs",
      description: "Add a custom reference image or photo to your design at zero extra cost. Our bakers will bring it to life!",
      icon: "📸",
      ctaText: "Order Custom Cake",
      action: "link",
      url: "/cakes",
    },
    {
      id: 4,
      title: "Celebrations & Parties",
      highlight: "Book Event Quotes Online",
      description: "Planning a wedding, shower, or anniversary? Request a custom quote online with only 2 days advance notice.",
      icon: "🥂",
      ctaText: "Request Event Quote",
      action: "link",
      url: "/special-events",
    }
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
    progressStartRef.current = Date.now();
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
    progressStartRef.current = Date.now();
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    setProgress(0);
    progressStartRef.current = Date.now();
  };

  // Timer for auto-rotating slides
  useEffect(() => {
    if (isPlaying) {
      const interval = 50; // Update progress bar every 50ms
      const duration = 5000; // 5 seconds per slide

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - progressStartRef.current;
        if (elapsed >= duration) {
          handleNext();
        } else {
          setProgress((elapsed / duration) * 100);
        }
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSlide]);

  const handleCTA = (slide) => {
    if (slide.action === "auth") {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div 
      className={`glass-panel ${styles.carouselContainer}`}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => {
        setIsPlaying(true);
        progressStartRef.current = Date.now() - (progress / 100) * 5000;
      }}
      aria-label="Promotions and Announcements"
    >
      {/* Slide Navigation Controls */}
      <button 
        className={styles.navBtn} 
        onClick={handlePrev}
        aria-label="Previous Slide"
      >
        ‹
      </button>

      {/* Slide Content wrapper */}
      <div className={styles.slideWrapper}>
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div 
              key={slide.id} 
              className={`${styles.slide} ${isActive ? styles.activeSlide : ''}`}
              aria-hidden={!isActive}
            >
              <div className={styles.iconCol}>
                <span className={styles.slideIcon}>{slide.icon}</span>
              </div>
              <div className={styles.textCol}>
                <span className={styles.badge}>{slide.highlight}</span>
                <h3 className={styles.title}>{slide.title}</h3>
                <p className={styles.description}>{slide.description}</p>
              </div>
              <div className={styles.ctaCol}>
                {slide.action === "link" ? (
                  <Link href={slide.url} className={`btn-primary ${styles.ctaBtn}`}>
                    {slide.ctaText}
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleCTA(slide)} 
                    className={`btn-primary ${styles.ctaBtn}`}
                  >
                    {slide.ctaText}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        className={styles.navBtn} 
        onClick={handleNext}
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* Dots Indicator & Auto-play progress bar */}
      <div className={styles.indicatorsRow}>
        <div className={styles.dots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Running timer progress bar at the very bottom */}
      <div className={styles.progressBarWrapper}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${isPlaying ? progress : 0}%` }}
        />
      </div>

      {/* Auth Modal integration */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
