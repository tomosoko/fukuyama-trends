'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendItem, Category } from '@/lib/types';
import { getReadIds, markAsRead, clearReadHistory } from '@/lib/read-history';
import { TrendCard } from '@/components/TrendCard';
import { useDarkMode } from '@/lib/useDarkMode';
import { ArticleModal } from '@/components/ArticleModal';

type SortOrder = 'newest' | 'oldest';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'すべて', gourmet: 'グルメ', events: 'イベント', trends: 'トレンド',
};

export default function HistoryPage() {
  useDarkMode();

  const [allItems, setAllItems] = useState<TrendItem[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [previewItem, setPreviewItem] = useState<TrendItem | null>(null);

  useEffect(() => {
    const readIds = getReadIds();
    setIds(readIds);
    fetch('/api/trends')
      .then(r => r.json())
      .then((data: TrendItem[]) => setAllItems(data.filter(i => readIds.has(i.id))))
      .finally(() => setLoading(false));
  }, []);

  const clear = () => {
    clearReadHistory();
    setIds(new Set());
    setAllItems([]);
  };

  const items = useMemo(() => {
    let src = category === 'all' ? allItems : allItems.filter(i => i.category === category);
    return [...src].sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
  }, [allItems, category, sortOrder]);

  const catCounts = useMemo(() => ({
    all: allItems.length,
    gourmet: allItems.filter(i => i.category === 'gourmet').length,
    events: allItems.filter(i => i.category === 'events').length,
    trends: allItems.filter(i => i.category === 'trends').length,
  }), [allItems]);

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
            <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <main className="max-w-2xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : allItems.length === 0 ? (
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
          <div className="space-y-3">
            {/* フィルター行 */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1.5 flex-wrap flex-1">
                {(['all', 'gourmet', 'events', 'trends'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      category === cat
                        ? 'bg-gray-700 dark:bg-slate-300 text-white dark:text-slate-900'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                    {catCounts[cat] > 0 && <span className="ml-1 opacity-70">{catCounts[cat]}</span>}
                  </button>
                ))}
              </div>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as SortOrder)}
                className="text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="newest">新着順</option>
                <option value="oldest">古い順</option>
              </select>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500 px-0.5">
              {items.length} 件の閲覧履歴
              {category !== 'all' && <span className="ml-1">（{CATEGORY_LABELS[category]}）</span>}
            </p>

            {items.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-slate-500 py-10 text-sm">
                このカテゴリの履歴はありません
              </p>
            ) : (
              items.map(item => (
                <TrendCard
                  key={item.id}
                  item={item}
                  onPreview={() => setPreviewItem(item)}
                />
              ))
            )}
          </div>
        )}
      </main>

      <ArticleModal
        item={previewItem}
        allItems={allItems}
        onClose={() => setPreviewItem(null)}
        onNavigate={item => setPreviewItem(item)}
      />
    </div>
  );
}
