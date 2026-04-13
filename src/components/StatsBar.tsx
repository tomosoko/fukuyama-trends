'use client';

import { TrendItem } from '@/lib/types';
import { HOT_THRESHOLD } from '@/lib/hot-score';
import { getReadIds } from '@/lib/read-history';
import { useState, useEffect } from 'react';

export function StatsBar({ items, updatedAt }: { items: TrendItem[]; updatedAt: Date | null }) {
  const [readCount, setReadCount] = useState(0);

  useEffect(() => {
    const ids = getReadIds();
    setReadCount(items.filter(i => ids.has(i.id)).length);
  }, [items]);

  if (items.length === 0) return null;

  const rssCount    = items.filter(i => i.source !== 'Google News').length;
  const newsCount   = items.filter(i => i.source === 'Google News').length;
  const sourceCount = new Set(items.map(i => i.source)).size;
  const hotCount    = items.filter(i => (i.hotScore ?? 0) >= HOT_THRESHOLD).length;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-xs text-gray-400 dark:text-slate-500 overflow-x-auto scroll-x">
      <span className="shrink-0 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
        {items.length} 件
      </span>
      <span className="text-gray-200 dark:text-slate-700">|</span>
      <span className="shrink-0">RSS {rssCount}</span>
      <span className="shrink-0">News {newsCount}</span>
      <span className="shrink-0">{sourceCount} メディア</span>
      {hotCount > 0 && (
        <>
          <span className="text-gray-200 dark:text-slate-700">|</span>
          <span className="shrink-0 text-rose-400 font-medium">🔥 {hotCount} HOT</span>
        </>
      )}
      {readCount > 0 && (
        <>
          <span className="text-gray-200 dark:text-slate-700">|</span>
          <span className="shrink-0">既読 {readCount}</span>
        </>
      )}
      {updatedAt && (
        <>
          <span className="text-gray-200 dark:text-slate-700">|</span>
          <span className="shrink-0 ml-auto">
            {updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 更新
          </span>
        </>
      )}
    </div>
  );
}
