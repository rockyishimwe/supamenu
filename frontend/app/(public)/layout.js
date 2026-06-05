"use client";
import PageTransition from '../../components/PageTransition';

export default function PublicLayout({ children }) {
  return (
    <PageTransition className="min-h-screen">
      {children}
    </PageTransition>
  );
}
