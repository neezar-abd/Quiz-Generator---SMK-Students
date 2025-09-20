'use client';

import { useEffect } from 'react';
import { useUISound } from './useUISound';

export default function GlobalSound() {
  const { play } = useUISound('/pop.mp3', 0.35);

  useEffect(() => {
    const interactiveSelector = [
      'button',
      '[role="button"]',
      'a[href]',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      'summary',
      'label[for]',
      '[role="link"]',
      '[data-sound="true"]'
    ].join(',');

    const isInteractive = (el: Element | null) => {
      if (!el) return false;
      return !!(el.closest(interactiveSelector));
    };

    const handleClick = (e: MouseEvent) => {
      // Ignore right/middle clicks
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Explicit silence
      if (target.closest('[data-silent="true"]')) return;
      // Only play for interactive elements (avoid blank space clicks)
      if (!isInteractive(target)) return;
      play();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-silent="true"]')) return;
      if (!isInteractive(target)) return;
      play();
    };

    const handleSubmit = () => play();

    // Best-effort on refresh/navigation
    const handleBeforeUnload = () => {
      try { play(); } catch {}
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKey, true);
    document.addEventListener('submit', handleSubmit, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKey, true);
      document.removeEventListener('submit', handleSubmit, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [play]);

  return null;
}
