"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Compass, Calendar, ShoppingBag, User, UtensilsCrossed,
  LayoutGrid, ClipboardList, BarChart3, Users, Settings, ChevronLeft,
  Sun, Moon,
} from 'lucide-react';
import { useDineFlow } from '../app/context';
import { useThemeStore } from '../lib/useTheme';

const NAV = {
  customer: [
    { href: '/customer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customer/explore', label: 'Explore', icon: Compass },
    { href: '/customer/reservations', label: 'Reservations', icon: Calendar },
    { href: '/customer/cart', label: 'Cart', icon: ShoppingBag },
    { href: '/customer/order-tracking', label: 'Track Order', icon: ClipboardList },
    { href: '/customer/profile', label: 'Profile', icon: User },
  ],
  staff: [
    { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff/tables', label: 'Tables', icon: LayoutGrid },
    { href: '/staff/orders', label: 'Orders', icon: ClipboardList },
    { href: '/staff/profile', label: 'Profile', icon: User },
  ],
  owner: [
    { href: '/owner', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/owner/tables', label: 'Tables', icon: LayoutGrid },
    { href: '/owner/staff', label: 'Staff', icon: Users },
    { href: '/owner/finance', label: 'Billing', icon: BarChart3 },
    { href: '/owner/profile', label: 'Profile', icon: User },
  ],
};

export default function Sidebar({ role = 'customer' }) {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useDineFlow();
  const { theme, toggleTheme } = useThemeStore();
  const links = NAV[role] || NAV.customer;

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col shrink-0 h-[calc(100vh-57px)] sticky top-[57px] bg-panel border-r border-white/5 overflow-hidden"
    >
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <motion.div
              key={href}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-primary/15 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      <div className="m-3 flex items-center gap-2">
        <motion.button
          type="button"
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="flex-1 p-2 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="flex-1 p-2 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>
    </motion.aside>
  );
}
