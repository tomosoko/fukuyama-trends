'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(saved);
    applyTheme(saved);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    const next: Theme =
      theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  return { theme, toggle };
}
