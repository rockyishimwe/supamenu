"use client";
import BackgroundCarousel from '../BackgroundCarousel';

/**
 * OwnerBackground — Professional restaurant management imagery
 * Clean, sophisticated photos suggesting business operations
 */
const OWNER_IMAGES = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',   // Modern restaurant bar
  'https://images.unsplash.com/photo-1590845947881-6f2f1c1a3d98?w=1600&q=80', // Kitchen pass / management view
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1600&q=80', // Restaurant exterior
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80', // Chef/kitchen professional
  'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1600&q=80', // Wine cellar / inventory
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1600&q=80', // Restaurant terrace
];

export default function OwnerBackground() {
  return (
    <BackgroundCarousel
      images={OWNER_IMAGES}
      interval={10000}
      overlayBg="linear-gradient(135deg, rgba(7,9,14,0.96) 0%, rgba(15,17,21,0.85) 50%, rgba(7,9,14,0.92) 100%)"
      fadeDuration={1.8}
      className="pointer-events-none"
    />
  );
}