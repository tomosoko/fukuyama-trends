'use client';

import { TrendItem } from '@/lib/types';
import { useMemo } from 'react';

// 日本語キーワード抽出 + 頻度カウント
function extractKeywords(items: TrendItem[]): { word: string; count: number }[] {
  const stopWords = new Set([
    '福山', '広島', '市内', '市', '年', '月', '日', '時', '分', '円', '万', '億',
    'こと', 'もの', 'ため', 'から', 'まで', 'での', 'にて', 'でも', 'との',
    'による', 'おいて', '以上', '以下', '以内', '現在', '今年', '来年', '先週',
    'について', 'に関する', 'において', 'Google', 'News',
  ]);

  const wordCount = new Map<string, number>();

  for (const item of items) {
    // 2〜8文字の日本語を抽出（漢字・ひらがな・カタカナ）
    const matches = item.title.match(/[\u4e00-\u9faf\u3040-\u30ff]{2,8}/g) ?? [];
    const unique = new Set(matches);
    unique.forEach(w => {
      if (!stopWords.has(w) && w.length >= 2) {
        wordCount.set(w, (wordCount.get(w) ?? 0) + 1);
      }
    });
  }

  return [...wordCount.entries()]
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 16)
    .map(([word, count]) => ({ word, count }));
}

export function TrendingKeywords({
  items,
  onSearch,
}: {
  items: TrendItem[];
  onSearch: (keyword: string) => void;
}) {
  const keywords = useMemo(() => extractKeywords(items), [items]);
  if (keywords.length === 0) return null;

  const maxCount = keywords[0]?.count ?? 1;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">話題のキーワード</span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map(({ word, count }) => {
          const size = count / maxCount; // 0〜1
          return (
            <button
              key={word}
              onClick={() => onSearch(word)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm
                ${size > 0.7
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                  : size > 0.4
                  ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                }
              `}
            >
              {word}
              {count >= 4 && <span className="ml-1 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
