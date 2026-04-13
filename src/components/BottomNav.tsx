'use client';

import { Category } from '@/lib/types';

const NAV_ITEMS: { value: Category; label: string; emoji: string }[] = [
  { value: 'all',     label: '全部',     emoji: '✦' },
  { value: 'gourmet', label: 'グルメ',   emoji: '🍜' },
  { value: 'events',  label: 'イベント', emoji: '🎪' },
  { value: 'trends',  label: 'トレンド', emoji: '🔥' },
];

export function BottomNav({
  active,
  onChange,
  counts,
}: {
  active: Category;
  onChange: (c: Category) => void;
  counts: Record<Category, number>;
}) {
  return (
    <nav aria-label="カテゴリナビゲーション" className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 safe-area-inset-bottom">
      <div className="flex">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.value;
          const count = counts[item.value];
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span>{item.label}</span>
              {count > 0 && (
                <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-blue-400 dark:text-blue-500' : 'text-gray-300 dark:text-slate-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
