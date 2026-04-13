'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { TrendItem, Category, AISummary } from '@/lib/types';
import { TrendCard } from '@/components/TrendCard';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  const [items, setItems] = useState<TrendItem[]>([]);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((force = false) => {
    if (force) setRefreshing(true);
    setLoadingItems(true);
    setLoadingSummary(true);

    const qs = force ? '?t=' + Date.now() : '';

    fetch('/api/trends' + qs)
      .then(r => r.json())
      .then((data: TrendItem[]) => { setItems(data); setUpdatedAt(new Date()); })
      .finally(() => setLoadingItems(false));

    fetch('/api/summary' + qs)
      .then(r => r.json())
      .then((data: AISummary) => setSummary(data))
      .finally(() => { setLoadingSummary(false); setRefreshing(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (search && !item.title.includes(search) && !item.summary.includes(search)) return false;
      return true;
    });
  }, [items, category, search]);

  const timeStr = updatedAt
    ? updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">福山トレンド</h1>
            <p className="text-xs text-gray-400">
              福山市の最新情報をまとめてお届け
              {timeStr && <span className="ml-2">· {timeStr} 更新</span>}
            </p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing || loadingItems}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
            title="更新"
          >
            <svg
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* AI要約カード */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <p className="text-xs font-medium opacity-80 mb-1">今週の福山 — AI まとめ</p>
          {loadingSummary ? (
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
              <div className="h-3 bg-white/10 rounded animate-pulse w-5/6" />
            </div>
          ) : (
            <>
              <p className="font-bold text-base mb-3">{summary?.highlight}</p>
              <div className="space-y-1">
                {summary?.items.map(s => (
                  <div key={s.category} className="flex gap-2 text-xs">
                    <span className="bg-white/20 rounded px-1.5 py-0.5 shrink-0">{s.category}</span>
                    <span className="opacity-90">{s.text}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <CategoryTabs active={category} onChange={setCategory} />
        <SearchBar value={search} onChange={setSearch} />

        {!loadingItems && (
          <p className="text-xs text-gray-400">{filtered.length} 件の情報</p>
        )}

        {loadingItems ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            該当する情報が見つかりませんでした
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(item => (
              <TrendCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-300 pb-4">
          情報はRSS・Google News・Claude AIから取得しています
        </p>
      </div>
    </main>
  );
}
