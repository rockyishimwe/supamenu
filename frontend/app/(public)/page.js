"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Flame, Zap, Award, Sparkles, CheckCircle2, ChevronDown, MonitorCheck, ChefHat, Sun, Moon
} from 'lucide-react';
import DineFlowLogo from '../../components/DineFlowLogo';
import { useThemeStore } from '../../lib/useTheme';
import { staggerContainer, fadeUpItem, slideInLeft, slideInRight } from '../../components/PageTransition';
import BackgroundCarousel from '../../components/BackgroundCarousel';
import FoodCrossfadeGallery from '../../components/FoodCrossfadeGallery';

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('customer');
  const [activeFaq, setActiveFaq] = useState(null);
  const { theme, toggleTheme, isClient, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const stats = [
    { value: '2,500+', label: 'Restaurants', desc: 'Trust our platform' },
    { value: '150K+', label: 'Happy Customers', desc: 'Served daily' },
    { value: '250K+', label: 'Orders Processed', desc: 'Every day' },
    { value: '99.9%', label: 'Uptime SLA', desc: 'Always reliable' },
  ];

  const features = [
    { title: 'Smart Reservations', desc: 'Real-time table availability and instant reservations for a hassle-free experience.', color: 'from-[#FF6B00] to-amber-500' },
    { title: 'QR Ordering', desc: 'Scan, browse menus, and pay directly from smartphones for zero friction.', color: 'from-blue-500 to-indigo-500' },
    { title: 'Kitchen Displays', desc: 'Streamline kitchen operations with digital ticketing and automated queues.', color: 'from-[#22C55E] to-emerald-500' },
    { title: 'Analytics & Reports', desc: 'Make data-driven decisions with rich dashboards on sales and visits.', color: 'from-purple-500 to-pink-500' },
    { title: 'Staff Rosters', desc: 'Manage team schedules, roles, waiters, and performance tracking.', color: 'from-red-500 to-orange-500' },
  ];

  const faqs = [
    { q: "How does table tracking work for staff?", a: "Staff can view a real-time layout grid of the dining floor. Tables change color based on their status: green for available, red for occupied, yellow for waiting on orders, and gray when being cleaned." },
    { q: "Can we run this offline in our restaurant?", a: "Yes! DineFlow has a robust local-fallback capability that caches data in the browser or locally, allowing billing and kitchen orders to sync immediately once connection is restored." },
    { q: "What payment methods are supported?", a: "We support major credit cards, Mobile Money options (e.g. M-Pesa, Orange Money), and a built-in pre-funded customer Wallet for one-tap payments." },
    { q: "Is there a setup wizard for new owners?", a: "Absolutely. When you register as an owner, you will be guided through a 3-step wizard to upload your menu, define your initial table count, and establish your hours." },
  ];

  return (
    <div className="min-h-screen bg-surface text-body">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="h-20 max-w-7xl mx-auto flex items-center justify-between px-8 border-b border-white/5"
      >
        <Link href="/" className="text-white">
          <DineFlowLogo size="md" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          {isClient && (
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
          )}
          <Link href="/login" className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
            Login
          </Link>
          <Link href="/register" className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] transition-all hover-lift shadow-lg shadow-[#FF6B00]/10">
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section with Background Carousel */}
      <section className="relative overflow-hidden">
        {/* Rotating background photos */}
        <BackgroundCarousel
          interval={7000}
          overlayBg="linear-gradient(135deg, rgba(7,9,14,0.85) 0%, rgba(15,17,21,0.65) 50%, rgba(7,9,14,0.85) 100%)"
          fadeDuration={1}
        />
        {/* Animated gradient on top of photos */}
        <div className="absolute inset-0 bg-animated-gradient opacity-70 mix-blend-overlay" />
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        {/* Floating orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#FF6B00]/8 blur-3xl orb-float-1" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-blue-500/6 blur-3xl orb-float-2" />

        <div className="relative max-w-7xl mx-auto px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            className="lg:col-span-6 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-xs font-semibold text-[#FF6B00] tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> All-in-One Restaurant Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              One Platform. <br />
              Three Experiences. <br />
              <span className="bg-gradient-to-r from-[#FF6B00] to-amber-500 bg-clip-text text-transparent">Endless Possibilities.</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl">
              Discover restaurants, reserve tables, order food, and run your entire restaurant business—all connected in real time. Designed for modern gastronomy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/20 hover-lift transition-all">
                Find Restaurants <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/register" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 hover-lift transition-all">
                Register Restaurant
              </Link>
            </div>
          </motion.div>

          {/* Food Image */}
          <motion.div
            variants={slideInRight}
            initial="initial"
            animate="animate"
            className="lg:col-span-6 flex justify-center relative"
          >
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-radial from-[#FF6B00]/15 via-transparent to-transparent blur-3xl rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#FF6B00]/8 blur-3xl animate-pulse-slow" />
            
            {/* Crossfade gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-lg"
            >
              <FoodCrossfadeGallery />
            </motion.div>

            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-panel/80 backdrop-blur-md border border-white/5 text-[10px] text-gray-400 font-medium flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Fresh · Local · Seasonal
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar — scroll reveal */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="bg-panel border-y border-white/5 py-12"
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeUpItem} className="text-center space-y-1">
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-300">{stat.label}</p>
              <p className="text-xs text-gray-500">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Experience Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-8 py-24 space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Choose Your Experience</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">One integrated system catering to every role inside the culinary environment.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex justify-center gap-4 max-w-lg mx-auto">
          {['customer', 'owner', 'staff'].map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role)}
              className={`flex-1 py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                activeTab === role
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/15'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              I'm a {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content Cards */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto p-8 rounded-3xl bg-panel border border-white/5 grid md:grid-cols-2 gap-8 items-center"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white capitalize">
              {activeTab === 'customer' && 'Discover & Book Instantly'}
              {activeTab === 'owner' && 'Optimize Your Operations'}
              {activeTab === 'staff' && 'Perform with Perfection'}
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              {activeTab === 'customer' && 'Explore trending nearby restaurants, customize orders ahead of time, check live table layouts, and book tables with one click.'}
              {activeTab === 'owner' && 'Configure interactive floor plan layout, add/edit food items in menus, assign servers, set local tax preferences, and study growth reports.'}
              {activeTab === 'staff' && 'Track seating duration in real-time. Speed up order status updates (New -> Preparing -> Ready -> Served -> Paid) to enhance visitor experience.'}
            </p>
            <ul className="space-y-3">
              {(activeTab === 'customer' ? [
                'Find top-rated cuisines',
                'Reserve visual tables instantly',
                'Earn loyalty membership rewards'
              ] : activeTab === 'owner' ? [
                'Manage menus and categories',
                'Monitor team schedules and waiters',
                'Study sales and analytics trends'
              ] : [
                'Update table service statuses',
                'Direct notifications from kitchen',
                'Track tip splits and checklists'
              ]).map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" /> {benefit}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#e05e00] px-6 py-3 rounded-xl transition-all shadow-md shadow-[#FF6B00]/10"
            >
              Enter Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual card sidebar */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Preview Dashboard</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] font-semibold">Active</span>
            </div>
            
            {activeTab === 'customer' && (
              <div className="space-y-3">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="h-10 bg-white/5 rounded-xl flex items-center justify-between px-3 text-[11px]">
                  <span>The Garden Bistro</span>
                  <span className="text-green-500">Confirmed • Table 2</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="h-10 bg-white/5 rounded-xl flex items-center justify-between px-3 text-[11px]">
                  <span>Sakura Sushi</span>
                  <span className="text-gray-500">12:00 PM • Fri</span>
                </motion.div>
              </div>
            )}

            {activeTab === 'owner' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="font-bold text-white">$12,650</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    className="h-full bg-[#FF6B00] rounded-full"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>+18% from last week</span>
                  <span>75% Capacity</span>
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="space-y-3">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between px-3 text-[10px] text-red-400">
                  <span>Table 2 - Needs Service</span>
                  <span>35m duration</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="h-9 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between px-3 text-[10px] text-yellow-400">
                  <span>Table 3 - Waiting for Food</span>
                  <span>22m duration</span>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.section>

      {/* Feature Grid */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-8 py-24 space-y-16"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Everything You Need, All in One Place</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Powerful components built together for a modern, fluid dining ecosystem.</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUpItem}
              className="p-6 rounded-3xl bg-panel border border-white/5 hover:border-white/10 hover-lift transition-all space-y-4 card-shine"
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center font-bold text-white text-sm`}>
                0{i + 1}
              </div>
              <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* FAQs */}
      <motion.section
        id="faq"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-8 py-24 space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Got questions? We have answers to help you get started with DineFlow.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={fadeUpItem}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-panel border border-white/5 rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="p-5 flex items-center justify-between text-xs font-semibold text-white">
                <span>{faq.q}</span>
                <motion.span
                  animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.span>
              </div>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 text-[11px] text-gray-400 leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-panel border-t border-white/5 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="text-white">
            <DineFlowLogo size="sm" />
          </Link>
          <p className="text-xs text-gray-500">© 2026 DineFlow Restaurant Ecosystem. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-400 font-medium">
            <Link href="/login" className="hover:text-white">Sign In</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
