"use client";

const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`${shimmer} bg-white/5 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-panel border border-white/5 rounded-3xl p-5 ${shimmer} ${className}`}>
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonKPICard({ className = '' }) {
  return (
    <div className={`bg-panel border border-white/5 rounded-2xl p-5 ${shimmer} ${className}`}>
      <Skeleton className="h-8 w-8 rounded-xl mb-3" />
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-4 pb-2 border-b border-white/5">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" style={{ animationDelay: `${(r * cols + c) * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
