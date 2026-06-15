"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80', alt: 'Plated gourmet dish' },
  { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80', alt: 'Steak and vegetables' },
  { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80', alt: 'Fine dining interior' },
  { src: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=700&q=80', alt: 'Chef preparing food' },
  { src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=700&q=80', alt: 'Cooking ingredients' },
];

export default function FoodCrossfadeGallery() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="(max-width: 400px) 100vw, 400px"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/20 via-transparent to-transparent" />

        {/* Bottom bar with dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-700 ${
                i === index
                  ? 'w-8 bg-white/90'
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`View image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Image label */}
      <div className="absolute -bottom-6 left-4 text-[11px] text-gray-500 font-medium tracking-wide flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        {images[index].alt}
      </div>
    </div>
  );
}
