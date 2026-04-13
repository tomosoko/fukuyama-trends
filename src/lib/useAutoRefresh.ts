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
    const tick = () => savedCallback.current();
    const id = setInterval(tick, intervalMs);

    // タブがアクティブに戻ったときに即時実行
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
}
