'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import DineFlowLogo from '../../../components/DineFlowLogo';
import { pageVariants } from '../../../components/PageTransition';
import BackgroundCarousel from '../../../components/BackgroundCarousel';

const DARK_OVERLAY =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1920&q=80';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Request failed');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <BackgroundCarousel
        images={[DARK_OVERLAY]}
        interval={10000}
        overlayColor="rgba(0,0,0,0.6)"
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-[#0f1115]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
          <div className="flex justify-center mb-6">
            <DineFlowLogo />
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-gray-400 mb-6">
                If an account with <strong className="text-white">{email}</strong> exists,
                we&apos;ve sent a password reset link.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[#FF6B00] hover:text-orange-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-gray-400 mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm mt-1.5">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF6B00] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[20px] py-3 transition-all duration-200"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.main>
  );
}
