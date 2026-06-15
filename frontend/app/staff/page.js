"use client";
import { motion } from 'framer-motion';
import { useStore } from '../../lib/store';
import { SkeletonRow } from '../../components/SkeletonRow';
import StatsCard from '../../components/StatsCard';
import FloorPlan from '../../components/FloorPlan';
import TableContextPanel from '../../components/TableContextPanel';
import { LayoutGrid, Users, ClipboardList, Sparkles } from 'lucide-react';
import { staggerContainer, fadeUpItem, slideInLeft, slideInRight } from '../../components/PageTransition';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function StaffDashboard() {
  const { tables, orders, reservations, selectedTableId, setSelectedTableId, currentUser } = useStore();
  
  if (!tables || !orders) return <SkeletonRow />;

  const staffRestId = currentUser?.staffDetails?.restaurantId;

  const displayTables = tables.filter((t) => t.restaurantId === staffRestId);
  const selectedTable = displayTables.find((t) => t._id === selectedTableId);

  const countAvailable = displayTables.filter((t) => t.status === 'available').length;
  const countOccupied = displayTables.filter((t) => t.status === 'occupied').length;
  const pendingOrders = orders.filter((o) => o.restaurantId === staffRestId && ['new', 'preparing'].includes(o.status)).length;
  const restaurantOrders = orders.filter((o) => o.restaurantId === staffRestId);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <ErrorBoundary>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-2xl font-bold font-display text-white">{greeting}, {currentUser?.name || 'Staff'} 👋</h1>
        <p className="text-gray-500 text-sm">Here&apos;s what&apos;s happening in your restaurant today.</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={fadeUpItem}>
          <StatsCard label="Today's Orders" value={restaurantOrders.length} icon={ClipboardList} />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <StatsCard label="Active Tables" value={countOccupied} icon={Users} accent="text-emerald-400" />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <StatsCard label="Pending Orders" value={pendingOrders} icon={Sparkles} trend="Need Attention" trendUp={false} />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <StatsCard label="Reservations" value={reservations.filter((r) => r.restaurantId === staffRestId && r.status === 'confirmed').length} icon={LayoutGrid} />
        </motion.div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid lg:grid-cols-12 gap-6"
      >
        <motion.div variants={slideInLeft} className="lg:col-span-8 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" /> Live Floor Plan
          </h3>
          <FloorPlan
            tables={displayTables}
            selectedTableId={selectedTableId}
            onTableSelect={(t) => setSelectedTableId(t._id)}
          />
        </motion.div>
        <motion.div variants={slideInRight} className="lg:col-span-4">
          <TableContextPanel table={selectedTable} onClose={() => setSelectedTableId(null)} />
        </motion.div>
      </motion.div>
    </motion.div>
    </ErrorBoundary>
  );
}