"use client";
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedButton({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  loading = false,
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none relative overflow-hidden';

  const variants = {
    default: 'bg-primary text-white hover:opacity-90',
    outline: 'border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] rounded-lg',
    default: 'px-5 py-2.5 text-xs rounded-xl',
    lg: 'px-6 py-3 text-sm rounded-xl',
    icon: 'p-2 rounded-xl',
  };

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const id = Date.now() + Math.random();

    setRipples((prev) => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);

    onClick?.(e);
  }, [onClick]);

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: r.x - r.size / 2,
            top: r.y - r.size / 2,
            width: r.size,
            height: r.size,
          }}
        />
      ))}
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
}
