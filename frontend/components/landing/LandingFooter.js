'use client';
import Link from 'next/link';
import DineFlowLogo from '../DineFlowLogo';

export default function LandingFooter() {
  return (
    <footer className="bg-panel border-t border-white/5 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="text-white">
          <DineFlowLogo size="sm" />
        </Link>
        <p className="text-xs text-gray-500">© 2026 DineFlow Restaurant Ecosystem. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Features</a>
          <a href="#faq" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">FAQ</a>
          <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
          <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
