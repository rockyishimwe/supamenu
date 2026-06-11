'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function MenuCRUDPanel({ menuItems, addMenuItem }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="lg:col-span-6 glass-panel rounded-[20px] p-6 border border-white/5 card-shine"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Menu CRUD</h3>
        <motion.button
          type="button"
          onClick={() => addMenuItem({
            name: 'New Special',
            category: 'Appetizers',
            price: 12.99,
            stockLevel: 20,
            tags: ['New'],
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
          })}
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
    </motion.div>
  );
}
