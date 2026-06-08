"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BackgroundCarousel — Full-screen rotating background images with crossfade.
 *
 * Props:
 *   images      — Array of Unsplash/photo URLs (default: restaurant scenes)
 *   interval    — ms between transitions (default: 6000)
 *   overlayBg   — overlay CSS color (default: 'rgba(0,0,0,0.65)')
 *   overlayClass — additional overlay classes (e.g. 'bg-gradient-to-b ...')
 *   className   — outer container classes
 *   fadeDuration — crossfade duration in seconds (default: 1.2)
 */
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
];

export default function BackgroundCarousel({
  images = DEFAULT_IMAGES,
  interval = 6000,
  overlayBg = 'rgba(0,0,0,0.65)',
  overlayClass = '',
  className = '',
  fadeDuration = 1.2,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const mountedRef = useRef(true);

  // Preload all images into browser cache so transitions are instant
  useEffect(() => {
    if (!images || images.length === 0) return;
    let loaded = 0;
    const total = images.length;

    images.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded >= total && mountedRef.current) {
          setReady(true);
        }
      };
      img.src = src;
    });

    return () => { mountedRef.current = false; };
  }, [images]);

  // Cycle images on interval
  useEffect(() => {
    if (!images || images.length <= 1 || !ready) return;
    const timer = setInterval(() => {
      if (mountedRef.current) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [images, interval, ready]);

  if (!images || images.length === 0) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Crossfading images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeDuration, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[currentIndex]})` }}
        />
      </AnimatePresence>

      {/* Dark overlay for text readability */}
      <div
        className={`absolute inset-0 ${overlayClass}`}
        style={{ background: overlayBg }}
      />
    </div>
  );
}
