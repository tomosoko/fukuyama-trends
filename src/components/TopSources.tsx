'use client';

import { useMemo } from 'react';
import { TrendItem } from '@/lib/types';

interface SourceStat {
  name: string;
  count: number;
  hotCount: number;
  category: string;
}

const HOT_THRESHOLD = 30;

const SOURCE_COLORS: Record<string, string> = {
  gourmet: 'bg-orange-400',
  events:  'bg-blue-400',
  trends:  'bg-violet-400',
};

export function TopSources({ items }: { items: TrendItem[] }) {
  const sources = useMemo<SourceStat[]>(() => {
    const map = new Map<string, SourceStat>();
    for (const item of items) {
      const s = map.get(item.source) ?? { name: item.source, count: 0, hotCount: 0, category: item.category };
      s.count++;
      if ((item.hotScore ?? 0) >= HOT_THRESHOLD) s.hotCount++;
      map.set(item.source, s);
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [items]);

  if (sources.length === 0) return null;

  const max = sources[0].count;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">
        よく登場するメディア
      </p>
      <div className="space-y-2">
        {sources.map((src, i) => (
          <div key={src.name} className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-300 dark:text-slate-600 w-4 shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{src.name}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 ml-2">
                  {src.count}件{src.hotCount > 0 ? ` · 🔥${src.hotCount}` : ''}
                </span>
              </div>
              <div className="h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${SOURCE_COLORS[src.category] ?? 'bg-gray-300'} rounded-full transition-all duration-500`}
                  style={{ width: `${(src.count / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
