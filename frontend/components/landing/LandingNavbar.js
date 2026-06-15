'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import DineFlowLogo from '../DineFlowLogo';

export default function LandingNavbar({ isClient, theme, toggleTheme }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-20 max-w-7xl mx-auto flex items-center justify-between px-8 border-b border-white/5"
    >
      <Link href="/" className="text-white">
        <DineFlowLogo size="md" />
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
      </div>
      <div className="flex items-center gap-4">
        {isClient && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
        )}
        <Link href="/login" className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
          Login
        </Link>
        <Link href="/register" className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] transition-all hover-lift shadow-lg shadow-[#FF6B00]/10">
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}
