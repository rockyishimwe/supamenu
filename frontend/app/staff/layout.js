"use client";
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PageTransition from '../../components/PageTransition';
import MobileDrawer from '../../components/MobileDrawer';
import StaffBackground from '../../components/staff/StaffBackground';

export default function StaffLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <StaffBackground />
      <Navbar role="staff" onMenuToggle={() => setMobileMenuOpen((v) => !v)} />
      <MobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} role="staff" />
      <div className="flex flex-1 relative z-10">
        <Sidebar role="staff" />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
