'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/favorites',  label: 'お気に入り',  icon: '❤️', desc: '保存した記事一覧' },
  { href: '/read-later', label: 'あとで読む',  icon: '🔖', desc: 'ブックマーク記事' },
  { href: '/history',    label: '閲覧履歴',    icon: '🕐', desc: '最近読んだ記事' },
  { href: '/stats',      label: '統計',        icon: '📊', desc: 'データ分析ダッシュボード' },
];

export function NavDrawer() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!drawerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  return (
    <div ref={drawerRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`p-2 rounded-lg transition-colors ${open ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
        aria-label="メニューを開く"
        title="メニュー"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
          <div className="p-2 space-y-0.5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <span className="text-base w-6 text-center">{link.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.label}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-slate-700 p-2">
            <Link
              href="https://github.com/tomosoko/fukuyama-trends"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-400 dark:text-slate-500 text-xs"
            >
              <span>⭐</span>
              GitHub でスターをつける
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
