import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Optimize static assets
  images: {
    unoptimized: false,
  },
  // Ensure static files are properly handled
  trailingSlash: false,
  // Optimize bundle size
  compress: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
