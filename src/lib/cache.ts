interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  staleAt: number; // このタイムスタンプ以降はバックグラウンド更新を試みる
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    staleAt: Date.now() + ttlMs * 0.8, // 80%時点でstale扱い
  });
}

/** キャッシュが存在してもstale期間を過ぎているか */
export function isStale(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return true;
  return Date.now() > entry.staleAt;
}

export function clearCache(key?: string): void {
  if (key) store.delete(key);
  else store.clear();
}
