'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TrendItem } from '@/lib/types';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { getReadIds, markAsRead } from '@/lib/read-history';
import { HOT_THRESHOLD } from '@/lib/hot-score';
import { matchesAlert } from '@/lib/keyword-alerts';
import { highlight } from './SearchBar';
import { showToast } from './Toast';

const CATEGORY_CONFIG = {
  gourmet: { label: 'グルメ',   emoji: '🍜', color: 'bg-orange-500', light: 'bg-orange-50 text-orange-600', gradient: 'from-orange-400 to-amber-500' },
  events:  { label: 'イベント', emoji: '🎪', color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-600',     gradient: 'from-blue-400 to-cyan-500'   },
  trends:  { label: 'トレンド', emoji: '🔥', color: 'bg-violet-500', light: 'bg-violet-50 text-violet-600', gradient: 'from-violet-400 to-purple-600'},
};

function isNew(dateStr?: string) {
  if (!dateStr) return false;
  try { return Date.now() - new Date(dateStr).getTime() < 6 * 3600000; } catch { return false; }
}

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
      showToast('URLをコピーしました');
    }
  } catch { /* キャンセル等は無視 */ }
}

// 画像付きビッグカード
function BigCard({ item, search, fav, isRead, alertMatch, onFav, onRead, onPreview }: CardProps) {
  const cfg = CATEGORY_CONFIG[item.category];
  const date = formatDate(item.publishedAt);
  const [imgError, setImgError] = useState(false);
  const showImg = item.thumbnail && !imgError;
  const showNew = !isRead && isNew(item.publishedAt);

  return (
    <article className={`group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border transition-all duration-300 ${alertMatch ? 'border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-800' : 'border-gray-100 dark:border-slate-700'} hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-slate-900/40 ${isRead ? 'opacity-70' : ''}`}>
      {/* 画像エリア */}
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onRead}
        className={`block relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br ${cfg.gradient} dark:bg-slate-700`}>
        {showImg && (
          <Image
            src={item.thumbnail!}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
            onError={() => setImgError(true)}
          />
        )}
        {/* 画像なし時のカテゴリアイコン */}
        {!showImg && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
            {cfg.emoji}
          </div>
        )}
        {/* カテゴリバッジ（画像の上） */}
        <span className={`absolute top-3 left-3 ${cfg.color} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow`}>
          {cfg.label}
        </span>
        {/* HOT/NEW/ALERTバッジ */}
        {alertMatch ? (
          <span className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            🔔 {alertMatch}
          </span>
        ) : (item.hotScore ?? 0) >= HOT_THRESHOLD ? (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
            🔥 HOT
          </span>
        ) : showNew ? (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            NEW
          </span>
        ) : null}
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </a>

      {/* テキストエリア */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 dark:text-slate-500">
          <span className="truncate">{item.source}</span>
          {date && <span className="ml-auto shrink-0">{date}</span>}
        </div>
        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base leading-snug mb-2 line-clamp-2">
          <button onClick={onPreview ?? onRead} className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full">
            {highlight(item.title, search)}
          </button>
        </h3>
        {item.summary && (
          <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {highlight(item.summary, search)}
          </p>
        )}
        <div className="flex items-center gap-2">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">
              続きを読む →
            </a>
          )}
          <div className="ml-auto flex gap-1">
            <button onClick={onFav}
              className={`p-1.5 rounded-lg transition-colors ${fav ? 'text-rose-500 bg-rose-50' : 'text-gray-300 hover:text-rose-400 hover:bg-rose-50'}`}>
              <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button onClick={() => shareItem(item)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// 画像なしコンパクトカード
function SmallCard({ item, search, fav, isRead, alertMatch, onFav, onRead, onPreview }: CardProps) {
  const cfg = CATEGORY_CONFIG[item.category];
  const date = formatDate(item.publishedAt);
  const showNew = !isRead && isNew(item.publishedAt);

  return (
    <article className={`group bg-white dark:bg-slate-800 rounded-xl border p-3.5 flex gap-3 hover:shadow-md transition-all duration-200 ${alertMatch ? 'border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-800' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-gray-100 dark:hover:shadow-slate-900/30'} ${isRead ? 'opacity-60' : ''}`}>
      {/* カテゴリライン */}
      <div className={`w-1 rounded-full shrink-0 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.light}`}>{cfg.label}</span>
          {alertMatch && (
            <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">🔔</span>
          )}
          {!alertMatch && (item.hotScore ?? 0) >= HOT_THRESHOLD && (
            <span className="text-xs font-bold text-rose-500">🔥</span>
          )}
          {!alertMatch && showNew && (
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">NEW</span>
          )}
          <span className="text-xs text-gray-400 dark:text-slate-500 truncate">{item.source}</span>
          {date && <span className="text-xs text-gray-300 dark:text-slate-600 ml-auto shrink-0">{date}</span>}
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm leading-snug mb-1 line-clamp-2">
          <button
            onClick={onPreview ?? onRead}
            className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full"
          >
            {highlight(item.title, search)}
          </button>
        </h3>
        {item.summary && (
          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
            {highlight(item.summary, search)}
          </p>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onFav}
          className={`p-1 rounded-lg transition-colors ${fav ? 'text-rose-500' : 'text-gray-300 hover:text-rose-400'}`}>
          <svg className="w-3.5 h-3.5" fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={onRead}
            className="p-1 text-gray-300 hover:text-blue-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}

interface CardProps {
  item: TrendItem;
  search: string;
  fav: boolean;
  isRead: boolean;
  alertMatch: string | null;
  onFav: () => void;
  onRead: () => void;
  onPreview?: () => void;
}

export function TrendCard({ item, search = '', alerts = [], onPreview }: { item: TrendItem; search?: string; alerts?: string[]; onPreview?: () => void }) {
  const [fav, setFav] = useState(false);
  const [isRead, setIsRead] = useState(false);
  useEffect(() => {
    setFav(getFavorites().has(item.id));
    setIsRead(getReadIds().has(item.id));
  }, [item.id]);
  const handleFav = () => setFav(toggleFavorite(item.id));
  const handleRead = () => { markAsRead(item.id); setIsRead(true); };
  const alertMatch = matchesAlert(item.title + ' ' + item.summary, alerts);

  const props: CardProps = { item, search, fav, isRead, alertMatch, onFav: handleFav, onRead: handleRead, onPreview };
  return item.thumbnail
    ? <BigCard {...props} />
    : <SmallCard {...props} />;
}
