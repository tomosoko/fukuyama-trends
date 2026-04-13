'use client';

const KEY = 'fukuyama-read';
const MAX = 200;

export function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

export function markAsRead(id: string): void {
  const ids = getReadIds();
  ids.add(id);
  // 最大200件で古いものは消す（SetはFIFOではないので配列で管理）
  const arr = [...ids];
  if (arr.length > MAX) arr.splice(0, arr.length - MAX);
  localStorage.setItem(KEY, JSON.stringify(arr));
}
