'use client';

import { Category } from '@/lib/types';

const TABS: { value: Category; label: string; emoji: string }[] = [
  { value: 'all', label: '全部', emoji: '✦' },
  { value: 'gourmet', label: 'グルメ', emoji: '🍜' },
  { value: 'events', label: 'イベント', emoji: '🎪' },
  { value: 'trends', label: 'トレンド', emoji: '🔥' },
];

export function CategoryTabs({
  active,
  onChange,
  counts,
}: {
  active: Category;
  onChange: (c: Category) => void;
  counts: Record<Category, number>;
}) {
  return (
    <div className="flex gap-2 flex-wrap" role="tablist" aria-label="カテゴリ選択">
      {TABS.map(tab => {
        const count = counts[tab.value];
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            role="tab"
          aria-selected={isActive}
          className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 select-none
              ${isActive
                ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 hover:text-gray-900'
              }
            `}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            {count > 0 && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center
                ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
