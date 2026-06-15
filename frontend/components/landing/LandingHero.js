'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import FoodCrossfadeGallery from '../FoodCrossfadeGallery';
import { staggerContainer, fadeUpItem, slideInLeft, slideInRight } from '../PageTransition';

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-8 md:pt-16 pb-12 md:pb-20">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,107,0,0.08),transparent)]" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center"
      >
        {/* ── Left: Text ─────────────────────────────── */}
        <div className="space-y-6">
          <motion.div variants={fadeUpItem}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-xs font-semibold text-[#FF6B00] tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> All-in-One Restaurant Platform
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUpItem}
            className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold text-white leading-[1.1] tracking-tight"
          >
            One Platform. <br />
            Three Experiences. <br />
            <span className="bg-gradient-to-r from-[#FF6B00] to-amber-500 bg-clip-text text-transparent">
              Endless Possibilities.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUpItem}
            className="text-gray-400 text-base sm:text-lg leading-relaxed"
          >
            Discover restaurants, reserve tables, order food, and run your entire restaurant business—all connected in real time.
          </motion.p>

          <motion.div
            variants={fadeUpItem}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <Link
              href="/login"
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/20 hover-lift transition-all"
            >
              Find Restaurants <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 hover-lift transition-all"
            >
              Register Restaurant
            </Link>
          </motion.div>
        </div>

        {/* ── Right: Gallery ──────────────────────────── */}
        <motion.div
          variants={slideInRight}
          className="relative"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-radial from-[#FF6B00]/20 via-transparent to-transparent blur-3xl pointer-events-none" />
            <FoodCrossfadeGallery />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/5 text-xs text-gray-400 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            Fresh · Local · Seasonal
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
