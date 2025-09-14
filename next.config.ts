import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Bundle analyzer for production builds
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },

  // Image optimization
  images: {
    remotePatterns: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression
  compress: true,

  // Static optimization
  output: 'standalone',
  
  // ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript during build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
