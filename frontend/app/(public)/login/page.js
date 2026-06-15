"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDineFlow } from '../../context';
import { validateForm } from '../../../lib/validation';
import { useToast } from '../../../lib/useToast';
import {
  ShieldCheck, RefreshCw, Sparkles, Heart, Mail, Lock, Eye, EyeOff, Check, ChevronRight, HelpCircle
} from 'lucide-react';
import DineFlowLogo from '../../../components/DineFlowLogo';
import { staggerContainer, fadeUpItem, slideInLeft } from '../../../components/PageTransition';
import BackgroundCarousel from '../../../components/BackgroundCarousel';

export default function LoginPage() {
  const router = useRouter();
  const { login, activeRole, setActiveRole } = useDineFlow();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('sarah@dineflow.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'customer') {
      setEmail('sarah@dineflow.com');
    } else if (role === 'staff') {
      setEmail('alex@dineflow.com');
    } else if (role === 'owner') {
      setEmail('owner@dineflow.com');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg('');

    const { valid, errors } = validateForm(
      { email, password },
      { email: ['required', 'email'], password: ['required'] }
    );
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    
    const res = await login(email, password, activeRole);
    setLoading(false);
    
    if (res.success) {
      toast.success(`Logged in as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`);
      if (activeRole === 'customer') router.push('/customer');
      else if (activeRole === 'staff') router.push('/staff');
      else if (activeRole === 'owner') router.push('/owner');
    } else {
      // Map backend validation errors to individual fields
      if (res.errors && Array.isArray(res.errors)) {
        const fieldMap = {};
        res.errors.forEach((e) => {
          if (e.field) fieldMap[e.field] = e.message;
        });
        if (Object.keys(fieldMap).length > 0) {
          setFieldErrors(fieldMap);
        } else {
          setErrorMsg(res.message || 'Login failed. Please check credentials.');
        }
      } else {
        setErrorMsg(res.message || 'Login failed. Please check credentials.');
      }
      if (!res.errors || !Array.isArray(res.errors) || !res.errors.some((e) => e.field)) {
        toast.error(res.message || 'Login failed. Please check credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-surface text-body">
      {/* Left Pane — Background images + overlay */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Rotating photo background */}
        <BackgroundCarousel
          interval={7000}
          overlayBg="linear-gradient(135deg, rgba(7,9,14,0.92) 0%, rgba(15,17,21,0.7) 100%)"
          fadeDuration={1}
        />
        {/* Glow accent */}
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-1/2 bg-[#FF6B00]/5 filter blur-3xl rounded-full" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 text-white"
        >
          <Link href="/">
            <DineFlowLogo size="md" />
          </Link>
        </motion.div>

        {/* Middle content */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8 relative z-10 max-w-sm"
        >
          <motion.div variants={fadeUpItem} className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold tracking-widest text-amber-500">
            Find. Reserve. Order. Enjoy.
          </motion.div>
          <motion.h2 variants={fadeUpItem} className="text-4xl font-extrabold text-white leading-tight">
            Discover Amazing <br />
            <span className="text-[#FF6B00]">Restaurants</span> <br />
            Near You.
          </motion.h2>
          <motion.p variants={fadeUpItem} className="text-xs text-gray-400 leading-relaxed">
            Explore top-rated cuisines, check visual table availability, pre-order meals, and enjoy a seamless modern dining experience.
          </motion.p>

          {/* Highlights List */}
          <motion.div variants={fadeUpItem} className="space-y-4 pt-4">
            {[
              { icon: 'search', title: 'Find Restaurants', desc: 'Explore local cuisines & reviews.' },
              { icon: 'reserve', title: 'Reserve Tables', desc: 'Book tables in advance in real-time.' },
              { icon: 'order', title: 'Order & Track', desc: 'Place order from mobile and track live status.' },
            ].map((item, i) => (
              <motion.div
                key={item.icon}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.35 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#FF6B00]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center gap-6 relative z-10 text-[10px] text-gray-500"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure & Reliable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <span>24/7 Live Sync</span>
          </div>
        </motion.div>
      </div>

      {/* Right Pane (Auth Card) */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#FF6B00]/3 blur-3xl rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-md bg-panel border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="space-y-2 mb-8"
          >
            <h3 className="text-2xl font-bold text-white">Welcome Back!</h3>
            <p className="text-xs text-gray-500">Sign in to manage and experience DineFlow.</p>
          </motion.div>

          {/* Role selector buttons (3 tabs) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="grid grid-cols-3 gap-2.5 mb-8"
          >
            {['customer', 'owner', 'staff'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`py-3 rounded-2xl border text-[10px] uppercase font-bold tracking-wider transition-all duration-200 hover-lift ${
                  activeRole === role 
                    ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]' 
                    : 'border-white/5 bg-white/2 hover:border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="space-y-1.5"
            >
              <label className="text-[11px] font-semibold text-gray-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                />
              </div>
              {fieldErrors.email && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.email}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="space-y-1.5"
            >
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-gray-400">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-medium text-[#FF6B00] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.password}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="flex items-center gap-2 py-1"
            >
              <input 
                type="checkbox" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 rounded-lg accent-[#FF6B00] bg-white/5 border-white/10 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-400 select-none cursor-pointer">
                Remember me
              </label>
            </motion.div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[11px] font-medium bg-red-500/5 p-2 rounded-xl border border-red-500/10 text-center"
              >
                {errorMsg}
              </motion.p>
            )}

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 hover-lift shadow-lg shadow-[#FF6B00]/10 transition-all"
              >
                {loading ? 'Logging in...' : `Login as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-8 text-center text-xs text-gray-500"
          >
            Don't have an account?{' '}
            <Link href="/register" className="text-[#FF6B00] font-semibold hover:underline">
              Sign up
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
