'use client';
import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem } from '../PageTransition';

export default function ChartsSection({ salesData, coversData }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: '-80px' }}
      className="grid lg:grid-cols-12 gap-8 mt-8"
    >
      <motion.div variants={fadeUpItem} className="lg:col-span-8 bg-panel border border-white/5 p-6 rounded-3xl space-y-4 card-shine">
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
              <defs>
                <linearGradient id="salesGradOwner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#FF6B00" fill="url(#salesGradOwner)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div variants={fadeUpItem} className="lg:col-span-4 bg-panel border border-white/5 p-6 rounded-3xl space-y-4 card-shine">
        <div className="pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Covers by Day of Week</h3>
          <p className="text-[10px] text-gray-500">Reservation covers across the week.</p>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coversData}>
              <defs>
                <linearGradient id="colorCovers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
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
      </motion.div>
    </motion.div>
  );
}
