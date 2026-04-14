'use client';

import { useEffect, useRef, RefObject } from 'react';

interface Options {
  searchRef: RefObject<HTMLInputElement | null>;
  onRefresh: () => void;
  onToggleDark: () => void;
  onHelp?: () => void;
}

export function useKeyboard({ searchRef, onRefresh, onToggleDark, onHelp }: Options) {
  // callbackをrefで保持し、ハンドラを再登録せずに最新値を呼ぶ
  const onRefreshRef = useRef(onRefresh);
  const onToggleDarkRef = useRef(onToggleDark);
  const onHelpRef = useRef(onHelp);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);
  useEffect(() => { onToggleDarkRef.current = onToggleDark; }, [onToggleDark]);
  useEffect(() => { onHelpRef.current = onHelp; }, [onHelp]);

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
        onRefreshRef.current();
        return;
      }

      // d → ダークモード切替
      if (e.key === 'd' && !isEditing && !e.metaKey && !e.ctrlKey) {
        onToggleDarkRef.current();
        return;
      }

      // ? → ヘルプ
      if (e.key === '?' && !isEditing) {
        e.preventDefault();
        onHelpRef.current?.();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchRef]); // searchRefのみ依存（stable ref）
}
