'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { TrendItem, Category, AISummary } from '@/lib/types';
import { TrendCard } from '@/components/TrendCard';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonList } from '@/components/SkeletonCard';
import { TopPicks } from '@/components/TopPicks';
import { BottomNav } from '@/components/BottomNav';
import { DateFilter, DateRange, filterByDate } from '@/components/DateFilter';
import { StatsBar } from '@/components/StatsBar';
import { SortSelect, SortOrder } from '@/components/SortSelect';
import { TimelineView } from '@/components/TimelineView';
import { ToastContainer, showToast } from '@/components/Toast';
import { FukuyamaInfo } from '@/components/FukuyamaInfo';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { ScrollToTop } from '@/components/ScrollToTop';
import { FeaturedCard } from '@/components/FeaturedCard';
import { InstallPrompt } from '@/components/InstallPrompt';
import { useDebounce } from '@/lib/useDebounce';
import { useDarkMode } from '@/lib/useDarkMode';
import { useScrolled } from '@/lib/useScrolled';
import { useAutoRefresh } from '@/lib/useAutoRefresh';
import { useKeyboard } from '@/lib/useKeyboard';
import { getFavorites } from '@/lib/favorites';

const PAGE_SIZE = 12;

type SummaryTab = 'all' | 'gourmet' | 'events' | 'trends';

const SUMMARY_TABS: { value: SummaryTab; label: string; emoji: string }[] = [
  { value: 'all',     label: '全体',     emoji: '✦' },
  { value: 'gourmet', label: 'グルメ',   emoji: '🍜' },
  { value: 'events',  label: 'イベント', emoji: '🎪' },
  { value: 'trends',  label: 'トレンド', emoji: '🔥' },
];

