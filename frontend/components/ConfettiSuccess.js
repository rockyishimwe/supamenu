"use client";
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export default function ConfettiSuccess({ show, message = 'Reservation Confirmed!' }) {
  useEffect(() => {
    if (!show) return;
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#FF6B00', '#22c55e', '#f59e0b'] });
    const t = setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 200);
    const t2 = setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 400);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [show]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="glass-panel-heavy rounded-[20px] p-8 text-center border border-white/10 max-w-sm mx-4">
        <svg viewBox="0 0 52 52" className="w-16 h-16 mx-auto mb-4">
          <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#22c55e" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
          <motion.path fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" d="M14 27l8 8 16-16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3 }} />
        </svg>
        <h3 className="text-xl font-bold font-display text-white">{message}</h3>
      </div>
    </motion.div>
  );
}
