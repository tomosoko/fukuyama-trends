'use client';

import { useEffect, useRef } from 'react';

export function useInfiniteScroll(callback: () => void, enabled = true) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // callbackをrefで保持し、observerを再接続せずに最新のcallbackを常に呼べるようにする
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) callbackRef.current();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]); // callbackを依存に含めない（refで最新値を保持）

  return sentinelRef;
}
