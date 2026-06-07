"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'primary' | 'warning'
  icon: Icon = AlertTriangle,
}) {
  const confirmColors =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600'
      : variant === 'warning'
      ? 'bg-amber-500 hover:bg-amber-600'
      : 'bg-primary hover:bg-primary/90';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#0f1115] border border-white/10 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  variant === 'danger' ? 'bg-red-500/15' : variant === 'warning' ? 'bg-amber-500/15' : 'bg-primary/15'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    variant === 'danger' ? 'text-red-400' : variant === 'warning' ? 'text-amber-400' : 'text-primary'
                  }`} />
                </div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400">{message}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-white/5 hover:bg-white/5 text-xs text-gray-400 rounded-xl font-medium transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 text-white text-xs font-bold rounded-xl transition-colors ${confirmColors}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
