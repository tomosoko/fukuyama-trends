'use client';

import { useEffect, useRef } from 'react';

/**
 * 指定間隔でコールバックを実行するフック。
 * タブが非アクティブな間は停止し、アクティブになったら即実行する。
 */
export function useAutoRefresh(callback: () => void, intervalMs: number) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    let lastRunAt = Date.now();
    const tick = () => {
      lastRunAt = Date.now();
      savedCallback.current();
    };
    const id = setInterval(tick, intervalMs);

    // タブがアクティブに戻ったときに即時実行（直前のinterval実行から30s以上経過していれば）
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRunAt > 30_000) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
}
