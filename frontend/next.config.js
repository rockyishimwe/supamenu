/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')()
  : (config) => config;

module.exports = withBundleAnalyzer(nextConfig);

// Performance budgets (manual):
// - Initial JS < 200KB (gzip'd)
// - Lighthouse Performance > 90
// - First Contentful Paint < 1.5s
// - Largest Contentful Paint < 2.5s