// ---- AI要約カード（タブ切替対応） ----
function SummaryCard({ summary, loading }: { summary: AISummary | null; loading: boolean }) {
  const [tab, setTab] = useState<SummaryTab>('all');
  const [catSummary, setCatSummary] = useState<AISummary | null>(null);
  const [catLoading, setCatLoading] = useState(false);

  const loadCatSummary = async (cat: SummaryTab) => {
    if (cat === 'all') { setCatSummary(null); return; }
    setCatLoading(true);
    try {
      const res = await fetch(`/api/summary/${cat}`);
      const data = await res.json();
      setCatSummary(data);
    } catch { /* ignore */ } finally {
      setCatLoading(false);
    }
  };

  const handleTab = (t: SummaryTab) => {
    setTab(t);
    loadCatSummary(t);
  };

  const displaySummary = tab === 'all' ? summary : catSummary;
  const displayLoading = tab === 'all' ? loading : catLoading;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-xl shadow-blue-900/20">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-6 right-12 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-xs">✦</span>
          <p className="text-xs font-semibold tracking-wide opacity-80 uppercase">AI まとめ</p>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-4 bg-white/10 rounded-xl p-1">
          {SUMMARY_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => handleTab(t.value)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.value ? 'bg-white text-blue-700' : 'text-white/70 hover:text-white'
              }`}
            >
              <span>{t.emoji}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {displayLoading ? (
          <div className="space-y-2.5">
            <div className="h-5 bg-white/20 rounded-lg animate-pulse w-3/4" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-5/6" />
          </div>
        ) : (
          <>
            <p className="text-base font-bold leading-snug mb-3">{displaySummary?.highlight}</p>
            <div className="space-y-2">
              {displaySummary?.items.map(s => (
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

function DarkModeButton({ theme, toggle }: { theme: string; toggle: () => void }) {
  const icons: Record<string, string> = { light: '☀️', dark: '🌙', system: '⚙️' };
  return (
    <button onClick={toggle} className="text-base hover:scale-110 transition-transform" title={`テーマ: ${theme}`}>
      {icons[theme]}
    </button>
  );
}

function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">
        {search ? `「${search}」に一致する情報が見つかりませんでした` : '情報が見つかりませんでした'}
      </p>
      {search && <button onClick={onClear} className="mt-3 text-sm text-blue-500 hover:underline">検索をクリア</button>}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-gray-500 font-medium mb-1">情報の取得に失敗しました</p>
      <p className="text-gray-400 text-sm mb-4">ネットワーク接続を確認してください</p>
      <button onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        再試行
      </button>
    </div>
  );
}

function sortItems(items: TrendItem[], order: SortOrder): TrendItem[] {
  return [...items].sort((a, b) => {
    if (order === 'source') return a.source.localeCompare(b.source);
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return order === 'newest' ? tb - ta : ta - tb;
  });
}

// ---- メインページ ----
export default function Home() {
  const { theme, toggle: toggleDark } = useDarkMode();
  const scrolled = useScrolled(40);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<TrendItem[]>([]);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [category, setCategory] = useState<Category>('all');
  const [searchRaw, setSearchRaw] = useState('');
  const search = useDebounce(searchRaw, 300);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setFavIds(getFavorites());
    const handler = () => setFavIds(getFavorites());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const load = useCallback((force = false) => {
    setError(false);
    setPage(1);
    if (force) setRefreshing(true);
    setLoadingItems(true);
    setLoadingSummary(true);
    const qs = force ? '?bust=' + Date.now() : '';

    fetch('/api/trends' + qs)
      .then(r => r.json())
      .then((data: TrendItem[]) => {
        setItems(data);
        setUpdatedAt(new Date());
        if (force) showToast(`${data.length}件の情報を取得しました`, 'success');
      })
      .catch(() => { setError(true); if (force) showToast('データ取得に失敗しました', 'error'); })
      .finally(() => setLoadingItems(false));

    fetch('/api/summary' + qs)
      .then(r => r.json())
      .then((data: AISummary) => setSummary(data))
      .finally(() => { setLoadingSummary(false); setRefreshing(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  // 5分ごとに自動更新（キャッシュ再利用なのでAPI負荷は低い）
  useAutoRefresh(() => load(false), 5 * 60 * 1000);

  // キーボードショートカット
  useKeyboard({
    searchRef: searchInputRef,
    onRefresh: () => load(true),
    onToggleDark: toggleDark,
    onHelp: () => setHelpOpen(true),
  });

  // カテゴリ/検索変更時はページをリセット
  useEffect(() => { setPage(1); }, [category, search, dateRange, sortOrder, showFavs]);

  const counts = useMemo(() => {
    const base = { all: items.length, gourmet: 0, events: 0, trends: 0 } as Record<Category, number>;
    for (const item of items) base[item.category]++;
    return base;
  }, [items]);

  const filtered = useMemo(() => {
    let src = showFavs ? items.filter(i => favIds.has(i.id)) : items;
    src = src.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (!filterByDate(item.publishedAt, dateRange)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.summary.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    return sortItems(src, sortOrder);
  }, [items, category, search, dateRange, sortOrder, showFavs, favIds]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* ローディングバー */}
      {(loadingItems || refreshing) && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-blue-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loadbar_1.5s_ease-in-out_infinite]" />
        </div>
      )}
      {/* ヘッダー */}
      <header className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className={`max-w-2xl mx-auto px-4 flex items-center gap-3 transition-all duration-300 ${scrolled ? 'h-11' : 'h-14'}`}>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold shadow-sm shadow-blue-200">
              福
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-none">福山トレンド</h1>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                {updatedAt
                  ? `${updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 更新`
                  : '最新情報をお届け'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowFavs(v => !v)}
              className={`relative p-2 rounded-lg transition-colors ${showFavs ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              title="お気に入りフィルター"
            >
              <svg className="w-4 h-4" fill={showFavs ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favIds.size > 0 && !showFavs && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favIds.size > 9 ? '9+' : favIds.size}
                </span>
              )}
            </button>
            <Link href="/favorites" className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="お気に入りページ">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Link>
            <DarkModeButton theme={theme} toggle={toggleDark} />
            <button
              onClick={() => load(true)}
              disabled={refreshing || loadingItems}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
            >
              <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              更新
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-24 sm:pb-8 space-y-4">
        <SummaryCard summary={summary} loading={loadingSummary} />
        {/* 最注目記事ヒーロー（サムネイル付き HOT 記事の1件目） */}
        {!loadingItems && !showFavs && !search && category === 'all' && (() => {
          const hero = items.find(i => i.thumbnail && (i.hotScore ?? 0) >= 40);
          const picks = [...items]
            .sort((a, b) => (b.hotScore ?? 0) - (a.hotScore ?? 0))
            .filter(i => i.id !== hero?.id)
            .slice(0, 5);
          return (
            <>
              {hero && <FeaturedCard item={hero} />}
              {picks.length > 0 && <TopPicks items={picks} />}
            </>
          );
        })()}
        {!loadingItems && !showFavs && (category !== 'all' || search) && <TopPicks items={[...items].sort((a, b) => (b.hotScore ?? 0) - (a.hotScore ?? 0)).slice(0, 5)} />}
        {!loadingItems && <StatsBar items={items} updatedAt={updatedAt} />}

        <div className="hidden sm:block">
          <CategoryTabs active={category} onChange={setCategory} counts={counts} />
        </div>

        <SearchBar ref={searchInputRef} value={searchRaw} onChange={setSearchRaw} />

        {/* フィルター行 */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <DateFilter active={dateRange} onChange={setDateRange} />
          <div className="flex items-center gap-2 ml-auto">
            {/* ビュー切替 */}
            <div className="flex border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 text-xs transition-colors ${viewMode === 'grid' ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                title="グリッド表示"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1.5 text-xs border-l border-gray-200 dark:border-slate-700 transition-colors ${viewMode === 'timeline' ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                title="タイムライン表示"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            <SortSelect value={sortOrder} onChange={setSortOrder} />
          </div>
        </div>

        {showFavs && (
          <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-xs text-rose-500 font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            お気に入りのみ表示中
            <button onClick={() => setShowFavs(false)} className="ml-auto underline">解除</button>
          </div>
        )}

        {!loadingItems && !error && (
          <p className="text-xs text-gray-400 dark:text-slate-500 px-0.5">
            {filtered.length} 件
            {search && <span className="ml-1 text-blue-400">「{search}」で絞り込み中</span>}
          </p>
        )}

        {error ? (
          <ErrorState onRetry={() => load(true)} />
        ) : loadingItems ? (
          <SkeletonList count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState search={searchRaw} onClear={() => setSearchRaw('')} />
        ) : (
          <>
            {viewMode === 'timeline' ? (
              <TimelineView items={filtered} search={search} />
            ) : (
              <>
                <div className="space-y-3">
                  {visible.map((item, i) => (
                    <div key={item.id} className={`stagger-item animate-fade-in-up`} style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}>
                      <TrendCard item={item} search={search} />
                    </div>
                  ))}
                </div>
                {/* もっと見る */}
                {hasMore && (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="w-full py-3.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-400 dark:text-slate-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    もっと見る — あと {filtered.length - visible.length} 件
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* 福山市インフォ */}
        <FukuyamaInfo />

        <p className="text-center text-xs text-gray-300 dark:text-slate-700 pb-2">
          RSS · Google News · Claude AI から自動収集
        </p>
      </main>

      <BottomNav active={category} onChange={setCategory} counts={counts} />
      <ToastContainer />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ScrollToTop />
      <InstallPrompt />
    </div>
  );
}
