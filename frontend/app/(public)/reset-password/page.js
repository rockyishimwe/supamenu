"use client";
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import DineFlowLogo from '../../../components/DineFlowLogo';
import BackButton from '../../../components/BackButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains a lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains an uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains a digit', met: /[0-9]/.test(newPassword) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const unmet = passwordRequirements.filter((r) => !r.met);
    if (unmet.length > 0) {
      setError('Password does not meet all requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Reset failed. The link may have expired.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-6 relative z-10">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Invalid Reset Link</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            This link is missing a reset token. Please check your email for the full link or{' '}
            <Link href="/forgot-password" className="text-[#FF6B00] hover:underline">
              request a new one
            </Link>.
          </p>
        </div>
        <BackButton href="/login" label="Back to Sign In" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-6 relative z-10">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Password Reset Successful</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold text-xs rounded-xl hover-lift shadow-lg shadow-[#FF6B00]/10 transition-all"
        >
          Sign In <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-bold text-white">Set New Password</h3>
        <p className="text-xs text-gray-500">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-gray-400">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-gray-400">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:bg-white/10 transition-all"
          />
        </div>

        <ul className="space-y-1.5">
          {passwordRequirements.map((req, i) => (
            <li key={i} className="flex items-center gap-2 text-[10px]">
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  req.met ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              />
              <span className={req.met ? 'text-emerald-400' : 'text-gray-500'}>{req.label}</span>
            </li>
          ))}
        </ul>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] disabled:bg-[#FF6B00]/50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 hover-lift shadow-lg shadow-[#FF6B00]/10 transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Resetting...
            </span>
          ) : (
            <>
              Reset Password <ArrowRight className="w-4.5 h-4.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8 text-body">
      <div className="w-full max-w-md bg-panel border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-1/2 bg-[#FF6B00]/5 filter blur-3xl rounded-full" />

        <BackButton href="/login" />

        <div className="flex items-center justify-center mb-8 relative z-10">
          <Link href="/" className="text-white">
            <DineFlowLogo size="md" />
          </Link>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-12">
            <span className="w-6 h-6 border-2 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin" />
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
