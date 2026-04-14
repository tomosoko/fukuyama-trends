'use client';

import { TrendItem } from '@/lib/types';
import { HOT_THRESHOLD } from '@/lib/hot-score';

const CATEGORY_CONFIG = {
  gourmet: { label: 'グルメ',   emoji: '🍜', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  events:  { label: 'イベント', emoji: '🎪', color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'    },
  trends:  { label: 'トレンド', emoji: '🔥', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
} as const;

const MEDAL = ['🥇', '🥈', '🥉'];

interface RankingSectionProps {
  category: keyof typeof CATEGORY_CONFIG;
  items: TrendItem[];
  onPreview?: (item: TrendItem) => void;
}

function RankingSection({ category, items, onPreview }: RankingSectionProps) {
  const cfg = CATEGORY_CONFIG[category];
  const top = [...items]
    .filter(i => i.category === category)
    .sort((a, b) => (b.hotScore ?? 0) - (a.hotScore ?? 0))
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <div className={`${cfg.bg} rounded-xl p-3`}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-base">{cfg.emoji}</span>
        <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label} ランキング</span>
      </div>
      <div className="space-y-2">
        {top.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onPreview?.(item)}
            className="w-full text-left flex items-start gap-2 group"
          >
            <span className="text-base leading-none mt-0.5 shrink-0">{MEDAL[i]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                {item.source}
                {(item.hotScore ?? 0) >= HOT_THRESHOLD && <span className="text-rose-400">🔥</span>}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CategoryRanking({
  items,
  onPreview,
}: {
  items: TrendItem[];
  onPreview?: (item: TrendItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">カテゴリ別ランキング</span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
      </div>
      <div className="grid gap-3">
        {(['gourmet', 'events', 'trends'] as const).map(cat => (
          <RankingSection key={cat} category={cat} items={items} onPreview={onPreview} />
        ))}
      </div>
    </section>
  );
}
