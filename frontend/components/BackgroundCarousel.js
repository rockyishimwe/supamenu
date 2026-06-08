"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../lib/useTheme';

/**
 * BackgroundCarousel — Full-screen rotating background images with crossfade.
 *
 * Props:
 *   images      — Array of Unsplash/photo URLs (default: restaurant scenes)
 *   interval    — ms between transitions (default: 6000)
 *   overlayBg   — overlay CSS color for dark mode (default: 'rgba(0,0,0,0.65)')
 *   overlayBgLight — overlay CSS color for light mode (default: 'rgba(255,255,255,0.85)')
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

const DEFAULT_IMAGES_LIGHT = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1600&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80',
];

export default function BackgroundCarousel({
  images = DEFAULT_IMAGES,
  imagesLight = DEFAULT_IMAGES_LIGHT,
  interval = 6000,
  overlayBg = 'rgba(0,0,0,0.65)',
  overlayBgLight = 'rgba(255,255,255,0.85)',
  overlayClass = '',
  className = '',
  fadeDuration = 1.2,
}) {
  const { theme, isClient } = useThemeStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const mountedRef = useRef(true);

  const activeImages = isClient && theme === 'light' ? imagesLight : images;
  const activeOverlayBg = isClient && theme === 'light' ? overlayBgLight : overlayBg;

  // Preload all images into browser cache so transitions are instant
  useEffect(() => {
    if (!activeImages || activeImages.length === 0) return;
    let loaded = 0;
    const total = activeImages.length;

    activeImages.forEach((src) => {
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
  }, [activeImages]);

  // Cycle images on interval
  useEffect(() => {
    if (!activeImages || activeImages.length <= 1 || !ready) return;
    const timer = setInterval(() => {
      if (mountedRef.current) {
        setCurrentIndex((prev) => (prev + 1) % activeImages.length);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [activeImages, interval, ready]);

  if (!activeImages || activeImages.length === 0) return null;

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
          style={{ backgroundImage: `url(${activeImages[currentIndex]})` }}
        />
      </AnimatePresence>

      {/* Theme-aware overlay for text readability */}
      <div
        className={`absolute inset-0 ${overlayClass}`}
        style={{ background: activeOverlayBg }}
      />
    </div>
  );
}
