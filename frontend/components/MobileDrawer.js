"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, ClipboardList, Users, ShoppingBag, Calendar, Settings, Store, CreditCard, ChefHat } from 'lucide-react';
import DineFlowLogo from './DineFlowLogo';

const roleLinks = {
  customer: [
    { href: '/customer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customer/explore', label: 'Explore', icon: Store },
    { href: '/customer/reservations', label: 'Reservations', icon: Calendar },
    { href: '/customer/order-tracking', label: 'Order Tracking', icon: ClipboardList },
    { href: '/customer/profile', label: 'Profile', icon: Settings },
  ],
  staff: [
    { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff/orders', label: 'Orders', icon: ClipboardList },
    { href: '/staff/tables', label: 'Tables', icon: LayoutDashboard },
    { href: '/staff/profile', label: 'Profile', icon: Settings },
  ],
  owner: [
    { href: '/owner', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner/staff', label: 'Staff', icon: Users },
    { href: '/owner/menu', label: 'Menu', icon: ShoppingBag },
    { href: '/owner/tables', label: 'Tables', icon: LayoutDashboard },
    { href: '/owner/finance', label: 'Finance', icon: CreditCard },
    { href: '/owner/profile', label: 'Profile', icon: Settings },
  ],
};

export default function MobileDrawer({ open, onClose, role = 'customer' }) {
  const pathname = usePathname();
  const links = roleLinks[role] || roleLinks.customer;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-panel border-r border-white/10 lg:hidden p-6 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <Link href="/" onClick={onClose}>
                <DineFlowLogo size="sm" />
              </Link>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary/15 text-primary border border-primary/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
