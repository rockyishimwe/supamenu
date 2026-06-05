"use client";
import { useDineFlow } from '../context';
import StatsCard from '../../components/StatsCard';
import FloorPlan from '../../components/FloorPlan';
import TableContextPanel from '../../components/TableContextPanel';
import { LayoutGrid, Users, ClipboardList, Sparkles } from 'lucide-react';

export default function StaffDashboard() {
  const { tables, orders, reservations, selectedTableId, setSelectedTableId } = useDineFlow();
  const gardenTables = tables.filter((t) => !t.restaurantId || t.restaurantId === 'res-garden' || String(t.restaurantId).length > 20).slice(0, 15);
  const displayTables = gardenTables.length >= 12 ? gardenTables : tables.slice(0, 15);
  const selectedTable = displayTables.find((t) => t._id === selectedTableId);

  const countAvailable = displayTables.filter((t) => t.status === 'available').length;
  const countOccupied = displayTables.filter((t) => t.status === 'occupied').length;
  const pendingOrders = orders.filter((o) => ['new', 'preparing'].includes(o.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Good morning, Alex 👋</h1>
        <p className="text-gray-500 text-sm">Here&apos;s what&apos;s happening in your restaurant today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Today's Orders" value={orders.length || 128} icon={ClipboardList} trend="+18% vs yesterday" />
        <StatsCard label="Active Tables" value={countOccupied} icon={Users} accent="text-emerald-400" />
        <StatsCard label="Pending Orders" value={pendingOrders || 12} icon={Sparkles} trend="Need Attention" trendUp={false} />
        <StatsCard label="Reservations" value={reservations.filter((r) => r.status === 'confirmed').length} icon={LayoutGrid} />
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" /> Live Floor Plan
          </h3>
          <FloorPlan
            tables={displayTables}
            selectedTableId={selectedTableId}
            onTableSelect={(t) => setSelectedTableId(t._id)}
          />
        </div>
        <div className="lg:col-span-4">
          <TableContextPanel table={selectedTable} onClose={() => setSelectedTableId(null)} />
        </div>
      </div>
    </div>
  );
}
