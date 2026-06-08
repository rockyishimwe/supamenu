"use client";
import BackgroundCarousel from '../BackgroundCarousel';

/**
 * CustomerBackground — Food & dining atmosphere imagery
 * Warm, inviting photos that make users hungry
 */
const CUSTOMER_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',   // Cozy restaurant interior
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',   // Wine & dinner setting
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80',       // Gourmet plating
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80',   // Restaurant ambiance
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80',       // Outdoor dining
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80',   // Brunch spread
];

export default function CustomerBackground() {
  return (
    <BackgroundCarousel
      images={CUSTOMER_IMAGES}
      interval={8000}
      overlayBg="linear-gradient(135deg, rgba(7,9,14,0.95) 0%, rgba(15,17,21,0.8) 50%, rgba(7,9,14,0.9) 100%)"
      fadeDuration={1.5}
      className="pointer-events-none"
    />
  );
}