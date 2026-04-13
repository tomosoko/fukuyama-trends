'use client';

import { TrendItem } from '@/lib/types';

const EMOJI: Record<TrendItem['category'], string> = {
  gourmet: '🍜',
  events: '🎪',
  trends: '🔥',
};

const GRAD: Record<TrendItem['category'], string> = {
  gourmet: 'from-orange-400 to-amber-500',
  events:  'from-blue-400 to-cyan-500',
  trends:  'from-violet-400 to-purple-600',
};

export function TopPicks({ items }: { items: TrendItem[] }) {
  if (items.length === 0) return null;
  const picks = items.slice(0, 5);

  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-0.5">
        ✦ 注目ピックス
      </h2>
      <div className="scroll-x flex gap-3 pb-2 -mx-4 px-4">
        {picks.map((item, i) => (
          <a
            key={item.id}
            href={item.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-52 rounded-2xl overflow-hidden shadow-md shadow-gray-200/60 hover:shadow-xl hover:shadow-gray-200/80 hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* グラデーションヘッダー */}
            <div className={`bg-gradient-to-br ${GRAD[item.category]} p-4 pb-3`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{EMOJI[item.category]}</span>
                <span className="text-white/80 text-xs font-bold">#{i + 1}</span>
              </div>
            </div>
            {/* コンテンツ */}
            <div className="bg-white dark:bg-slate-800 p-3">
              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 line-clamp-3 leading-snug mb-1.5">
                {item.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{item.source}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
