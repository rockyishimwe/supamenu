"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDineFlow } from '../app/context';
import { 
  Home, Search, Utensils, Calendar, ShoppingBag, Heart, 
  MessageSquare, Star, Gift, Wallet, User, Settings, HelpCircle, Award, LogOut
} from 'lucide-react';

export default function CustomerSidebar() {
  const pathname = usePathname();
  const { logout, currentUser } = useDineFlow();

  const menuItems = [
    { name: 'Home', icon: Home, path: '/customer' },
    { name: 'Explore', icon: Search, path: '/customer/explore' },
    { name: 'Reservations', icon: Calendar, path: '/customer/reservations' },
    { name: 'Profile & Orders', icon: User, path: '/customer/profile' },
  ];

  return (
    <aside className="w-64 bg-[#0f1115] border-r border-[#1f2228] min-h-screen flex flex-col justify-between p-6 fixed left-0 top-0 z-30">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center shadow-lg shadow-[#FF6B00]/20">
            <Utensils className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white tracking-tight">DineFlow</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest -mt-1">Customer App</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/10 font-semibold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Account */}
      <div className="space-y-6 pt-6 border-t border-[#1f2228]">
        {/* Premium Upgrade Banner */}
        <div className="bg-gradient-to-br from-[#1b1c20] to-[#141519] border border-[#2d3139] p-4 rounded-3xl relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B00]/5 rounded-full filter blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-300"></div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#FF6B00] flex items-center justify-center mb-3">
            <Award className="text-white w-4 h-4" />
          </div>
          <h4 className="font-semibold text-xs text-white">Upgrade to Premium</h4>
          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Unlock exclusive priority reservations, free deliveries, and double loyalty rewards.</p>
          <button className="w-full mt-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-[11px] font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-md hover-lift">
            Upgrade Now
          </button>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <img 
                src={currentUser.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"} 
                alt="Avatar" 
                className="w-9 h-9 rounded-xl object-cover border border-white/10"
              />
              <div className="w-28">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] text-[#FF6B00] font-medium truncate">{currentUser.customerDetails?.loyaltyTier || 'Gold Member'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white/5 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
