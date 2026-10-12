'use client';

import { useState, useEffect } from 'react';

export default function RotatingCardImage({
  images = [],
  alt = '',
  intervalMs = 3500,
  style = {},
  className = ''
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [images, intervalMs]);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          position: 'absolute',
          inset: 0,
          ...style
        }}
        className={className}
      />
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style
      }}
      className={className}
    >
      {images.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          alt={`${alt} - view ${idx + 1}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 0.65s ease-in-out',
            pointerEvents: idx === currentIndex ? 'auto' : 'none'
          }}
        />
      ))}

      {/* Subtle indicator dots */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '5px',
          zIndex: 2,
          padding: '3px 8px',
          background: 'rgba(0, 0, 0, 0.28)',
          backdropFilter: 'blur(4px)',
          borderRadius: '12px'
        }}
      >
        {images.map((_, dotIdx) => (
          <span
            key={dotIdx}
            style={{
              width: dotIdx === currentIndex ? '14px' : '6px',
              height: '6px',
              borderRadius: '3px',
              backgroundColor: dotIdx === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
              display: 'inline-block'
            }}
          />
        ))}
      </div>
    </div>
  );
}
