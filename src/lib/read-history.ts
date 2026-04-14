'use client';

const KEY = 'fukuyama-read';
export const READ_STORAGE_KEY = KEY;
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
  if (ids.has(id)) return; // 既読済みなら何もしない（storageイベントも不要）
  ids.add(id);
  // 最大200件で古いものは消す（SetはFIFOではないので配列で管理）
  const arr = [...ids];
  if (arr.length > MAX) arr.splice(0, arr.length - MAX);
  localStorage.setItem(KEY, JSON.stringify(arr));
  // 同タブのlistenerにも通知
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
}

export function clearReadHistory(): void {
  localStorage.removeItem(KEY);
}
