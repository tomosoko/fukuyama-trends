'use client';

import { useEffect, useState } from 'react';

export function OfflineBar() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => { setIsOffline(true); setWasOffline(true); setShowRestore(false); };
    const handleOnline = () => { setIsOffline(false); setShowRestore(true); setTimeout(() => setShowRestore(false), 3000); };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showRestore) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold transition-all duration-300 ${
      isOffline
        ? 'bg-rose-500 text-white'
        : 'bg-emerald-500 text-white'
    }`}>
      {isOffline ? (
        <>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 6.343a9 9 0 000 12.728m2.829-2.829a5 5 0 000-7.072M12 12h.01" />
          </svg>
          オフライン — ネットワーク接続を確認してください
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          オンラインに復帰しました
        </>
      )}
    </div>
  );
}
