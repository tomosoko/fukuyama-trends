'use client';

import { useEffect } from 'react';

const SHORTCUTS = [
  { key: '/',         desc: '検索フォームにフォーカス' },
  { key: 'Esc',       desc: '検索クリア・モーダル閉じる' },
  { key: 'r',         desc: 'データを手動更新' },
  { key: 'd',         desc: 'ダークモード切替' },
  { key: '?',         desc: 'このヘルプを表示' },
  { key: '← →',      desc: 'モーダル内: 関連記事を切替' },
  { key: '↓ swipe',  desc: 'モーダルを閉じる（スワイプ）' },
];

export function KeyboardHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-slate-100">キーボードショートカット</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-mono rounded-lg border border-gray-200 dark:border-slate-600">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-4 text-center">
          入力中はショートカット無効
        </p>
      </div>
    </div>
  );
}
