"use client";
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
  as = 'span',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = Number(value);
    const step = Math.max(1, Math.floor(end / (duration * 60)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  const formatted = display.toFixed(decimals);

  if (as === 'span') {
    return (
      <span ref={ref}>
        {prefix}{formatted}{suffix}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {prefix}{formatted}{suffix}
    </motion.span>
  );
}
