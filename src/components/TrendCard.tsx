'use client';

import { TrendItem } from '@/lib/types';

const CATEGORY_CONFIG = {
  gourmet:  { label: 'グルメ',    bg: 'bg-orange-50',  text: 'text-orange-600',  dot: 'bg-orange-400' },
  events:   { label: 'イベント',  bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400'   },
  trends:   { label: 'トレンド',  bg: 'bg-violet-50',  text: 'text-violet-600',  dot: 'bg-violet-400' },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'たった今';
    if (diffH < 24) return `${diffH}時間前`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}日前`;
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

async function shareItem(item: TrendItem) {
  if (navigator.share) {
    await navigator.share({ title: item.title, url: item.url || location.href });
  } else if (item.url) {
    await navigator.clipboard.writeText(item.url);
  }
}

export function TrendCard({ item }: { item: TrendItem }) {
  const cfg = CATEGORY_CONFIG[item.category];
  const date = formatDate(item.publishedAt);

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-4 hover:shadow-lg hover:shadow-gray-100 transition-all duration-200">
      {/* ヘッダー行 */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-xs text-gray-400 truncate">{item.source}</span>
        {date && <span className="text-xs text-gray-300 ml-auto shrink-0">{date}</span>}
      </div>

      {/* タイトル */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-gray-700 transition-colors">
        {item.title}
      </h3>

      {/* 概要 */}
      {item.summary && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {item.summary}
        </p>
      )}

      {/* フッター */}
      <div className="flex items-center gap-3">
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            詳細を見る →
          </a>
        )}
        <button
          onClick={() => shareItem(item)}
          className="ml-auto p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
          title="シェア"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </article>
  );
}
