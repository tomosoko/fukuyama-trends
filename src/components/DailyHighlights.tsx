'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TrendItem } from '@/lib/types';

const CATS = [
  { key: 'gourmet' as const, label: 'グルメ',   emoji: '🍜', gradient: 'from-orange-500 to-amber-600', badge: 'bg-orange-500' },
  { key: 'events'  as const, label: 'イベント', emoji: '🎪', gradient: 'from-blue-500 to-cyan-600',    badge: 'bg-blue-500'   },
  { key: 'trends'  as const, label: 'トレンド', emoji: '🔥', gradient: 'from-violet-500 to-purple-700', badge: 'bg-violet-500' },
];

function HighlightCard({ item, cfg, onPreview }: {
  item: TrendItem;
  cfg: typeof CATS[0];
  onPreview?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showImg = item.thumbnail && !imgError;

  return (
    <button
      onClick={onPreview}
      className="group block text-left w-full rounded-2xl overflow-hidden relative h-40 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient}`}>
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
        {!showImg && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
            {cfg.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className={`${cfg.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block`}>
          {cfg.emoji} {cfg.label}
        </span>
        <p className="text-white font-bold text-sm leading-snug line-clamp-2">{item.title}</p>
        <p className="text-white/60 text-[10px] mt-0.5">{item.source}</p>
      </div>
    </button>
  );
}

export function DailyHighlights({ items, onPreview }: { items: TrendItem[]; onPreview?: (item: TrendItem) => void }) {
  const highlights = CATS.map(cfg => {
    const catItems = items.filter(i => i.category === cfg.key);
    const top = [...catItems].sort((a, b) => (b.hotScore ?? 0) - (a.hotScore ?? 0))[0];
    return top ? { cfg, item: top } : null;
  }).filter(Boolean) as { cfg: typeof CATS[0]; item: TrendItem }[];

  if (highlights.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">本日のハイライト</span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {highlights.map(({ cfg, item }) => (
          <HighlightCard
            key={cfg.key}
            item={item}
            cfg={cfg}
            onPreview={onPreview ? () => onPreview(item) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
