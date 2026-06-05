"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ShoppingCart, Wallet, Search, Menu } from 'lucide-react';
import { useDineFlow } from '../app/context';

function DineFlowLogo() {
  return (
    <svg width="130" height="36" viewBox="0 0 340 100" xmlns="http://www.w3.org/2000/svg" aria-label="DineFlow">
      {/* Arc mark */}
      <path
        d="M 55 15 A 35 35 0 1 1 55 85"
        fill="none" stroke="#FF6B00" strokeWidth="10" strokeLinecap="round"
      />
      {/* Flow lines */}
      <path
        d="M 52 30 C 68 30 82 25 94 30"
        fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round"
      />
      <path
        d="M 52 50 C 72 50 86 44 102 50"
        fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.65"
      />
      <path
        d="M 52 70 C 70 70 84 65 94 70"
        fill="none" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" opacity="0.35"
      />
      {/* Accent dot */}
      <circle cx="102" cy="50" r="4" fill="#FF6B00" />
      {/* Wordmark */}
      <text
        x="118" y="58"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="32"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        DineFlow
      </text>
    </svg>
  );
}

export default function Navbar({ role = 'customer', onMenuToggle }) {
  const { currentUser, cart, logout } = useDineFlow();
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
          <Link href="/" className="flex items-center gap-2">
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
          <button type="button" className="relative p-2 rounded-xl hover:bg-white/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
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