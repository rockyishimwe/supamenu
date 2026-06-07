"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../lib/useToast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: { icon: CheckCircle, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  error: { icon: XCircle, bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  info: { icon: Info, bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const c = config[t.type] || config.info;
          const Icon = c.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-xl ${c.bg} bg-opacity-80`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
