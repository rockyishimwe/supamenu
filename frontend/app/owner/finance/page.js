"use client";
import React from 'react';
import { useDineFlow } from '../../context';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Coins, Download, Calendar, ArrowUpRight, 
  DollarSign, Activity, FileText, Landmark
} from 'lucide-react';
import { DEFAULTS } from '../../../lib/constants';
import BackButton from '../../../components/BackButton';

const mockMonthlyRevenue = [
  { month: 'Jan', revenue: 14500, expenses: 8500 },
  { month: 'Feb', revenue: 19200, expenses: 9800 },
  { month: 'Mar', revenue: 17800, expenses: 9200 },
  { month: 'Apr', revenue: 22600, expenses: 11000 },
  { month: 'May', revenue: 28400, expenses: 12500 },
  { month: 'Jun', revenue: 35000, expenses: 15000 }
];

const paymentBreakdownData = [
  { name: 'DineFlow Wallet', value: 6500, color: '#FF6B00' },
  { name: 'Mobile Money', value: 3400, color: '#3b82f6' },
  { name: 'Credit Cards', value: 2750, color: '#22c55e' }
];

export default function OwnerFinance() {
  const { orders } = useDineFlow();

  // Dynamic calculations from orders if any
  const dynamicTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-8 space-y-8 bg-surface min-h-screen text-gray-300">
      <BackButton />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#FF6B00]" /> Financial Reports & Payouts
          </h2>
          <p className="text-[11px] text-gray-500">Analyze net profit margins, download billing tax records, and study payment methods.</p>
        </div>
        
        <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover-lift transition-all">
          <Download className="w-4 h-4" /> Export Report (CSV)
        </button>
      </div>

      {/* Math summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', val: `$${(35000 + dynamicTotal).toLocaleString()}`, change: '+12.5% Month-over-Month', icon: DollarSign },
          { label: 'Net Profit Margin', val: '$20,000', change: '57.1% margins active', icon: Landmark },
          { label: `Platform Taxes (${DEFAULTS.TAX_RATE}%)`, val: `$${((35000 + dynamicTotal) * (DEFAULTS.TAX_RATE / 100)).toLocaleString()}`, change: 'Accumulated taxes due', icon: FileText },
          { label: 'Average Ticket Bill', val: '$32.50', change: 'Based on last 500 visitors', icon: Activity }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 rounded-3xl bg-panel border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">{card.label}</span>
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-tight text-white">{card.val}</p>
                <p className="text-[9px] text-gray-500 mt-1 font-semibold">{card.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Revenue vs Expenses BarChart (Left) */}
        <div className="lg:col-span-8 bg-panel border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Monthly Profit Margins</h3>
            <p className="text-[10px] text-gray-500">Gross revenue vs operational costs breakdown.</p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMonthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="revenue" name="Revenue ($)" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payments breakdown PieChart (Right) */}
        <div className="lg:col-span-4 bg-panel border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Payment Distribution</h3>
            <p className="text-[10px] text-gray-500">Breakdown of channels preferred by visitors.</p>
          </div>

          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '9px' }} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
