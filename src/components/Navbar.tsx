'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const isActive = (path: string) => pathname === path;

  // Simulate progress on route change
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 300);
    const timer3 = setTimeout(() => setProgress(100), 500);
    const timer4 = setTimeout(() => setIsLoading(false), 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname]);

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <div 
          className={`h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            width: `${progress}%`,
            transition: 'width 0.3s ease-out, opacity 0.3s ease-out'
          }}
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-black/5 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="w-20 h-20 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Image 
                src="/logo.svg" 
                alt="AI Quiz Logo" 
                width={80} 
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/upload', label: 'Upload' },
              { href: '/dashboard', label: 'Dashboard' }
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg relative ${
                  isActive(href)
                    ? 'text-black'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                {label}
                {isActive(href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-black rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}