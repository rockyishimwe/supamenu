"use client";
import Image from 'next/image';
import { useState } from 'react';
import { User } from 'lucide-react';

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-20 h-20 text-xl',
};

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
};

const sizePx = { sm: 32, md: 40, lg: 80 };

export default function Avatar({ src, name, size = 'sm', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && src.trim() && !imgError;

  if (showImage) {
    const px = sizePx[size];
    return (
      <Image
        src={src}
        alt={name || 'Avatar'}
        width={px}
        height={px}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: icon or initials
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 ${className}`}
    >
      {initials ? (
        <span className="font-bold">{initials}</span>
      ) : (
        <User className={iconSizeMap[size]} />
      )}
    </div>
  );
}
