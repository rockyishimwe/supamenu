'use client';

/**
 * EmptyState — shown when a list/view has no data.
 * Accepts consistent props across the app for a uniform empty UX.
 */
export default function EmptyState({
  title = 'No data found',
  message = '',
  icon: Icon,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-gray-500" />
        </div>
      )}
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      {message && (
        <p className="text-xs text-gray-500 max-w-xs mb-4">{message}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 border border-[#FF6B00]/20 text-[#FF6B00] text-[11px] font-semibold transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
