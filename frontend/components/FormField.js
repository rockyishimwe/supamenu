"use client";

export default function FormField({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  children,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-gray-400">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        )}
        {children || (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all ${
              error ? 'border-red-500/50' : 'border-white/5'
            }`}
          />
        )}
      </div>
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}
