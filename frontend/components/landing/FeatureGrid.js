'use client';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../PageTransition';

const features = [
  { title: 'Smart Reservations', desc: 'Real-time table availability and instant reservations for a hassle-free experience.', color: 'from-[#FF6B00] to-amber-500' },
  { title: 'QR Ordering', desc: 'Scan, browse menus, and pay directly from smartphones for zero friction.', color: 'from-blue-500 to-indigo-500' },
  { title: 'Kitchen Displays', desc: 'Streamline kitchen operations with digital ticketing and automated queues.', color: 'from-[#22C55E] to-emerald-500' },
  { title: 'Analytics & Reports', desc: 'Make data-driven decisions with rich dashboards on sales and visits.', color: 'from-purple-500 to-pink-500' },
  { title: 'Staff Rosters', desc: 'Manage team schedules, roles, waiters, and performance tracking.', color: 'from-red-500 to-orange-500' },
];

export default function FeatureGrid() {
  return (
    <motion.section
      id="features"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-8 py-24 space-y-16"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Everything You Need, All in One Place</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">Powerful components built together for a modern, fluid dining ecosystem.</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-40px' }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, i) => (
          <motion.div
            key={i}
            variants={fadeUpItem}
            className="p-6 rounded-3xl bg-panel border border-white/5 hover:border-white/10 hover-lift transition-all space-y-4 card-shine"
          >
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center font-bold text-white text-sm`}>
              0{i + 1}
            </div>
            <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
