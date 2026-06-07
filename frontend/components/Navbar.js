"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Wallet, Search, Menu, Sun, Moon } from 'lucide-react';
import { useDineFlow } from '../app/context';
import { useThemeStore } from '../lib/useTheme';
import DineFlowLogo from './DineFlowLogo';
import Avatar from './Avatar';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({ role = 'customer', onMenuToggle }) {
  const { currentUser, cart, logout } = useDineFlow();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const cartCount = cart?.reduce((s, i) => s + i.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 glass-panel-heavy border-b border-white/5 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 text-white">
            <DineFlowLogo />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 hidden sm:inline">
              {role}
            </span>
          </Link>
        </div>

        {role === 'customer' && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="search"
                placeholder="Search restaurants, cuisines..."
                className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-white/5"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {role === 'customer' && currentUser && (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
              <Wallet className="w-3.5 h-3.5" /> ${currentUser.walletBalance?.toFixed(2)}
            </span>
          )}
          {role === 'customer' && (
            <Link href="/customer/cart" className="relative p-2 rounded-xl hover:bg-white/5">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <NotificationDropdown />
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-white hidden sm:block transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
