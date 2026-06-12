"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import DineFlowLogo from '../../../components/DineFlowLogo';
import BackButton from '../../../components/BackButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8 text-body">
      <div className="w-full max-w-md bg-panel border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-1/2 bg-[#FF6B00]/5 filter blur-3xl rounded-full"></div>

        <BackButton href="/login" />

        <div className="flex items-center justify-center mb-8 relative z-10">
          <Link href="/" className="text-white">
            <DineFlowLogo size="md" />
          </Link>
        </div>

        {sent ? (
          <div className="text-center space-y-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Check Your Inbox</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                We have sent a password reset link to <strong className="text-white">{email}</strong>. Please follow the instructions in the email.
              </p>
            </div>
            <BackButton href="/login" label="Back to Sign In" />
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <p className="text-xs text-gray-500">Enter your registered email to receive recovery instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    Sending...
                  </span>
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
