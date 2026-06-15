"use client";
import { AnimatePresence } from 'framer-motion';
import { useDineFlow } from '../../context';
import OrderKanbanCard from '../../../components/OrderKanbanCard';
import { ClipboardList, Package } from 'lucide-react';
import BackButton from '../../../components/BackButton';

const PIPELINE = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
  { key: 'paid', label: 'Paid' },
];

export default function StaffOrders() {
  const { orders, updateOrderStatus } = useDineFlow();

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> Orders Kanban
        </h1>
        <p className="text-gray-500 text-sm">Drag or click to advance orders through all stages.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-panel border border-dashed border-white/5 rounded-3xl text-gray-500">
          <Package className="w-12 h-12 mx-auto text-gray-600 mb-3 animate-pulse" />
          <p className="text-sm font-semibold">No orders yet today.</p>
          <p className="text-xs mt-1">New orders from customers will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {PIPELINE.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-[20px] bg-white/5 border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{col.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">{colOrders.length}</span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  <AnimatePresence mode="popLayout">
                    {colOrders.map((order) => (
                      <OrderKanbanCard
                        key={order._id}
                        order={order}
                        onAdvance={(id, status) => updateOrderStatus(id, status)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
