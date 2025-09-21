import type { NextConfig } from "next";
// Sentry: wrap config for source maps and instrumentation
// It's safe if DSN/envs are missing; SDK won't send without DSN.
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Performance optimizations (disabled due to build instability on Windows)
  // experimental: {
  //   optimizePackageImports: ['react', 'react-dom'],
  // },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Prefer AVIF first for smaller payloads on modern browsers
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Static optimization (standalone disabled due to Windows nft trace issues)
  // output: 'standalone',
  
  // ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript during build
  typescript: {
    ignoreBuildErrors: false,
  },
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/icons/{{member}}',
      skipDefaultConversion: true,
    },
  },
};

export default withSentryConfig(nextConfig, {
  // Client-side source maps upload (optional; no-op without auth/env)
  silent: true,
}, {
  // Disable automatic instrumentation file generation in CI unless configured
  hideSourceMaps: true,
});
