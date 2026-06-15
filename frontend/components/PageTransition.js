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

// ==================== NEW: Hover & Interaction Variants ====================

// Hover lift for cards
export const hoverLift = {
  whileHover: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' },
    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
  },
  whileTap: { scale: 0.98 },
};

// Subtle hover glow for buttons/accent elements
export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(255, 107, 0, 0.4), 0 0 40px rgba(255, 107, 0, 0.2)',
    transition: { duration: 0.2 },
  },
  whileTap: { scale: 0.97 },
};

// Scale on tap (for buttons)
export const tapScale = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.02 },
};

// Fade in on scroll into view
export const fadeInView = {
  initial: { opacity: 0, y: 20 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  viewport: { once: true, margin: '-100px' },
};

// Slide up on scroll
export const slideUpView = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  viewport: { once: true, margin: '-100px' },
};

// Scale in on scroll
export const scaleInView = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  viewport: { once: true, margin: '-100px' },
};

// Stagger children with custom delay
export const staggerItem = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay },
  },
});

// Pulse animation for loading/pending states
export const pulse = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Shimmer/skeleton loading
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
};

// Card hover with image zoom
export const cardHoverZoom = {
  initial: { scale: 1 },
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  whileTap: { scale: 0.98 },
};

// Nav link underline animation
export const navUnderline = {
  initial: { width: '0%', left: '50%' },
  whileHover: {
    width: '100%',
    left: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Input focus animation
export const inputFocus = {
  initial: { borderColor: 'rgba(255,255,255,0.1)', boxShadow: 'none' },
  whileFocus: {
    borderColor: '#FF6B00',
    boxShadow: '0 0 0 3px rgba(255, 107, 0, 0.15)',
    transition: { duration: 0.2 },
  },
};

// Modal/Dialog entrance
export const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// Backdrop fade
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
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
