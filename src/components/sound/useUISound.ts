'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'ui-sound-enabled';

export function useUISound(src: string = '/pop.mp3', volume: number = 0.35) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? v === '1' : true;
  });
  const [unlocked, setUnlocked] = useState(false);

  // Create base audio element
  useEffect(() => {
    const el = new Audio(src);
    el.volume = volume;
    el.preload = 'auto';
    audioRef.current = el;
    return () => {
      el.pause();
      // no need to remove, GC will collect
    };
  }, [src, volume]);

  // Unlock audio after first user gesture
  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      try {
        audioRef.current?.play().then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          setUnlocked(true);
          remove();
        }).catch(() => {
          // ignore
        });
      } catch {
        // ignore
      }
    };
    const remove = () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    document.addEventListener('keydown', unlock, { once: true });
    return remove;
  }, [unlocked]);

  const play = useCallback(() => {
    if (!enabled || !audioRef.current) return;
    // Clone to allow overlapping sounds
    const el = audioRef.current.cloneNode(true) as HTMLAudioElement;
    el.volume = audioRef.current.volume;
    void el.play().catch(() => {/* ignore */});
  }, [enabled]);

  const setEnabledPersistent = useCallback((val: boolean) => {
    setEnabled(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, val ? '1' : '0');
    }
  }, []);

  return useMemo(() => ({ play, enabled, setEnabled: setEnabledPersistent }), [play, enabled, setEnabledPersistent]);
}
