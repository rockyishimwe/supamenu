"use client";
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9998] origin-left"
      style={{ 
        scaleX,
        background: 'linear-gradient(90deg, #FF6B00, #FF8C38, #FF6B00)',
        boxShadow: '0 0 12px rgba(255, 107, 0, 0.5), 0 0 4px rgba(255, 107, 0, 0.3)',
      }}
    />
  );
}
