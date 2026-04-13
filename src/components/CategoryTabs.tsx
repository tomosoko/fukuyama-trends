'use client';

import { Category } from '@/lib/types';

const TABS: { value: Category; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'gourmet', label: 'グルメ' },
  { value: 'events', label: 'イベント' },
  { value: 'trends', label: 'トレンド' },
];

export function CategoryTabs({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === tab.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
