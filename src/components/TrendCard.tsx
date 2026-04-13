'use client';

import { useState, useEffect } from 'react';
import { TrendItem } from '@/lib/types';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { highlight } from './SearchBar';

const CATEGORY_CONFIG = {
  gourmet: { label: 'グルメ',   bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
  events:  { label: 'イベント', bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-400'  },
  trends:  { label: 'トレンド', bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400' },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const diffH = Math.floor((Date.now() - d.getTime()) / 3600000);
    if (diffH < 1) return 'たった今';
    if (diffH < 24) return `${diffH}時間前`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}日前`;
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  } catch { return null; }
}

async function shareItem(item: TrendItem) {
  try {
    if (navigator.share) {
      await navigator.share({ title: item.title, url: item.url || location.href });
    } else if (item.url) {
      await navigator.clipboard.writeText(item.url);
    }
  } catch { /* キャンセル等は無視 */ }
}

export function TrendCard({ item, search = '' }: { item: TrendItem; search?: string }) {
  const cfg = CATEGORY_CONFIG[item.category];
  const date = formatDate(item.publishedAt);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(getFavorites().has(item.id));
  }, [item.id]);

  const handleFav = () => {
    const next = toggleFavorite(item.id);
    setFav(next);
  };

  return (
    <article className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700
      hover:border-gray-200 dark:hover:border-slate-600 p-4
      hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-slate-900/30
      transition-all duration-200 animate-fade-in-up stagger-item">

      {/* ヘッダー行 */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-xs text-gray-400 dark:text-slate-500 truncate">{item.source}</span>
        {date && <span className="text-xs text-gray-300 dark:text-slate-600 ml-auto shrink-0">{date}</span>}
      </div>

      {/* タイトル */}
      <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm leading-snug mb-1.5 line-clamp-2">
        {highlight(item.title, search)}
      </h3>

      {/* 概要 */}
      {item.summary && (
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {highlight(item.summary, search)}
        </p>
      )}

      {/* フッター */}
      <div className="flex items-center gap-2">
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors">
            詳細を見る →
          </a>
        )}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* お気に入りボタン */}
          <button onClick={handleFav}
            className={`p-1.5 rounded-lg transition-colors ${fav ? 'text-rose-500 bg-rose-50' : 'text-gray-300 hover:text-rose-400 hover:bg-rose-50'}`}
            title={fav ? 'お気に入りを解除' : 'お気に入りに追加'}>
            <svg className="w-3.5 h-3.5" fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* シェアボタン */}
          <button onClick={() => shareItem(item)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
            title="シェア">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
