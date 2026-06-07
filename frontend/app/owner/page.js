"use client";
import React from 'react';
import { useDineFlow } from '../context';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Calendar, Users, ShoppingBag, ArrowUpRight, 
  Activity, Star, Clock, Sparkles, Plus
} from 'lucide-react';
import MiniCalendar from '../../components/MiniCalendar';
import OwnerKPIRow from '../../components/owner/OwnerKPIRow';

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

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4].map(i => (
        <div key={i} className="p-5 rounded-3xl bg-panel border border-white/5 h-28">
          <div className="h-3 bg-white/5 rounded w-20 mb-4" />
          <div className="h-6 bg-white/5 rounded w-24" />
          <div className="h-3 bg-white/5 rounded w-16 mt-2" />
        </div>
      ))}
    </div>
  );
}

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

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-surface min-h-screen">
        <SkeletonRow />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8"><SkeletonChart /></div>
          <div className="lg:col-span-4"><SkeletonChart /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-surface min-h-screen text-gray-300">
      
      {/* Upper KPIs Row */}
      <OwnerKPIRow
        totalRevenue={totalRevenue}
        activeTablesCount={activeTablesCount}
        totalTables={tables.length}
        totalReservationsCount={totalReservationsCount}
        menuItemsLength={menuItems.length}
      />

      {/* Main charts split */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Sales Chart (Left) */}
        <div className="lg:col-span-8 bg-panel border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Daily Sales & Bookings Trend</h3>
              <p className="text-[10px] text-gray-500">Sales volume and customer table layout bookings.</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF6B00]/10 text-[#FF6B00] font-bold">Weekly Performance</span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#FF6B00" fill="url(#salesGrad)" strokeWidth={2} />
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Seating Hours (Right) */}
        <div className="lg:col-span-4 bg-panel border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Covers by Day of Week</h3>
            <p className="text-[10px] text-gray-500">Reservation covers across the week.</p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coversData}>
                <defs>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                />
                <Bar dataKey="covers" name="Covers" fill="#FF6B00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <MiniCalendar />
        </div>
        {myRestaurant?.inviteCode && (
        <div className="lg:col-span-3 bg-panel border border-white/5 p-5 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Staff Invite Code</h3>
          <p className="text-[10px] text-gray-500">Share this code with staff to join your restaurant.</p>
          <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <span className="text-2xl font-mono font-extrabold tracking-[0.2em] text-[#FF6B00]">{myRestaurant.inviteCode}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(myRestaurant.inviteCode)}
              className="px-3 py-1.5 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 border border-[#FF6B00]/20 rounded-xl text-[10px] text-[#FF6B00] font-bold transition-all"
            >
              Copy
            </button>
          </div>
        </div>
        )}
        <div className="lg:col-span-6 glass-panel rounded-[20px] p-6 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Menu CRUD</h3>
            <button
              type="button"
              onClick={() => addMenuItem({ name: 'New Special', category: 'Appetizers', price: 12.99, stockLevel: 20, tags: ['New'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' })}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-primary text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {menuItems.slice(0, 6).map((item) => (
              <div key={item._id} className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-white">{item.name}</span>
                <span className="text-primary font-semibold">${item.price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
