'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-black/10 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Subtle divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8"></div>
        
        <div className="py-8">
          {/* Top section - Logo & Description */}
          <div className="flex flex-col lg:flex-row justify-between items-start space-y-8 lg:space-y-0 lg:space-x-12 mb-8">
            {/* Left - Logo & Tagline */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image 
                    src="/logo.svg" 
                    alt="AI Quiz Logo" 
                    width={48} 
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <p className="text-black/60 text-sm max-w-md leading-relaxed">
                Transform your study materials into intelligent quizzes. Perfect for SMK students and teachers.
              </p>
            </div>

            {/* Center - Developer Info */}
            <div className="flex flex-col space-y-3">
              <h3 className="font-medium text-black text-sm">Developer</h3>
              <div className="space-y-2 text-sm text-black/60">
                <p className="font-medium text-black">Neezar Abd</p>
                <p>SMK Negeri 1 Probolinggo</p>
                <p>Jurusan RPL Kelas 11</p>
              </div>
            </div>

            {/* Right - Contact Info */}
            <div className="flex flex-col space-y-3">
              <h3 className="font-medium text-black text-sm">Contact</h3>
              <div className="space-y-2 text-sm">
                <a 
                  href="mailto:nizarabdurr@gmail.com" 
                  className="text-black/60 hover:text-black transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>nizarabdurr@gmail.com</span>
                </a>
                <a 
                  href="https://instagram.com/neezar_abd" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black/60 hover:text-black transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>@neezar_abd</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom section - Copyright */}
          <div className="border-t border-black/5 pt-6 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-black/40 text-xs">
              © {currentYear} AI Quiz Generator. Built with ❤️ for SMK students.
            </p>
            <p className="text-black/40 text-xs">
              Empowering education through artificial intelligence
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}