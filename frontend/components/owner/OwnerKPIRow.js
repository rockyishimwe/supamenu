"use client";
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { staggerContainer, fadeUpItem } from '../PageTransition';

export default function OwnerKPIRow({ totalRevenue, activeTablesCount, totalTables, totalReservationsCount, menuItemsLength }) {
  const kpis = [
    { label: 'Weekly Revenue', val: `$${totalRevenue.toLocaleString()}`, change: '+18% from last week', color: 'text-[#FF6B00]' },
    { label: 'Floor Occupancy', val: `${Math.round((activeTablesCount / (totalTables || 1)) * 100)}%`, change: 'Active floor layout', color: 'text-blue-400' },
    { label: 'Active Bookings', val: totalReservationsCount, change: 'Seated reservations', color: 'text-yellow-400' },
    { label: 'Food Items Listed', val: menuItemsLength, change: 'Menu categories active', color: 'text-emerald-500' },
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
            <p className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.val}</p>
            <p className="text-[9px] text-gray-500 mt-1 font-semibold">{kpi.change}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}