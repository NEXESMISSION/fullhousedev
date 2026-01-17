import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Optimize static assets
  images: {
    unoptimized: false,
  },
  // Build optimization
  swcMinify: true,
  // Ensure static files are properly handled
  trailingSlash: false,
  // Optimize bundle size
  compress: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Type checking during build (set to true to skip for faster builds)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
