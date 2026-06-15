'use client';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../PageTransition';

const stats = [
  { value: '2,500+', label: 'Restaurants', desc: 'Trust our platform' },
  { value: '150K+', label: 'Happy Customers', desc: 'Served daily' },
  { value: '250K+', label: 'Orders Processed', desc: 'Every day' },
  { value: '99.9%', label: 'Uptime SLA', desc: 'Always reliable' },
];

export default function StatsBar() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="bg-panel border-y border-white/5 py-12"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={fadeUpItem} className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-white">{stat.value}</p>
            <p className="text-sm font-semibold text-gray-300">{stat.label}</p>
            <p className="text-xs text-gray-500">{stat.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
