"use client";
import React, { useState, useEffect } from 'react';
import { useDineFlow } from '../../context';
import { 
  User, Wallet, Award, ShoppingBag, Plus, Sparkles, CheckCircle2, 
  Clock, ArrowRight, ShieldCheck, Mail, Calendar, CreditCard, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerProfile() {
  const { currentUser, orders, topUpWallet } = useDineFlow();
  const [activeTab, setActiveTab] = useState('profile'); // profile, orders, wallet
  
  // Wallet top-up input state
  const [topUpAmount, setTopUpAmount] = useState('50');
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);

  // Check URL params for pre-selecting tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['profile', 'orders', 'wallet'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) return;
    
    setTopUpLoading(true);
    await topUpWallet(amt);
    setTopUpLoading(false);
    setTopUpSuccess(true);
    
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FF6B00', '#ffffff', '#3B82F6']
    });

    setTimeout(() => {
      setTopUpSuccess(false);
    }, 3000);
  };

  return (
    <div className="p-8 space-y-8 bg-[#07090e] min-h-screen text-gray-300">
      
      {/* Top Banner: User card */}
      <div className="bg-[#0f1115] border border-white/5 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 rounded-full filter blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <img 
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"} 
            alt="Avatar" 
            className="w-20 h-20 rounded-2xl object-cover border border-white/10"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">{currentUser?.name || 'Sarah Jenkins'}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#FF6B00]" /> {currentUser?.email || 'sarah@dineflow.com'}</p>
            <p className="text-[10px] text-[#FF6B00] font-semibold uppercase tracking-wider bg-[#FF6B00]/10 px-2 py-0.5 rounded-md inline-block mt-1">
              {currentUser?.customerDetails?.loyaltyTier || 'Gold Member'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10 text-center">
          <div className="space-y-0.5">
            <p className="text-2xl font-bold text-white">${currentUser?.walletBalance !== undefined ? currentUser.walletBalance.toFixed(2) : '128.50'}</p>
            <p className="text-[10px] text-gray-500 font-semibold uppercase">Wallet Balance</p>
          </div>
          <div className="w-px h-10 bg-white/5"></div>
          <div className="space-y-0.5">
            <p className="text-2xl font-bold text-white">{currentUser?.customerDetails?.points || '350'}</p>
            <p className="text-[10px] text-gray-500 font-semibold uppercase">Loyalty Points</p>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-2 border-b border-[#1f2228] pb-4">
        {[
          { key: 'profile', label: 'Membership & Profile', icon: Award },
          { key: 'orders', label: 'Order History', icon: ShoppingBag },
          { key: 'wallet', label: 'Prepaid Wallet', icon: Wallet }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00]'
                  : 'bg-white/2 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        
        {/* Tab 1: Profile & Loyalty details */}
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Loyalty Membership card */}
            <div className="md:col-span-6 bg-gradient-to-br from-[#1b1c20] to-[#141519] border border-[#2d3139] p-6 rounded-3xl relative overflow-hidden group shadow-2xl space-y-6">
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF6B00]/10 rounded-full filter blur-2xl group-hover:bg-[#FF6B00]/15 transition-all"></div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Prestige Dining Card</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">DineFlow Club</h3>
                </div>
                <Award className="w-8 h-8 text-[#FF6B00]" />
              </div>

              <div className="pt-8 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Cardholder</span>
                  <span className="font-bold text-white uppercase">{currentUser?.name || 'Sarah Jenkins'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Membership Tier</span>
                  <span className="font-bold text-[#FF6B00]">{currentUser?.customerDetails?.loyaltyTier || 'Gold Member'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Prepaid Wallet PIN</span>
                  <span className="font-bold text-white font-mono">•••• •••• •••• 2026</span>
                </div>
              </div>
            </div>

            {/* Profile Information details */}
            <div className="md:col-span-6 bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Account Information</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Full Name</span>
                  <span className="font-semibold text-white">{currentUser?.name || 'Sarah Jenkins'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Email Address</span>
                  <span className="font-semibold text-white">{currentUser?.email || 'sarah@dineflow.com'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Role Status</span>
                  <span className="font-semibold text-[#FF6B00] uppercase text-[10px]">Customer Accounts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Your Orders History</h3>
            
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-[#0f1115] border border-dashed border-white/5 rounded-3xl text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-600 mb-3 animate-pulse" />
                <p className="text-sm font-semibold">No order history available.</p>
                <p className="text-xs mt-1">Visit restaurants to place items in cart and checkout.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div 
                    key={order._id}
                    className="p-5 bg-[#0f1115] border border-white/5 rounded-3xl hover:border-white/10 transition-all duration-300 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white tracking-tight">{order.restaurantName || "The Garden Bistro"}</h4>
                          <span className="text-[10px] text-gray-500">#{order._id.slice(-6)}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}</p>
                      </div>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        order.status === 'paid' || order.status === 'served'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : order.status === 'preparing' || order.status === 'new'
                          ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                          : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">
                            {item.name} <strong className="text-white">x{item.quantity}</strong>
                          </span>
                          <span className="font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total math */}
                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-white/5 text-xs">
                      <span className="text-gray-500">Method: {order.paymentMethod === 'wallet' ? 'Prepaid Wallet' : 'Pay at Counter'}</span>
                      <div className="flex gap-2">
                        <span className="text-gray-400">Total Charged:</span>
                        <strong className="text-[#FF6B00]">${order.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Prefunded Wallet Top up */}
        {activeTab === 'wallet' && (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Wallet Info card */}
            <div className="md:col-span-5 bg-[#0f1115] border border-white/5 p-6 rounded-3xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl"></div>
              
              <div className="space-y-3">
                <span className="text-xs font-semibold text-gray-400">Current Prepaid Cash</span>
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  ${currentUser?.walletBalance !== undefined ? currentUser.walletBalance.toFixed(2) : '128.50'}
                </p>
                <p className="text-[10px] text-gray-500">Fund your prepaid wallet account directly using Credit Card or Mobile Money.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E]" />
                  <span>One-click visual checkout checkout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E]" />
                  <span>Extra 5% loyalty points on top-ups</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E]" />
                  <span>Instant refund of reservation cancellations</span>
                </div>
              </div>
            </div>

            {/* Top-up Form */}
            <div className="md:col-span-7 bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add Funds to Wallet</h3>
                <p className="text-[10px] text-gray-500">Select or input an amount below to replenish your prepaid balance.</p>
              </div>

              <form onSubmit={handleTopUpSubmit} className="space-y-5">
                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-3">
                  {['10', '25', '50', '100'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        topUpAmount === amt
                          ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]'
                          : 'border-white/5 bg-white/2 hover:border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Custom Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">$</span>
                    <input 
                      type="number" 
                      min="1"
                      max="1000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                {topUpSuccess && (
                  <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-3 rounded-xl text-center text-xs text-[#22C55E] flex items-center justify-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4.5 h-4.5" /> Funds added successfully!
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={topUpLoading}
                  className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover-lift shadow-lg shadow-[#FF6B00]/15"
                >
                  {topUpLoading ? 'Processing...' : `Confirm Payment of $${parseFloat(topUpAmount || 0).toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
