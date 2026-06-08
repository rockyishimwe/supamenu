"use client";
import { motion } from 'framer-motion';

// Shared animation variants for page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

// Stagger container — wrap around a list of items
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// Fade-up item for use inside staggerContainer
export const fadeUpItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Scale-in item variant
export const scaleInItem = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

// Slide-in from left
export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Slide-in from right
export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
