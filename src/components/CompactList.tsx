'use client';

import { TrendItem } from '@/lib/types';
import { HOT_THRESHOLD } from '@/lib/hot-score';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { markAsRead, getReadIds } from '@/lib/read-history';
import { highlight } from './SearchBar';
import { useState, useEffect } from 'react';

const CAT_DOT: Record<string, string> = {
  gourmet: 'bg-orange-400',
  events:  'bg-blue-400',
  trends:  'bg-violet-400',
};

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const diffH = Math.floor((Date.now() - d.getTime()) / 3600000);
    if (diffH < 1) return '今';
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d`;
  } catch { return ''; }
}

interface CompactItemProps {
  item: TrendItem;
  search: string;
  onPreview?: () => void;
}

function CompactItem({ item, search, onPreview }: CompactItemProps) {
  const [fav, setFav] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const isHot = (item.hotScore ?? 0) >= HOT_THRESHOLD;

  useEffect(() => {
    setFav(getFavorites().has(item.id));
    setIsRead(getReadIds().has(item.id));
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'fukuyama-favorites') setFav(getFavorites().has(item.id));
      if (e.key === 'fukuyama-read') setIsRead(getReadIds().has(item.id));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [item.id]);

  const handleClick = () => {
    markAsRead(item.id);
    setIsRead(true);
    if (onPreview) { onPreview(); return; }
    if (item.url) window.open(item.url, '_blank');
  };

  return (
    <div
      className={`flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer border-b border-gray-50 dark:border-slate-800/50 last:border-0 ${isRead ? 'opacity-60' : ''}`}
      onClick={handleClick}
    >
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${CAT_DOT[item.category]}`} />
      <span className="flex-1 text-sm text-gray-800 dark:text-slate-200 line-clamp-1 font-medium leading-snug">
        {highlight(item.title, search)}
      </span>
      {isHot && <span className="text-xs text-rose-400 shrink-0">🔥</span>}
      <span className="text-[10px] text-gray-300 dark:text-slate-600 shrink-0">{item.source.slice(0, 10)}</span>
      <span className="text-[10px] text-gray-300 dark:text-slate-600 shrink-0 w-6 text-right">{formatDateShort(item.publishedAt)}</span>
      <button
        onClick={e => { e.stopPropagation(); setFav(toggleFavorite(item.id)); }}
        className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5 rounded ${fav ? 'opacity-100 text-rose-500' : 'text-gray-300 hover:text-rose-400'}`}
      >
        <svg className="w-3 h-3" fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}

export function CompactList({ items, search = '', onPreview }: { items: TrendItem[]; search?: string; onPreview?: (item: TrendItem) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-50 dark:divide-slate-800/50">
      {items.map(item => (
        <CompactItem
          key={item.id}
          item={item}
          search={search}
          onPreview={onPreview ? () => onPreview(item) : undefined}
        />
      ))}
    </div>
  );
}
