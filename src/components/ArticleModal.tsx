'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { TrendItem } from '@/lib/types';
import { HOT_THRESHOLD } from '@/lib/hot-score';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { markAsRead } from '@/lib/read-history';
import { getReadLater, toggleReadLater } from '@/lib/read-later';
import { findRelated } from '@/lib/related';
import { showToast } from './Toast';

const CATEGORY_CONFIG = {
  gourmet: { label: 'グルメ',   emoji: '🍜', gradient: 'from-orange-400 to-amber-500', color: 'bg-orange-500' },
  events:  { label: 'イベント', emoji: '🎪', gradient: 'from-blue-400 to-cyan-500',    color: 'bg-blue-500'   },
  trends:  { label: 'トレンド', emoji: '🔥', gradient: 'from-violet-400 to-purple-600', color: 'bg-violet-500' },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  } catch { return null; }
}


interface ArticleModalProps {
  item: TrendItem | null;
  allItems?: TrendItem[];
  onClose: () => void;
  onNavigate?: (item: TrendItem) => void;
}

function readingTimeMin(text: string): number {
  const chars = text.replace(/\s/g, '').length;
  return Math.max(1, Math.round(chars / 400)); // 日本語: ~400字/分
}

export function ArticleModal({ item, allItems = [], onClose, onNavigate }: ArticleModalProps) {
  const [fav, setFav] = useState(false);
  const [readLater, setReadLater] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    setImgError(false);
    setScrollPct(0);
    setFav(getFavorites().has(item.id));
    setReadLater(getReadLater().has(item.id));
    markAsRead(item.id);
  }, [item]);

  // スクロール進捗
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !item) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setScrollPct(max > 0 ? Math.min(100, Math.round((scrollTop / max) * 100)) : 100);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [item]);

  const related = item ? findRelated(item, allItems) : [];

  // キーボード操作（Esc: 閉じる、←→: 関連記事ナビ）
  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (!onNavigate) return;
      const related = findRelated(item, allItems);
      if (e.key === 'ArrowRight' && related[0]) onNavigate(related[0]);
      if (e.key === 'ArrowLeft'  && related[1]) onNavigate(related[1]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [item, allItems, onClose, onNavigate]);

  // 開いている間はスクロール無効
  useEffect(() => {
    if (item) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  if (!item) return null;

  const cfg = CATEGORY_CONFIG[item.category];
  const date = formatDate(item.publishedAt);
  const isHot = (item.hotScore ?? 0) >= HOT_THRESHOLD;
  const showImg = item.thumbnail && !imgError;
  const readMin = readingTimeMin((item.summary ?? '') + item.title);

  const handleFav = () => setFav(toggleFavorite(item.id));
  const handleReadLater = () => {
    const next = toggleReadLater(item.id);
    setReadLater(next);
    if (next) showToast('あとで読むに追加しました', 'success');
  };
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: item.url || location.href });
      } else if (item.url) {
        await navigator.clipboard.writeText(item.url);
        showToast('URLをコピーしました');
      }
    } catch { /* キャンセル等は無視 */ }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="bg-white dark:bg-slate-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={e => {
          if (touchStartY.current === null) return;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          if (dy > 80) onClose();
          touchStartY.current = null;
        }}
      >
        {/* ドラッグハンドル（モバイル） */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-gray-200 dark:bg-slate-600 rounded-full" />
        </div>
        {/* 読書進捗バー */}
        <div className="h-0.5 bg-gray-100 dark:bg-slate-700 shrink-0">
          <div
            className="h-full bg-blue-500 transition-all duration-150"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
        {/* 画像エリア */}
        <div className={`relative h-48 bg-gradient-to-br ${cfg.gradient} shrink-0`}>
          {showImg && (
            <Image
              src={item.thumbnail!}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImgError(true)}
            />
          )}
          {!showImg && (
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20">
              {cfg.emoji}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* バッジ */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className={`${cfg.color} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
              {cfg.emoji} {cfg.label}
            </span>
            {isHot && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">🔥 HOT</span>
            )}
          </div>
        </div>

        {/* コンテンツ */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 p-5">
          {/* メタ情報 */}
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 mb-3">
            <span className="font-medium text-gray-600 dark:text-slate-300">{item.source}</span>
            {date && <><span>·</span><span>{date}</span></>}
            <span>·</span>
            <span>約{readMin}分</span>
            {item.hotScore !== undefined && (
              <span className="ml-auto text-[11px] bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                HOT {item.hotScore}
              </span>
            )}
          </div>

          {/* タイトル */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 leading-snug mb-3">
            {item.title}
          </h2>

          {/* サマリー */}
          {item.summary && (
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
              {item.summary}
            </p>
          )}

          {/* 関連記事 */}
          {related.length > 0 && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">
                関連記事
              </p>
              <div className="space-y-2">
                {related.map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => onNavigate?.(rel)}
                    className="w-full text-left flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className={`w-1.5 rounded-full self-stretch shrink-0 bg-${rel.category === 'gourmet' ? 'orange' : rel.category === 'events' ? 'blue' : 'violet'}-400`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rel.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{rel.source}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* アクションバー */}
        <div className="border-t border-gray-100 dark:border-slate-700 p-4 flex gap-3 shrink-0">
          <button
            onClick={handleFav}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              fav
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-rose-500'
            }`}
          >
            <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {fav ? 'お気に入り済み' : 'お気に入り'}
          </button>
          <button
            onClick={handleReadLater}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              readLater
                ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-500'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-sky-500'
            }`}
            title="あとで読む"
          >
            <svg className="w-4 h-4" fill={readLater ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="hidden sm:inline">{readLater ? '保存済み' : 'あとで'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-blue-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            シェア
          </button>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              記事を読む
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
