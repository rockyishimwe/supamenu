"use client";
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';

const NEXT_STATUS = { new: 'preparing', preparing: 'ready', ready: 'served', served: 'paid' };

export default function OrderKanbanCard({ order, onAdvance }) {
  const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const next = NEXT_STATUS[order.status];
  const mins = Math.floor((Date.now() - new Date(order.createdAt || Date.now()).getTime()) / 60000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className="glass-panel rounded-[20px] p-4 border border-white/5 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-primary">#{order._id?.slice(-4)}</span>
        <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {mins}m</span>
      </div>
      <p className="text-sm font-semibold text-white">Table {order.tableNumber || '—'}</p>
      <p className="text-xs text-gray-500 mt-1">{itemCount} items · ${order.total?.toFixed(2)}</p>
      {next && (
        <button
          type="button"
          onClick={() => onAdvance?.(order._id, next)}
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-white transition-colors font-semibold"
        >
          Move to {next} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}
