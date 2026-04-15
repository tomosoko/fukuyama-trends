'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendItem, Category } from '@/lib/types';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { TrendCard } from '@/components/TrendCard';
import { useDarkMode } from '@/lib/useDarkMode';
import { ArticleModal } from '@/components/ArticleModal';

type SortOrder = 'newest' | 'oldest' | 'hot';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'すべて', gourmet: 'グルメ', events: 'イベント', trends: 'トレンド',
};

export default function FavoritesPage() {
  useDarkMode();

  const [allItems, setAllItems] = useState<TrendItem[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [category, setCategory] = useState<Category>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [previewItem, setPreviewItem] = useState<TrendItem | null>(null);

  useEffect(() => {
    const ids = getFavorites();
    setFavIds(ids);
    fetch('/api/trends')
      .then(r => r.json())
      .then((data: TrendItem[]) => {
        if (!Array.isArray(data)) throw new Error('Invalid response');
        setAllItems(data.filter(i => ids.has(i.id)));
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const clearAll = () => {
    [...favIds].forEach(id => toggleFavorite(id));
    setFavIds(new Set());
    setAllItems([]);
  };

  const removeItem = (id: string) => {
    toggleFavorite(id);
    setFavIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    setAllItems(prev => prev.filter(i => i.id !== id));
  };

  const items = useMemo(() => {
    let src = category === 'all' ? allItems : allItems.filter(i => i.category === category);
    return [...src].sort((a, b) => {
      if (sortOrder === 'hot') return (b.hotScore ?? 0) - (a.hotScore ?? 0);
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      const ta = new Date(a.publishedAt).getTime();
      const tb = new Date(b.publishedAt).getTime();
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
            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">お気に入り</h1>
            {favIds.size > 0 && (
              <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded-full">
                {favIds.size}
              </span>
            )}
          </div>
          {favIds.size > 0 && (
            <button
              onClick={clearAll}
              className="ml-auto text-xs text-gray-400 hover:text-rose-500 transition-colors"
            >
              すべて削除
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">データの取得に失敗しました</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mb-4">
              保存済みのお気に入り: {favIds.size} 件
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🤍</div>
            <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">お気に入りがありません</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mb-4">
              カードのハートアイコンをタップして追加しましょう
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
                        ? 'bg-rose-500 text-white'
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
                <option value="hot">HOT順</option>
              </select>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500 px-0.5">
              {items.length} 件のお気に入り
              {category !== 'all' && <span className="ml-1">（{CATEGORY_LABELS[category]}）</span>}
            </p>

            {items.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-slate-500 py-10 text-sm">
                このカテゴリのお気に入りはありません
              </p>
            ) : (
              items.map(item => (
                <div key={item.id} className="relative group">
                  <TrendCard item={item} onPreview={() => setPreviewItem(item)} />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-slate-700 rounded-full shadow text-gray-400 hover:text-rose-500 transition-all"
                    title="お気に入りから削除"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
