const KEY = 'fk_read_later';

export function getReadLater(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { return new Set(); }
}

export function toggleReadLater(id: string): boolean {
  const current = getReadLater();
  if (current.has(id)) { current.delete(id); } else { current.add(id); }
  localStorage.setItem(KEY, JSON.stringify([...current]));
  // 同タブのlistenerにも通知（storageイベントは通常クロスタブのみ発火）
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
  return current.has(id);
}

export function isInReadLater(id: string): boolean {
  return getReadLater().has(id);
}
