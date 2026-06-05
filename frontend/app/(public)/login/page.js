"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDineFlow } from '../../context';
import { 
  UtensilsCrossed, ShieldCheck, RefreshCw, Sparkles, Heart, Mail, Lock, Eye, EyeOff, Check, Chrome, Apple, ChevronRight, HelpCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, activeRole, setActiveRole } = useDineFlow();
  
  const [email, setEmail] = useState('sarah@dineflow.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle active role selector adjustments
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
    setLoading(true);
    setErrorMsg('');
    
    const res = await login(email, password, activeRole);
    setLoading(false);
    
    if (res.success) {
      if (activeRole === 'customer') router.push('/customer');
      else if (activeRole === 'staff') router.push('/staff');
      else if (activeRole === 'owner') router.push('/owner');
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#07090e] text-[#f3f4f6]">
      {/* Left Pane (Design details) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-[#0f1115] to-[#07090e] border-r border-white/5 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-1/2 bg-[#FF6B00]/5 filter blur-3xl rounded-full"></div>
        
        {/* Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <UtensilsCrossed className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white">DineFlow</span>
        </div>

        {/* Middle content */}
        <div className="space-y-8 relative z-10 max-w-sm">
          <div className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold tracking-widest text-amber-500">
            Find. Reserve. Order. Enjoy.
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Discover Amazing <br />
            <span className="text-[#FF6B00]">Restaurants</span> <br />
            Near You.
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Explore top-rated cuisines, check visual table availability, pre-order meals, and enjoy a seamless modern dining experience.
          </p>

          {/* Highlights List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#FF6B00]">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Find Restaurants</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Explore local cuisines & reviews.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#FF6B00]">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Reserve Tables</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Book tables in advance in real-time.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#FF6B00]">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Order & Track</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Place order from mobile and track live status.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 relative z-10 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure & Reliable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <span>24/7 Live Sync</span>
          </div>
        </div>
      </div>

      {/* Right Pane (Auth Card) */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-md bg-[#0f1115] border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
          
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-bold text-white">Welcome Back!</h3>
            <p className="text-xs text-gray-500">Sign in to manage and experience DineFlow.</p>
          </div>

          {/* Role selector buttons (3 tabs) */}
          <div className="grid grid-cols-3 gap-2.5 mb-8">
            {['customer', 'owner', 'staff'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`py-3 rounded-2xl border text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
                  activeRole === role 
                    ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]' 
                    : 'border-white/5 bg-white/2 hover:border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
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
            </div>

            {/* Password */}
            <div className="space-y-1.5">
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 py-1">
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
            </div>

            {errorMsg && (
              <p className="text-red-500 text-[11px] font-medium bg-red-500/5 p-2 rounded-xl border border-red-500/10 text-center">{errorMsg}</p>
            )}

            {/* Submit */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 hover-lift shadow-lg shadow-[#FF6B00]/10"
            >
              {loading ? 'Logging in...' : `Login as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social login */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-white/5"></span>
            <span className="relative bg-[#0f1115] px-3 text-[10px] text-gray-500 uppercase font-semibold">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSubmit(new Event('submit'))}
              className="py-2.5 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold hover:bg-white/5 transition-all"
            >
              <Chrome className="w-4 h-4 text-red-500" /> Google
            </button>
            <button 
              onClick={() => handleSubmit(new Event('submit'))}
              className="py-2.5 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold hover:bg-white/5 transition-all"
            >
              <Apple className="w-4 h-4 text-white" /> Apple
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#FF6B00] font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
