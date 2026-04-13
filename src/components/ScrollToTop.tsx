'use client';

import { useScrolled } from '@/lib/useScrolled';

export function ScrollToTop() {
  const visible = useScrolled(400);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="ページ先頭へ"
      className="fixed bottom-24 sm:bottom-8 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:scale-110 transition-transform"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
