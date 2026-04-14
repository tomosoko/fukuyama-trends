'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendItem } from '@/lib/types';
import { HOT_THRESHOLD } from '@/lib/hot-score';
import { useDarkMode } from '@/lib/useDarkMode';

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

function StatCard({ label, value, sub, color = 'blue' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
    rose:   'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  };
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 dark:text-slate-400 w-24 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-xs text-gray-500 dark:text-slate-400 w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

export default function StatsPage() {
  useDarkMode();
  const [items, setItems] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch('/api/trends')
      .then(r => r.json())
      .then((data: TrendItem[]) => {
        if (!Array.isArray(data)) throw new Error('invalid response');
        setItems(data);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!items.length) return null;

    const gourmet = items.filter(i => i.category === 'gourmet').length;
    const events  = items.filter(i => i.category === 'events').length;
    const trends  = items.filter(i => i.category === 'trends').length;
    const hot = items.filter(i => (i.hotScore ?? 0) >= HOT_THRESHOLD).length;
    const withThumb = items.filter(i => i.thumbnail).length;

    // ソース別
    const sourceMap = new Map<string, number>();
    for (const item of items) sourceMap.set(item.source, (sourceMap.get(item.source) ?? 0) + 1);
    const topSources = [...sourceMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    // 時間帯別
    const hourly = new Array(24).fill(0) as number[];
    for (const item of items) {
      if (!item.publishedAt) continue;
      try { hourly[new Date(item.publishedAt).getHours()]++; } catch { /* skip */ }
    }
    const peakHour = hourly.indexOf(Math.max(...hourly));

    // 曜日別
    const daily = new Array(7).fill(0) as number[];
    for (const item of items) {
      if (!item.publishedAt) continue;
      try { daily[new Date(item.publishedAt).getDay()]++; } catch { /* skip */ }
    }

    // HOTスコア分布
    const scoreRanges = [
      { label: '0-9',   count: items.filter(i => (i.hotScore ?? 0) < 10).length },
      { label: '10-19', count: items.filter(i => (i.hotScore ?? 0) >= 10 && (i.hotScore ?? 0) < 20).length },
      { label: '20-29', count: items.filter(i => (i.hotScore ?? 0) >= 20 && (i.hotScore ?? 0) < 30).length },
      { label: '30-39', count: items.filter(i => (i.hotScore ?? 0) >= 30 && (i.hotScore ?? 0) < 40).length },
      { label: '40+',   count: items.filter(i => (i.hotScore ?? 0) >= 40).length },
    ];

    const avgHot = Math.round(items.reduce((sum, i) => sum + (i.hotScore ?? 0), 0) / items.length);

    return { gourmet, events, trends, hot, withThumb, topSources, hourly, peakHour, daily, scoreRanges, avgHot };
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">📊 統計ダッシュボード</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center py-20 text-center gap-3">
            <p className="text-5xl">⚠️</p>
            <p className="text-gray-500 dark:text-slate-400 font-medium">データの取得に失敗しました</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : !stats ? (
          <p className="text-center text-gray-400 py-20">データなし</p>
        ) : (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="合計記事数" value={items.length} sub="件" color="blue" />
              <StatCard label="HOT記事" value={stats.hot} sub={`${Math.round(stats.hot / items.length * 100)}%`} color="rose" />
              <StatCard label="平均HOTスコア" value={stats.avgHot} sub="点" color="orange" />
              <StatCard label="グルメ" value={stats.gourmet} sub={`${Math.round(stats.gourmet / items.length * 100)}%`} color="orange" />
              <StatCard label="イベント" value={stats.events} sub={`${Math.round(stats.events / items.length * 100)}%`} color="blue" />
              <StatCard label="トレンド" value={stats.trends} sub={`${Math.round(stats.trends / items.length * 100)}%`} color="violet" />
            </div>

            {/* カテゴリ分布バー */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">カテゴリ分布</p>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-3">
                <div className="bg-orange-400" style={{ width: `${stats.gourmet / items.length * 100}%` }} title="グルメ" />
                <div className="bg-blue-400"   style={{ width: `${stats.events  / items.length * 100}%` }} title="イベント" />
                <div className="bg-violet-400" style={{ width: `${stats.trends  / items.length * 100}%` }} title="トレンド" />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />グルメ {stats.gourmet}件</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />イベント {stats.events}件</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" />トレンド {stats.trends}件</span>
              </div>
            </div>

            {/* トップソース */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-4">メディア別記事数</p>
              <div className="space-y-2.5">
                {stats.topSources.map(([src, count]) => (
                  <MiniBar key={src} label={src} value={count} max={stats.topSources[0][1]} color="bg-blue-400" />
                ))}
              </div>
            </div>

            {/* 時間帯別 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">時間帯別 記事数</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">ピーク: {stats.peakHour}時台</p>
              <div className="flex items-end gap-0.5 h-16">
                {stats.hourly.map((count, h) => (
                  <div key={h} className="flex-1 flex flex-col items-center gap-0.5 group" title={`${h}時: ${count}件`}>
                    <div
                      className="w-full rounded-sm bg-blue-400 group-hover:bg-blue-500 transition-colors"
                      style={{ height: `${Math.max(2, (count / Math.max(...stats.hourly, 1)) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-gray-300 dark:text-slate-600">
                <span>0時</span><span>6時</span><span>12時</span><span>18時</span><span>23時</span>
              </div>
            </div>

            {/* 曜日別 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">曜日別 記事数</p>
              <div className="flex gap-2">
                {stats.daily.map((count, d) => (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-lg bg-indigo-400"
                      style={{ height: `${Math.max(8, (count / Math.max(...stats.daily, 1)) * 60)}px` }}
                    />
                    <span className="text-[10px] text-gray-400">{DOW[d]}</span>
                    <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HOTスコア分布 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">HOTスコア分布</p>
              <div className="space-y-2">
                {stats.scoreRanges.map(({ label, count }) => (
                  <MiniBar key={label} label={label} value={count} max={Math.max(...stats.scoreRanges.map(r => r.count), 1)} color="bg-rose-400" />
                ))}
              </div>
            </div>

            {/* サムネイル率 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-2">サムネイル付き記事率</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${(stats.withThumb / items.length) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                  {Math.round(stats.withThumb / items.length * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{stats.withThumb} / {items.length} 件</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
