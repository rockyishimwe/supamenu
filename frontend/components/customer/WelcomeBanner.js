"use client";
import Link from 'next/link';
import { Sparkles, Award, Wallet } from 'lucide-react';

export default function WelcomeBanner({ currentUser }) {
  return (
    <div className="grid md:grid-cols-12 gap-6 items-stretch">
      <div className="md:col-span-8 bg-gradient-to-br from-[#0f1115] to-[#07090e] border border-white/5 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 rounded-full filter blur-3xl"></div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[10px] uppercase font-bold tracking-wider text-[#FF6B00]">
            <Sparkles className="w-3 h-3" /> Dining Ecosystem Active
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Hello, <span className="text-[#FF6B00]">{currentUser?.name || 'Guest'}</span>
            </h2>
            <p className="text-xs text-gray-400 max-w-md leading-relaxed">
              Discover the best gourmet restaurants near you, reserve your favorite table visually, and enjoy a premium contactless ordering experience.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5 mt-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B00]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Loyalty Status</p>
              <p className="text-xs text-white font-bold">{currentUser?.customerDetails?.loyaltyTier || 'Gold Member'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B00]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Loyalty Points</p>
              <p className="text-xs text-white font-bold">{currentUser?.customerDetails?.points || '0'} pts</p>
            </div>
          </div>
        </div>
      </div>
      <div className="md:col-span-4 bg-panel border border-white/5 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl"></div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400">DineFlow Pay Wallet</span>
            <Wallet className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white tracking-tight">
              ${currentUser?.walletBalance !== undefined ? currentUser.walletBalance.toFixed(2) : '0.00'}
            </p>
            <p className="text-[10px] text-gray-500">Secure one-tap QR billing payments</p>
          </div>
        </div>
        <div className="pt-4">
          <Link href="/customer/profile?tab=wallet" className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-xs text-white font-semibold transition-all duration-200 block">
            Top Up Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}
