'use client';

import { TrendItem } from '@/lib/types';
import { useMemo, useState, useEffect, useRef } from 'react';

// よく検索されそうなキーワードを記事タイトルから動的抽出
function extractSuggestions(items: TrendItem[], query: string): string[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();

  const matched = new Set<string>();
  // タイトルから部分一致する単語を抽出
  for (const item of items) {
    const words = item.title.match(/[\u4e00-\u9faf\u3040-\u30ff\w\s]{2,}/g) ?? [];
    for (const word of words) {
      const w = word.trim();
      if (w.toLowerCase().includes(q) && w !== query && w.length >= 2 && w.length <= 12) {
        matched.add(w);
      }
    }
    // タイトル全体も候補に
    if (item.title.toLowerCase().includes(q) && item.title.length <= 30) {
      matched.add(item.title.replace(/ - .+$/, '').trim()); // source suffix除去
    }
  }

  return [...matched].slice(0, 6);
}

interface SearchSuggestionsProps {
  query: string;
  items: TrendItem[];
  onSelect: (keyword: string) => void;
  visible: boolean;
}

export function SearchSuggestions({ query, items, onSelect, visible }: SearchSuggestionsProps) {
  const suggestions = useMemo(() => extractSuggestions(items, query), [items, query]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeIndexRef = useRef(activeIndex);
  const suggestionsRef = useRef(suggestions);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { suggestionsRef.current = suggestions; }, [suggestions]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  // クエリが変わったらアクティブインデックスをリセット
  useEffect(() => { setActiveIndex(-1); }, [query]);

  // キーボードナビゲーション — refを使いhandlerを毎render再生成しない
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      const sug = suggestionsRef.current;
      if (sug.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % sug.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i <= 0 ? sug.length - 1 : i - 1));
      } else if (e.key === 'Enter' && activeIndexRef.current >= 0) {
        e.preventDefault();
        onSelectRef.current(sug[activeIndexRef.current]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-30 overflow-hidden">
      {suggestions.map((s, i) => (
        <button
          key={s}
          onMouseDown={e => { e.preventDefault(); onSelect(s); }}
          onMouseEnter={() => setActiveIndex(i)}
          className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 flex items-center gap-3 transition-colors ${
            i === activeIndex
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <span className="truncate">{s}</span>
        </button>
      ))}
    </div>
  );
}
