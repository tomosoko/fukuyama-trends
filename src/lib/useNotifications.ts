'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { TrendItem } from './types';
import { HOT_THRESHOLD } from './hot-score';

export function useNotifications(items: TrendItem[]) {
  const notifiedIds = useRef<Set<string>>(new Set());
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (permission !== 'granted') return;

    // HOTな新着記事で未通知のものを通知
    const hotNew = items.filter(item => {
      if (notifiedIds.current.has(item.id)) return false;
      if ((item.hotScore ?? 0) < HOT_THRESHOLD) return false;
      if (!item.publishedAt) return false;
      const diffH = (Date.now() - new Date(item.publishedAt).getTime()) / 3600000;
      return diffH < 3; // 3時間以内のHOT記事のみ
    });

    hotNew.forEach(item => {
      notifiedIds.current.add(item.id);
      try {
        const n = new Notification('🔥 福山HOT情報', {
          body: item.title,
          icon: '/favicon.ico',
          tag: item.id,
          badge: '/favicon.ico',
        });
        if (item.url) {
          n.onclick = () => { window.open(item.url, '_blank'); n.close(); };
        }
      } catch { /* ignore */ }
    });
  }, [items, permission]);

  return { requestPermission, permission };
}
