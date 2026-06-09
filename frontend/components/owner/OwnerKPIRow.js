"use client";
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { staggerContainer, fadeUpItem } from '../PageTransition';
import AnimatedCounter from '../AnimatedCounter';

export default function OwnerKPIRow({ totalRevenue, activeTablesCount, totalTables, totalReservationsCount, menuItemsLength }) {
  const kpis = [
    { label: 'Weekly Revenue', value: totalRevenue, prefix: '$', suffix: '', color: 'text-[#FF6B00]', change: '+18% from last week' },
    { label: 'Floor Occupancy', value: Math.round((activeTablesCount / (totalTables || 1)) * 100), prefix: '', suffix: '%', color: 'text-blue-400', change: 'Active floor layout' },
    { label: 'Active Bookings', value: totalReservationsCount, prefix: '', suffix: '', color: 'text-yellow-400', change: 'Seated reservations' },
    { label: 'Food Items Listed', value: menuItemsLength, prefix: '', suffix: '', color: 'text-emerald-500', change: 'Menu categories active' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {kpis.map((kpi, idx) => (
        <motion.div
          key={idx}
          variants={fadeUpItem}
          whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="p-5 rounded-3xl bg-panel border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden cursor-default"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/2 rounded-full filter blur-xl"></div>
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">{kpi.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-600" />
          </div>
          <div>
            <p className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>
              <AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} duration={1.5} />
            </p>
            <p className="text-[9px] text-gray-500 mt-1 font-semibold">{kpi.change}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}