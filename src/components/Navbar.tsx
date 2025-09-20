'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AuthButton from './AuthButton';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Simulate progress on route change
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    const timer1 = setTimeout(() => setProgress(30), 80);
    const timer2 = setTimeout(() => setProgress(60), 220);
    const timer3 = setTimeout(() => setProgress(100), 420);
    const timer4 = setTimeout(() => setIsLoading(false), 620);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname]);

  // Scroll state for glass nav elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      key={href}
      href={href}
      prefetch
      className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg relative group ${
        isActive(href)
          ? 'text-black'
          : 'text-black/60 hover:text-black hover:bg-black/5'
      }`}
    >
      <span className="relative z-10">{label}</span>
      <span
        className={`pointer-events-none absolute inset-x-3 bottom-1 h-0.5 rounded-full transition-all duration-300 ${
          isActive(href) ? 'bg-black opacity-100' : 'bg-black/20 opacity-0 group-hover:opacity-100'
        }`}
      />
    </Link>
  );

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <div
          className={`h-1 bg-gradient-to-r from-black to-black/60 transition-all duration-300 ease-out ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: `${progress}%`,
            transition: 'width 0.3s ease-out, opacity 0.3s ease-out',
          }}
        />
      </div>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-b border-black/5' : 'bg-white/60 backdrop-blur border-transparent'
        }`}
        aria-label="Global Navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" prefetch aria-label="Soalin Home" className="flex items-center group">
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo_browser.svg"
                  alt="Soalin Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="ml-2 text-lg md:text-xl font-semibold text-black tracking-tight">Soalin</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center space-x-1">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/upload', label: 'Upload' },
                  { href: '/dashboard', label: 'Dashboard' },
                ].map(({ href, label }) => (
                  <NavLink key={href} href={href} label={label} />
                ))}
              </div>

              {/* Auth Button */}
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 text-black/70 hover:text-black hover:bg-black/5 rounded-lg transition-colors duration-200"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
            menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4">
            <div className="flex flex-col rounded-xl border border-black/10 bg-white/80 backdrop-blur-md shadow-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/upload', label: 'Upload' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  className={`px-4 py-3 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    isActive(href)
                      ? 'bg-black/5 text-black'
                      : 'text-black/70 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}