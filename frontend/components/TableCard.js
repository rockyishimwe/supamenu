"use client";
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  available: 'border-available bg-available/10 text-available',
  occupied: 'border-occupied bg-occupied/10 text-occupied',
  reserved: 'border-reserved bg-reserved/10 text-reserved',
  cleaning: 'border-cleaning bg-cleaning/10 text-cleaning',
};

export default function TableCard({ table, selected, onClick }) {
  const colors = STATUS_COLORS[table.status] || STATUS_COLORS.available;
  return (
    <motion.button
      type="button"
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(table)}
      className={`text-left p-4 rounded-[20px] border-2 transition-shadow ${colors} ${selected ? 'ring-2 ring-primary shadow-elevated' : ''}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white">Table {table.tableNumber}</span>
        <span className="text-[10px] uppercase font-semibold">{table.status}</span>
      </div>
      <p className="text-sm text-gray-400">{table.capacity} seats · {table.location || 'Main Floor'}</p>
      {table.currentGuestName && <p className="text-xs text-gray-500 mt-1">{table.currentGuestName}</p>}
    </motion.button>
  );
}
