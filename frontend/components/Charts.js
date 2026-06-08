"use client";
import dynamic from 'next/dynamic';

// Lazy-load recharts components (heavy library, only used on owner pages)
export const SalesChart = dynamic(
  () => import('./SalesChartInner'),
  { ssr: false, loading: () => <div className="h-80 bg-panel rounded-3xl animate-pulse" /> }
);

export const FinanceCharts = dynamic(
  () => import('./FinanceChartsInner'),
  { ssr: false, loading: () => <div className="h-80 bg-panel rounded-3xl animate-pulse" /> }
);
