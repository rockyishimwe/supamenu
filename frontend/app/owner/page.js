'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useDineFlow } from '../context';
import { SkeletonRow } from '../../components/SkeletonRow';
import dynamic from 'next/dynamic';
import { 
  TrendingUp, Calendar, Users, ShoppingBag, ArrowUpRight, 
  Activity, Star, Clock, Sparkles, Check
} from 'lucide-react';
import MiniCalendar from '../../components/MiniCalendar';
import OwnerKPIRow from '../../components/owner/OwnerKPIRow';
import MenuCRUDPanel from '../../components/owner/MenuCRUDPanel';
import { staggerContainer, fadeUpItem, slideInLeft, slideInRight, slideUpView, scaleInView } from '../../components/PageTransition';
import { mockSalesData, mockTimePeakData } from '../../lib/mock-data-owner';

const ChartsSection = dynamic(() => import('../../components/owner/ChartsSection'), { ssr: false });

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
          <motion.div variants={fadeUpItem} className="lg:col-span-6">
            <MenuCRUDPanel
              menuItems={menuItems}
              onAddItem={() => addMenuItem({
                name: 'New Special',
                category: 'Appetizers',
                price: 12.99,
                stockLevel: 20,
                tags: ['New'],
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
              })}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}