"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDineFlow } from '../../context';
import { useStore } from '../../../lib/store';
import { validateForm } from '../../../lib/validation';
import { useToast } from '../../../lib/useToast';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ChevronRight,
  ChevronLeft,
  Building,
  MapPin,
  Store,
  Check,
  Utensils,
  Shield,
} from 'lucide-react';
import DineFlowLogo from '../../../components/DineFlowLogo';
import BackButton from '../../../components/BackButton';
import confetti from 'canvas-confetti';
import BackgroundCarousel from '../../../components/BackgroundCarousel';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useDineFlow();
  const { toast } = useToast();

  const [role, setRole] = useState('customer');
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [cuisines, setCuisines] = useState('Italian, Continental');
  const [openingHours, setOpeningHours] = useState('10:00 AM - 11:00 PM');
  const [restaurantCode, setRestaurantCode] = useState('');

  const isMultiStep = role === 'owner' || role === 'staff';

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setStep(1);
    setErrorMsg('');
  };

  const handleNext = () => {
    setErrorMsg('');
    setFieldErrors({});
    if (step === 1) {
      const { valid, errors } = validateForm(
        { name, email, password },
        { name: ['required'], email: ['required', 'email'], password: ['required', ['minLength', 6]] }
      );
      if (!valid) {
        setFieldErrors(errors);
        return;
      }
      if (role === 'customer') {
        handleRegister();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (role === 'staff') {
        if (!restaurantCode.trim()) {
          setFieldErrors({ restaurantCode: 'Invite code is required' });
          return;
        }
      } else {
        const { valid, errors } = validateForm(
          { restaurantName, restaurantAddress },
          { restaurantName: ['required'], restaurantAddress: ['required'] }
        );
        if (!valid) {
          setFieldErrors(errors);
          return;
        }
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(step - 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg('');
    setFieldErrors({});
    const res = await register(name, email, password, role, { restaurantCode: restaurantCode.trim() });
    setLoading(false);

    if (res.success) {
      toast.success(`Welcome${restaurantName ? ` to ${restaurantName}` : ''}! Account created successfully.`);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#ffffff', '#22C55E'],
      });

      if (role === 'owner') {
        const storedRes = JSON.parse(localStorage.getItem('dineflow_restaurants') || '[]');
        const newRes = {
          _id: `res-${Date.now()}`,
          name: restaurantName,
          description: `Welcome to ${restaurantName}! Highly recommended fine dining experience.`,
          cuisines: cuisines.split(',').map((c) => c.trim()),
          address: restaurantAddress,
          openingHours: openingHours,
          rating: 4.5,
          reviewsCount: 1,
          coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
          logo: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=150',
          settings: { taxes: 8.5, serviceCharges: 10.0 },
          categories: ['Appetizers', 'Mains', 'Desserts'],
        };
        localStorage.setItem('dineflow_restaurants', JSON.stringify([newRes, ...storedRes]));
        const currentRestaurants = useStore.getState().restaurants;
        useStore.setState({ restaurants: [newRes, ...currentRestaurants] });
        router.push('/owner');
      } else if (role === 'staff') {
        router.push('/staff');
      } else {
        router.push('/customer');
      }
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-surface text-body">
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Rotating background photos */}
        <BackgroundCarousel
          interval={7000}
          overlayBg="linear-gradient(135deg, rgba(7,9,14,0.92) 0%, rgba(15,17,21,0.7) 100%)"
          fadeDuration={1}
        />
        {/* Glow accent */}
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-1/2 bg-[#FF6B00]/5 filter blur-3xl rounded-full"></div>

        <Link href="/" className="relative z-10 text-white">
          <DineFlowLogo size="md" />
        </Link>

        <div className="space-y-6 relative z-10 max-w-sm">
          <div className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold tracking-widest text-[#FF6B00]">
            Get Started Today
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Join the <br />
            Next-Gen <br />
            Ecosystem.
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Create an account to browse restaurants, join a venue as staff, or register your restaurant on DineFlow.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 text-[10px] text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure data storage & ISO compliance</span>
        </div>
      </div>

      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-panel border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
          <BackButton href="/login" />

          <div className="space-y-2 mb-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Create Account</h3>
              {isMultiStep && (
                <span className="text-[10px] bg-white/5 border border-white/5 text-gray-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Step {step} of 3
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">Get access to reservations, checkout, and platform tools.</p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Registering as a...</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => selectRole('customer')}
                    className={`py-3 rounded-2xl border text-[10px] sm:text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      role === 'customer'
                        ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]'
                        : 'border-white/5 bg-white/2 text-gray-400 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4 shrink-0" /> Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => selectRole('staff')}
                    className={`py-3 rounded-2xl border text-[10px] sm:text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      role === 'staff'
                        ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]'
                        : 'border-white/5 bg-white/2 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0" /> Staff Member
                  </button>
                  <button
                    type="button"
                    onClick={() => selectRole('owner')}
                    className={`py-3 rounded-2xl border text-[10px] sm:text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      role === 'owner'
                        ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]'
                        : 'border-white/5 bg-white/2 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Building className="w-4 h-4 shrink-0" /> Owner
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                  />
                </div>
                {fieldErrors.name && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                  />
                </div>
                {fieldErrors.email && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                  />
                </div>
                {fieldErrors.password && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.password}</p>}
              </div>
            </div>
          )}

          {step === 2 && role === 'owner' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Restaurant Name</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. The Garden Bistro"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                  />
                </div>
                {fieldErrors.restaurantName && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.restaurantName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Restaurant Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={restaurantAddress}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                    placeholder="e.g. 123 Green Street, New York"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                  />
                </div>
                {fieldErrors.restaurantAddress && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.restaurantAddress}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Cuisines (comma separated)</label>
                <div className="relative">
                  <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={cuisines}
                    onChange={(e) => setCuisines(e.target.value)}
                    placeholder="e.g. Italian, Continental, Pizza"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && role === 'staff' && (
            <div className="space-y-6">
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter the invite code provided by your restaurant manager to join their team on DineFlow.
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400">Restaurant Code</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={restaurantCode}
                    onChange={(e) => setRestaurantCode(e.target.value)}
                    placeholder="Enter your restaurant's invite code"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
                  />
                </div>
                {fieldErrors.restaurantCode && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.restaurantCode}</p>}
              </div>
            </div>
          )}

          {step === 3 && role === 'owner' && (
            <div className="space-y-6">
              <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/15 p-6 rounded-2xl space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00] mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-center font-bold text-sm text-white">Review Setup</h4>

                <div className="space-y-2.5 text-[11px] border-t border-white/5 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Owner</span>
                    <span className="text-white font-medium">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Restaurant</span>
                    <span className="text-white font-medium">{restaurantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cuisines</span>
                    <span className="text-white font-medium truncate max-w-[200px]">{cuisines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Layout Preset</span>
                    <span className="text-emerald-500 font-medium">15 Tables (Default Layout)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && role === 'staff' && (
            <div className="space-y-6">
              <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/15 p-6 rounded-2xl space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00] mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-center font-bold text-sm text-white">Review Staff Setup</h4>

                <div className="space-y-2.5 text-[11px] border-t border-white/5 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Staff Member</span>
                    <span className="text-white font-medium">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-white font-medium truncate max-w-[180px]">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Restaurant Code</span>
                    <span className="text-[#FF6B00] font-medium font-mono">{restaurantCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Portal Access</span>
                    <span className="text-emerald-500 font-medium">Staff Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-red-500 text-[11px] font-medium bg-red-500/5 p-2 rounded-xl border border-red-500/10 text-center mt-4">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 text-xs font-semibold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            <button
              type="button"
              onClick={step === 3 || role === 'customer' ? handleRegister : handleNext}
              disabled={loading}
              className="flex-1 py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 hover-lift shadow-lg shadow-[#FF6B00]/10"
            >
              {loading
                ? 'Creating...'
                : step === 3 || role === 'customer'
                  ? 'Create Ecosystem Account'
                  : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF6B00] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
