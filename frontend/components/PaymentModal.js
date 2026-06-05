"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Wallet } from 'lucide-react';

const METHODS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
];

export default function PaymentModal({ open, onClose, total, onConfirm }) {
  const [method, setMethod] = useState('wallet');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    await onConfirm?.(method);
    setProcessing(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-panel-heavy rounded-[20px] p-6 border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-display text-white">Select Payment</h2>
              <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-3xl font-extrabold text-primary mb-6">${total?.toFixed(2)}</p>
            <div className="flex gap-2 mb-6">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-[20px] border transition-all ${
                    method === m.id ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <m.icon className="w-6 h-6" />
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={processing}
              onClick={handlePay}
              className="w-full py-3.5 rounded-[20px] bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Confirm Payment'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
