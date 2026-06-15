"use client";
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export default function StatsCard({ label, value, icon: Icon, trend, trendUp = true, accent = 'text-primary' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-panel rounded-[20px] p-5 border border-white/5 shadow-elevated"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">{label}</p>
          <p className="text-3xl font-extrabold font-display tracking-tight text-white">
            <AnimatedCounter value={value} duration={1.2} />
          </p>
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl bg-white/5 ${accent}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
