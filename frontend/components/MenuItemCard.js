"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';

export default function MenuItemCard({ item, onAdd }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-panel rounded-[20px] overflow-hidden border border-white/5 shadow-glass"
    >
      <div className="relative h-36 bg-panel">
        <Image src={item.image} alt={item.name} fill className="object-cover opacity-90" sizes="(max-width: 768px) 50vw, 33vw" />
        {item.tags?.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/90 text-white font-semibold">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-white text-sm">{item.name}</h3>
          <span className="text-primary font-bold">${item.price?.toFixed(2)}</span>
        </div>
        {item.rating && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {item.rating}
          </p>
        )}
        <button
          type="button"
          onClick={() => onAdd?.(item)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-white transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
