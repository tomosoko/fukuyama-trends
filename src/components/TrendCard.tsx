'use client';

import { TrendItem } from '@/lib/types';

const CATEGORY_LABELS = {
  gourmet: 'グルメ',
  events: 'イベント',
  trends: 'トレンド',
};

const CATEGORY_COLORS = {
  gourmet: 'bg-orange-100 text-orange-700',
  events: 'bg-blue-100 text-blue-700',
  trends: 'bg-purple-100 text-purple-700',
};

export function TrendCard({ item }: { item: TrendItem }) {
  const label = CATEGORY_LABELS[item.category];
  const color = CATEGORY_COLORS[item.category];

  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{label}</span>
        <span className="text-xs text-gray-400">{item.source}</span>
        {date && <span className="text-xs text-gray-400 ml-auto">{date}</span>}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
        {item.title}
      </h3>
      {item.summary && (
        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{item.summary}</p>
      )}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-blue-500 hover:underline"
        >
          詳細を見る →
        </a>
      )}
    </div>
  );
}
