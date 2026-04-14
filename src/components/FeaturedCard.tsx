'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TrendItem } from '@/lib/types';
import { HOT_THRESHOLD } from '@/lib/hot-score';

const CATEGORY_CONFIG = {
  gourmet: { label: 'グルメ',   emoji: '🍜', gradient: 'from-orange-500 to-amber-600' },
  events:  { label: 'イベント', emoji: '🎪', gradient: 'from-blue-500 to-cyan-600'   },
  trends:  { label: 'トレンド', emoji: '🔥', gradient: 'from-violet-500 to-purple-700'},
};

export function FeaturedCard({ item, onPreview }: { item: TrendItem; onPreview?: () => void }) {
  const [imgError, setImgError] = useState(false);
  const cfg = CATEGORY_CONFIG[item.category];
  const showImg = item.thumbnail && !imgError;
  const isHot = (item.hotScore ?? 0) >= HOT_THRESHOLD;

  return (
    <button
      onClick={onPreview}
      className="group block relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 text-left"
    >
      {/* 背景画像 or グラデーション */}
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
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
            {cfg.emoji}
          </div>
        )}
      </div>

      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* バッジ群 */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {cfg.emoji} {cfg.label}
        </span>
        {isHot && (
          <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            🔥 HOT
          </span>
        )}
      </div>
      <span className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">
        注目
      </span>

      {/* テキスト */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xs text-white/60 mb-1.5">{item.source}</p>
        <h2 className="text-white font-bold text-lg leading-snug line-clamp-2 drop-shadow">
          {item.title}
        </h2>
        {item.summary && (
          <p className="text-white/70 text-xs mt-1.5 line-clamp-1">{item.summary}</p>
        )}
      </div>
    </button>
  );
}
