"use client";
import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-sm text-gray-500">
            {process.env.NODE_ENV === 'development' ? error?.message : 'An unexpected error occurred.'}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-xl text-sm transition-colors">
            Try Again
          </button>
          <Link href="/" className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl text-sm transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
