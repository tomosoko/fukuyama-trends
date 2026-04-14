'use client';

import { useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('system');
  const themeRef = useRef<Theme>('system');

  // refを常に最新状態に同期（クロージャ問題を回避）
  useEffect(() => { themeRef.current = theme; }, [theme]);

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(saved);
    themeRef.current = saved;
    applyTheme(saved);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    // refを使うことでstaleクロージャを回避
    const handler = () => { if (themeRef.current === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => {
    const next: Theme =
      theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  return { theme, toggle };
}
