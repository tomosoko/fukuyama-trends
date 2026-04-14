'use client';

import { TrendItem } from '@/lib/types';
import { TrendCard } from './TrendCard';

function groupByDate(items: TrendItem[]): { label: string; items: TrendItem[] }[] {
  const map = new Map<string, TrendItem[]>();
  const now = new Date();

  for (const item of items) {
    let label = '日時不明';
    if (item.publishedAt) {
      const d = new Date(item.publishedAt);
      const diffH = (now.getTime() - d.getTime()) / 3600000;
      if (diffH < 6)   label = 'たった今';
      else if (diffH < 24) label = '今日';
      else if (diffH < 48) label = '昨日';
      else if (diffH < 168) {
        label = d.toLocaleDateString('ja-JP', { weekday: 'long' });
      } else {
        label = d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
      }
    }
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  }

  return [...map.entries()].map(([label, items]) => ({ label, items }));
}

export function TimelineView({ items, search, onPreview }: { items: TrendItem[]; search: string; onPreview?: (item: TrendItem) => void }) {
  const groups = groupByDate(items);

  return (
    <div className="space-y-6">
      {groups.map(group => (
        <section key={group.label}>
          {/* 日付ヘッダー */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
            <span className="text-xs text-gray-300 dark:text-slate-600">{group.items.length}件</span>
          </div>
          <div className="ml-3.5 pl-4 border-l-2 border-gray-100 dark:border-slate-800 space-y-3">
            {group.items.map(item => (
              <TrendCard
                key={item.id}
                item={item}
                search={search}
                onPreview={onPreview ? () => onPreview(item) : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
