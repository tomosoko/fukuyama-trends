'use client';

import { useMemo } from 'react';
import { TrendItem } from '@/lib/types';

export function HourlyActivity({ items }: { items: TrendItem[] }) {
  const hourly = useMemo(() => {
    const counts = new Array(24).fill(0) as number[];
    for (const item of items) {
      if (!item.publishedAt) continue;
      try {
        const h = new Date(item.publishedAt).getHours();
        counts[h]++;
      } catch { /* skip */ }
    }
    return counts;
  }, [items]);

  const max = Math.max(...hourly, 1);
  const currentHour = new Date().getHours();

  // データが全て0なら表示しない
  if (max === 1 && hourly.every(c => c === 0)) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">
        時間帯別 記事数
      </p>
      <div className="flex items-end gap-0.5 h-12">
        {hourly.map((count, h) => (
          <div
            key={h}
            className="flex-1 flex flex-col items-center gap-0.5 group"
            title={`${h}時: ${count}件`}
          >
            <div
              className={`w-full rounded-sm transition-all duration-500 ${
                h === currentHour
                  ? 'bg-blue-500'
                  : count > 0
                  ? 'bg-gray-300 dark:bg-slate-600 group-hover:bg-blue-300'
                  : 'bg-gray-100 dark:bg-slate-750'
              }`}
              style={{ height: `${Math.max(2, (count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-gray-300 dark:text-slate-600">
        <span>0時</span>
        <span>6時</span>
        <span>12時</span>
        <span>18時</span>
        <span>23時</span>
      </div>
    </div>
  );
}
