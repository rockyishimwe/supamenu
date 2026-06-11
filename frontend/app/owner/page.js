'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useDineFlow } from '../context';
import { SkeletonRow } from '../../components/SkeletonRow';
import dynamic from 'next/dynamic';
import { 
  TrendingUp, Calendar, Users, ShoppingBag, ArrowUpRight, 
  Activity, Star, Clock, Sparkles, Plus, Check
} from 'lucide-react';
import MiniCalendar from '../../components/MiniCalendar';
import OwnerKPIRow from '../../components/owner/OwnerKPIRow';
import { staggerContainer, fadeUpItem, slideInLeft, slideInRight, slideUpView, scaleInView } from '../../components/PageTransition';

const ChartsSection = dynamic(() => import('../../components/owner/ChartsSection'), { ssr: false });

const mockSalesData = [
  { name: 'Mon', sales: 1400, reservations: 12 },
  { name: 'Tue', sales: 2200, reservations: 18 },
  { name: 'Wed', sales: 1800, reservations: 15 },
  { name: 'Thu', sales: 2600, reservations: 22 },
  { name: 'Fri', sales: 3800, reservations: 32 },
  { name: 'Sat', sales: 5200, reservations: 45 },
  { name: 'Sun', sales: 4500, reservations: 38 }
];

const mockTimePeakData = [
  { time: '11am', occupancy: 20 },
  { time: '1pm', occupancy: 65 },
  { time: '3pm', occupancy: 30 },
  { time: '5pm', occupancy: 45 },
  { time: '7pm', occupancy: 90 },
  { time: '9pm', occupancy: 85 },
  { time: '11pm', occupancy: 25 }
];

function SkeletonChart() {
  return (
    <div className="bg-panel border border-white/5 p-6 rounded-3xl animate-pulse">
      <div className="h-4 bg-white/5 rounded w-48 mb-2" />
      <div className="h-3 bg-white/5 rounded w-32 mb-4" />
      <div className="h-[260px] bg-white/5 rounded-xl" />
    </div>
  );
}

export default function OwnerDashboard() {
  const { restaurants, menuItems, tables, reservations, orders, analytics, addMenuItem, currentUser } = useDineFlow();
  const [copied, setCopied] = React.useState(false);

  const loading = !analytics;

  const myRestaurant = currentUser?.ownerDetails?.restaurantId
    ? restaurants.find(r => r._id === currentUser.ownerDetails.restaurantId)
    : null;

  const salesData = analytics?.salesChart?.slice(-7).map((d, i) => ({
    name: d.date?.split(' ')[0] || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    sales: d.sales,
  })) || mockSalesData;
  const coversData = analytics?.reservationsChart || mockSalesData.map((d) => ({ day: d.name, covers: d.reservations }));

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0) + 12650;
  const activeTablesCount = tables.filter(t => t.status === 'occupied').length;
  const totalReservationsCount = reservations.length + 15;

  const handleCopyInvite = () => {
    if (myRestaurant?.inviteCode) {
      navigator.clipboard?.writeText(myRestaurant.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 space-y-8 bg-surface min-h-screen"
      >
        <SkeletonRow rows={4} />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8"><SkeletonChart /></div>
          <div className="lg:col-span-4"><SkeletonChart /></div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-surface min-h-screen text-gray-300">
      <div className="relative z-10">
        {/* Upper KPIs Row */}
        <motion.div
          variants={slideUpView}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-50px' }}
        >
          <OwnerKPIRow
            totalRevenue={totalRevenue}
            activeTablesCount={activeTablesCount}
            totalTables={tables.length}
            totalReservationsCount={totalReservationsCount}
            menuItemsLength={menuItems.length}
          />
        </motion.div>

        {/* Main charts split */}
        <ChartsSection salesData={salesData} coversData={coversData} />

        {/* Bottom Row */}

        {/* Bottom Row */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-80px' }}
          className="grid lg:grid-cols-12 gap-6 mt-6"
        >
          <motion.div variants={fadeUpItem} className="lg:col-span-3">
            <MiniCalendar />
          </motion.div>
          {myRestaurant?.inviteCode && (
            <motion.div variants={fadeUpItem} className="lg:col-span-3 bg-panel border border-white/5 p-5 rounded-3xl space-y-3 card-shine">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Staff Invite Code</h3>
              <p className="text-[10px] text-gray-500">Share this code with staff to join your restaurant.</p>
              <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <span className="text-2xl font-mono font-extrabold tracking-[0.2em] text-[#FF6B00]">{myRestaurant.inviteCode}</span>
                <motion.button
                  onClick={handleCopyInvite}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    copied
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 border border-[#FF6B00]/20 text-[#FF6B00]'
                  }`}
                >
                  {copied ? (
                    <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                  ) : (
                    'Copy'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
          <motion.div variants={fadeUpItem} className="lg:col-span-6 glass-panel rounded-[20px] p-6 border border-white/5 card-shine">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Menu CRUD</h3>
              <motion.button
                type="button"
                onClick={() => addMenuItem({ name: 'New Special', category: 'Appetizers', price: 12.99, stockLevel: 20, tags: ['New'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' })}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-primary text-white font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </motion.button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {menuItems.slice(0, 6).map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3, ease: 'easeOut' }}
                  className="flex justify-between items-center py-2 border-b border-white/5 text-sm"
                >
                  <span className="text-white">{item.name}</span>
                  <span className="text-primary font-semibold">${item.price?.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}