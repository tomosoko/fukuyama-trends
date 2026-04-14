'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TrendItem } from '@/lib/types';

const CATEGORY_COLORS: Record<TrendItem['category'], string> = {
  gourmet: 'from-orange-500 to-amber-600',
  events:  'from-blue-500 to-cyan-600',
  trends:  'from-violet-500 to-purple-700',
};

const CATEGORY_EMOJI: Record<TrendItem['category'], string> = {
  gourmet: '🍜',
  events:  '🎪',
  trends:  '🔥',
};

function PickCard({ item, rank, onPreview }: { item: TrendItem; rank: number; onPreview?: () => void }) {
  const [imgError, setImgError] = useState(false);
  const showImg = item.thumbnail && !imgError;

  const handleClick = (e: React.MouseEvent) => {
    if (onPreview) { e.preventDefault(); onPreview(); }
  };

  return (
    <a
      href={item.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="shrink-0 w-44 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-800"
    >
      {/* 画像 or グラデーション */}
      <div className={`relative h-28 bg-gradient-to-br ${CATEGORY_COLORS[item.category]}`}>
        {showImg && (
          <Image
            src={item.thumbnail!}
            alt={item.title}
            fill
            className="object-cover"
            unoptimized
            onError={() => setImgError(true)}
          />
        )}
        {!showImg && (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
            {CATEGORY_EMOJI[item.category]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-2 left-2 text-xl">{CATEGORY_EMOJI[item.category]}</span>
        <span className="absolute top-2 right-2 bg-black/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          #{rank}
        </span>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 line-clamp-3 leading-snug">
          {item.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">{item.source}</p>
      </div>
    </a>
  );
}

export function TopPicks({ items, onPreview }: { items: TrendItem[]; onPreview?: (item: TrendItem) => void }) {
  if (items.length === 0) return null;
  const picks = items.slice(0, 5);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">注目ピックス</span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
      </div>
      <div className="scroll-x flex gap-3 -mx-4 px-4 pb-2">
        {picks.map((item, i) => (
          <PickCard key={item.id} item={item} rank={i + 1} onPreview={onPreview ? () => onPreview(item) : undefined} />
        ))}
      </div>
    </section>
  );
}
