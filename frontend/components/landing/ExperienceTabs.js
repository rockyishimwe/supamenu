'use client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react';
import { staggerContainer, fadeUpItem } from '../PageTransition';

const customerBenefits = ['Find top-rated cuisines', 'Reserve visual tables instantly', 'Earn loyalty membership rewards'];
const ownerBenefits = ['Manage menus and categories', 'Monitor team schedules and waiters', 'Study sales and analytics trends'];
const staffBenefits = ['Update table service statuses', 'Direct notifications from kitchen', 'Track tip splits and checklists'];

export default function ExperienceTabs({ activeTab, setActiveTab }) {
  const benefits = activeTab === 'customer' ? customerBenefits : activeTab === 'owner' ? ownerBenefits : staffBenefits;
  const titles = { customer: 'Discover & Book Instantly', owner: 'Optimize Your Operations', staff: 'Perform with Perfection' };
  const descriptions = {
    customer: 'Explore trending nearby restaurants, customize orders ahead of time, check live table layouts, and book tables with one click.',
    owner: 'Configure interactive floor plan layout, add/edit food items in menus, assign servers, set local tax preferences, and study growth reports.',
    staff: 'Track seating duration in real-time. Speed up order status updates (New → Preparing → Ready → Served → Paid) to enhance visitor experience.',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-8 py-24 space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Choose Your Experience</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">One integrated system catering to every role inside the culinary environment.</p>
      </div>

      <div className="flex justify-center gap-4 max-w-lg mx-auto">
        {['customer', 'owner', 'staff'].map((role) => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className={`flex-1 py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === role
                ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/15'
                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            I&apos;m a {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto p-8 rounded-3xl bg-panel border border-white/5 grid md:grid-cols-2 gap-8 items-center"
      >
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white capitalize">{titles[activeTab]}</h3>
          <p className="text-gray-400 text-xs leading-relaxed">{descriptions[activeTab]}</p>
          <ul className="space-y-3">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" /> {benefit}
              </li>
            ))}
          </ul>
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#e05e00] px-6 py-3 rounded-xl transition-all shadow-md shadow-[#FF6B00]/10">
            Enter Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Preview Dashboard</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] font-semibold">Active</span>
          </div>

          {activeTab === 'customer' && (
            <div className="space-y-3">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="h-10 bg-white/5 rounded-xl flex items-center justify-between px-3 text-[11px]">
                <span>The Garden Bistro</span>
                <span className="text-green-500">Confirmed • Table 2</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="h-10 bg-white/5 rounded-xl flex items-center justify-between px-3 text-[11px]">
                <span>Sakura Sushi</span>
                <span className="text-gray-500">12:00 PM • Fri</span>
              </motion.div>
            </div>
          )}
          {activeTab === 'owner' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Total Revenue</span>
                <span className="font-bold text-white">$12,650</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} className="h-full bg-[#FF6B00] rounded-full" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500">
                <span>+18% from last week</span>
                <span>75% Capacity</span>
              </div>
            </div>
          )}
          {activeTab === 'staff' && (
            <div className="space-y-3">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between px-3 text-[10px] text-red-400">
                <span>Table 2 - Needs Service</span>
                <span>35m duration</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="h-9 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between px-3 text-[10px] text-yellow-400">
                <span>Table 3 - Waiting for Food</span>
                <span>22m duration</span>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}
