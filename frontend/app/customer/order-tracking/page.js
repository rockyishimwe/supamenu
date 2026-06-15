"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDineFlow } from '../../context';
import { Check } from 'lucide-react';
import BackButton from '../../../components/BackButton';

const STEPS = [
  { key: 'new', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Delivered' },
];

const STATUS_ORDER = ['new', 'preparing', 'ready', 'served', 'paid'];

function OrderTrackingContent() {
  const params = useSearchParams();
  const orderId = params.get('id');
  const { orders } = useDineFlow();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const found = orders.find((o) => o._id === orderId);
    if (found) setOrder(found);
  }, [orders, orderId]);

  useEffect(() => {
    if (!order || order.status === 'paid' || order.status === 'served') return;
    const idx = STATUS_ORDER.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_ORDER.length - 2) return;
    const timer = setTimeout(() => {
      setOrder((prev) => ({ ...prev, status: STATUS_ORDER[idx + 1] }));
    }, 8000);
    return () => clearTimeout(timer);
  }, [order]);

  if (!order) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <BackButton />
        <p className="text-center text-gray-500 py-12">Order not found</p>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === order.status) >= 0
    ? STEPS.findIndex((s) => s.key === order.status)
    : order.status === 'paid' ? STEPS.length : 0;

  return (
    <div className="max-w-lg mx-auto space-y-8 py-8">
      <BackButton />
      <div className="text-center">
        <h1 className="text-2xl font-bold font-display text-white">Order Tracking</h1>
        <p className="text-gray-500 text-sm mt-1">#{order._id?.slice(-6)} · Table {order.tableNumber}</p>
      </div>
      <div className="relative">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={active ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ repeat: active ? Infinity : 0, duration: 2 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    done ? 'bg-primary border-primary text-white' : 'border-white/20 text-gray-500'
                  }`}
                >
                  {done ? <Check className="w-5 h-5" /> : i + 1}
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[40px] ${done ? 'bg-primary' : 'bg-white/10'}`} />
                )}
              </div>
              <div className="pt-2">
                <p className={`font-semibold ${done ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                {active && <p className="text-xs text-primary mt-1 animate-pulse">In progress...</p>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="glass-panel rounded-[20px] p-4 border border-white/5">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1 text-gray-400">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10 mt-2">
          <span>Total</span>
          <span className="text-primary">${order.total?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<p className="text-center py-20">Loading...</p>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
