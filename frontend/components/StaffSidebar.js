"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDineFlow } from '../app/context';
import { 
  LayoutDashboard, TableProperties, ClipboardList, Settings, LogOut, UtensilsCrossed, CalendarClock
} from 'lucide-react';

export default function StaffSidebar() {
  const pathname = usePathname();
  const { logout, currentUser } = useDineFlow();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/staff' },
    { name: 'Tables Plan', icon: TableProperties, path: '/staff/tables' },
    { name: 'Live Orders', icon: ClipboardList, path: '/staff/orders' },
  ];

  return (
    <aside className="w-64 bg-[#0f1115] border-r border-[#1f2228] min-h-screen flex flex-col justify-between p-6 fixed left-0 top-0 z-30">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center shadow-lg shadow-[#FF6B00]/20">
            <UtensilsCrossed className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white tracking-tight">DineFlow</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest -mt-1">Staff Portal</p>
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

      {/* Account Info and Logout */}
      <div className="space-y-6 pt-6 border-t border-[#1f2228]">
        {currentUser && (
          <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <img 
                src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                alt="Avatar" 
                className="w-9 h-9 rounded-xl object-cover border border-white/10"
              />
              <div className="w-28">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] text-[#FF6B00] font-medium truncate">Server • Main Branch</p>
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
