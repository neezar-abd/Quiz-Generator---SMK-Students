import type { NextConfig } from "next";

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
    formats: ['image/webp', 'image/avif'],
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

export default nextConfig;
