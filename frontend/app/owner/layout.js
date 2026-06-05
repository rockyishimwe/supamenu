"use client";
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PageTransition from '../../components/PageTransition';

export default function OwnerLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar role="owner" />
      <div className="flex flex-1">
        <Sidebar role="owner" />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
