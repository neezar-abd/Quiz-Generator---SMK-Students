'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type PageTransitionProps = PropsWithChildren<unknown>;

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fade out, then swap key, then fade in
    setVisible(false);
    const t = setTimeout(() => {
      setKey(pathname);
      setVisible(true);
    }, 120);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div key={key} className="relative">
      <div
        className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
}
