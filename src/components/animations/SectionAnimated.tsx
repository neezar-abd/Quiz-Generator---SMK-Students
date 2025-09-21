'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';

type SectionAnimatedProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  y?: number; // initial translateY
}>;

export default function SectionAnimated({ children, className = '', delay = 0, y = 12 }: SectionAnimatedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            obs.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, prefersReduced]);

  return (
    <div
      ref={ref}
      className={`${className} ${prefersReduced ? '' : 'transition-all duration-700 will-change-transform will-change-opacity'} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0'}`}
      style={{ transform: visible ? 'translateY(0)' : `translateY(${y}px)` }}
    >
      {children}
    </div>
  );
}
