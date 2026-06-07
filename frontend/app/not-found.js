import Link from 'next/link';
import DineFlowLogo from '../components/DineFlowLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-6">
        <DineFlowLogo size="lg" />
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-white">404</h1>
          <h2 className="text-xl font-bold text-white">Page not found</h2>
          <p className="text-sm text-gray-500">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-6 py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-xl text-sm transition-colors">
            Go Home
          </Link>
          <Link href="/login" className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl text-sm transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
