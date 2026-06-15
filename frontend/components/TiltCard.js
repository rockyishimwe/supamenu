"use client";
import { useRef, useCallback } from 'react';

export default function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    ref.current.style.transform =
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    ref.current.style.transition = 'transform 0.08s ease-out';

    // Glare effect
    if (glareRef.current) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glareRef.current.style.background =
        `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;
      glareRef.current.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform =
        'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      ref.current.style.transition = 'transform 0.5s ease-out';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
      glareRef.current.style.transition = 'opacity 0.5s ease-out';
    }
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
}
