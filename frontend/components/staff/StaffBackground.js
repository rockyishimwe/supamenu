"use client";
import BackgroundCarousel from '../BackgroundCarousel';

/**
 * StaffBackground — Kitchen workflow & service imagery
 * Dynamic, energetic photos showing restaurant operations
 */
const STAFF_IMAGES = [
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1600&q=80', // Chef at work
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',   // Bar/service area
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80',   // Table service
  'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1600&q=80', // Wine service
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1600&q=80', // Outdoor service
];

export default function StaffBackground() {
  return (
    <BackgroundCarousel
      images={STAFF_IMAGES}
      interval={9000}
      overlayBg="linear-gradient(135deg, rgba(7,9,14,0.94) 0%, rgba(15,17,21,0.82) 50%, rgba(7,9,14,0.88) 100%)"
      fadeDuration={1.6}
      className="pointer-events-none"
    />
  );
}