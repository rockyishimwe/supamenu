"use client";
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ href, label = 'Back' }) {
  const router = useRouter();
  const handleBack = () => {
    if (href) router.push(href);
    else router.back();
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
