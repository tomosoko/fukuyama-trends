'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendItem } from '@/lib/types';
import { getReadIds, clearReadHistory } from '@/lib/read-history';
import { TrendCard } from '@/components/TrendCard';
import { useDarkMode } from '@/lib/useDarkMode';

export default function HistoryPage() {
  useDarkMode();

  const [items, setItems] = useState<TrendItem[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const readIds = getReadIds();
    setIds(readIds);
    fetch('/api/trends')
      .then(r => r.json())
      .then((data: TrendItem[]) => setItems(data.filter(i => readIds.has(i.id))))
      .finally(() => setLoading(false));
  }, []);

  const clear = () => {
    clearReadHistory();
    setIds(new Set());
    setItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">閲覧履歴</h1>
            {ids.size > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                {ids.size}
              </span>
            )}
          </div>
          {ids.size > 0 && (
            <button
              onClick={clear}
              className="ml-auto text-xs text-gray-400 hover:text-rose-500 transition-colors"
            >
              履歴をクリア
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">閲覧履歴がありません</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mb-4">
              記事を読むと自動的に履歴に追加されます
            </p>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-slate-500 px-0.5">{items.length} 件の閲覧履歴</p>
            {items.map(item => (
              <TrendCard key={item.id} item={item} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
