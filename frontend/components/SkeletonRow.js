export function SkeletonRow({ rows = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-white/5 rounded-[20px] w-full" />
      ))}
    </div>
  );
}