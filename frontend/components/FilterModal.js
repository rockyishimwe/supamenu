"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function FilterModal({ open, onClose, onApply }) {
  const [rating, setRating] = useState(4);
  const [distance, setDistance] = useState(5);
  const [price, setPrice] = useState(2);
  const [cuisines, setCuisines] = useState([]);

  const toggleCuisine = (c) => {
    setCuisines((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-panel-heavy rounded-t-[20px] p-6 border-t border-white/10 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-display">Filters</h2>
              <button type="button" onClick={onClose}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Min Rating: {rating}★</label>
                <input type="range" min="1" max="5" step="0.5" value={rating} onChange={(e) => setRating(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Distance: {distance} km</label>
                <input type="range" min="1" max="20" value={distance} onChange={(e) => setDistance(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Price Level: {'$'.repeat(price)}</label>
                <input type="range" min="1" max="4" value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Cuisine</p>
                <div className="flex flex-wrap gap-2">
                  {['Italian', 'Japanese', 'American', 'Indian'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        cuisines.includes(c) ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-gray-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { onApply?.({ rating, distance, price, cuisines }); onClose(); }}
              className="w-full mt-6 py-3 rounded-[20px] bg-primary text-white font-bold"
            >
              Apply Filters
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
