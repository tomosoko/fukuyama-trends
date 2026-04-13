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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-area-inset-bottom">
      <div className="flex">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.value;
          const count = counts[item.value];
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span>{item.label}</span>
              {count > 0 && (
                <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
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
