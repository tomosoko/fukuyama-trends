'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { TrendItem, Category, AISummary } from '@/lib/types';
import { TrendCard } from '@/components/TrendCard';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonList } from '@/components/SkeletonCard';

// ---- AI要約カード ----
function SummaryCard({ summary, loading }: { summary: AISummary | null; loading: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-xl shadow-blue-900/20">
      {/* 背景装飾 */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-6 right-12 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-xs">✦</span>
          <p className="text-xs font-semibold tracking-wide opacity-80 uppercase">今週の福山 AI まとめ</p>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            <div className="h-5 bg-white/20 rounded-lg animate-pulse w-3/4" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-4/5" />
          </div>
        ) : (
          <>
            <p className="text-lg font-bold leading-snug mb-4">{summary?.highlight}</p>
            <div className="space-y-2">
              {summary?.items.map(s => (
                <div key={s.category} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 shrink-0 rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">
                    {s.category}
                  </span>
                  <span className="opacity-90 leading-relaxed">{s.text}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- 空状態 ----
function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-gray-500 font-medium mb-1">
        {search ? `「${search}」に一致する情報が見つかりませんでした` : '情報が見つかりませんでした'}
      </p>
      {search && (
        <button
          onClick={onClear}
          className="mt-3 text-sm text-blue-500 hover:underline"
        >
          検索をクリア
        </button>
      )}
    </div>
  );
}

// ---- エラー状態 ----
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-gray-500 font-medium mb-1">情報の取得に失敗しました</p>
      <p className="text-gray-400 text-sm mb-4">ネットワーク接続を確認してください</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        再試行
      </button>
    </div>
  );
}

// ---- メインページ ----
export default function Home() {
  const [items, setItems] = useState<TrendItem[]>([]);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((force = false) => {
    setError(false);
    if (force) setRefreshing(true);
    setLoadingItems(true);
    setLoadingSummary(true);
    const qs = force ? '?bust=' + Date.now() : '';

    fetch('/api/trends' + qs)
      .then(r => r.json())
      .then((data: TrendItem[]) => { setItems(data); setUpdatedAt(new Date()); })
      .catch(() => setError(true))
      .finally(() => setLoadingItems(false));

    fetch('/api/summary' + qs)
      .then(r => r.json())
      .then((data: AISummary) => setSummary(data))
      .finally(() => { setLoadingSummary(false); setRefreshing(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const base = { all: items.length, gourmet: 0, events: 0, trends: 0 };
    for (const item of items) base[item.category]++;
    return base;
  }, [items]);

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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold shadow-sm shadow-blue-200">
              福
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">福山トレンド</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {timeStr ? `${timeStr} 更新` : '最新情報をお届け'}
              </p>
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing || loadingItems}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            更新
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* AI要約 */}
        <SummaryCard summary={summary} loading={loadingSummary} />

        {/* フィルター */}
        <CategoryTabs active={category} onChange={setCategory} counts={counts} />
        <SearchBar value={search} onChange={setSearch} />

        {/* 件数 */}
        {!loadingItems && !error && (
          <p className="text-xs text-gray-400 px-0.5">
            {filtered.length} 件の情報
            {search && <span className="ml-1 text-blue-400">「{search}」で絞り込み中</span>}
          </p>
        )}

        {/* コンテンツ */}
        {error ? (
          <ErrorState onRetry={() => load(true)} />
        ) : loadingItems ? (
          <SkeletonList count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} onClear={() => setSearch('')} />
        ) : (
          <div className="grid gap-3">
            {filtered.map(item => (
              <TrendCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-300 pb-6 pt-2">
          RSS · Google News · Claude AI から自動収集
        </p>
      </main>
    </div>
  );
}
