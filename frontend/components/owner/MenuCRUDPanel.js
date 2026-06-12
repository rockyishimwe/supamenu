'use client';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function MenuCRUDPanel({ menuItems, onAddItem }) {
  return (
    <div className="glass-panel rounded-[20px] p-6 border border-white/5 card-shine">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Menu CRUD</h3>
        <motion.button
          type="button"
          onClick={onAddItem}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-primary text-white font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </motion.button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {menuItems.slice(0, 6).map((item, idx) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3, ease: 'easeOut' }}
            className="flex justify-between items-center py-2 border-b border-white/5 text-sm"
          >
            <span className="text-white">{item.name}</span>
            <span className="text-primary font-semibold">${item.price?.toFixed(2)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
