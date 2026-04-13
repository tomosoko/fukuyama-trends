'use client';

import { useEffect, RefObject } from 'react';

interface Options {
  searchRef: RefObject<HTMLInputElement | null>;
  onRefresh: () => void;
  onToggleDark: () => void;
  onHelp?: () => void;
}

export function useKeyboard({ searchRef, onRefresh, onToggleDark, onHelp }: Options) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // / → 検索フォーカス
      if (e.key === '/' && !isEditing) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      // Esc → 検索クリア＆ブラー
      if (e.key === 'Escape' && isEditing) {
        (e.target as HTMLInputElement).blur();
        return;
      }

      // r → 更新
      if (e.key === 'r' && !isEditing && !e.metaKey && !e.ctrlKey) {
        onRefresh();
        return;
      }

      // d → ダークモード切替
      if (e.key === 'd' && !isEditing && !e.metaKey && !e.ctrlKey) {
        onToggleDark();
        return;
      }

      // ? → ヘルプ
      if (e.key === '?' && !isEditing) {
        e.preventDefault();
        onHelp?.();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchRef, onRefresh, onToggleDark, onHelp]);
}
