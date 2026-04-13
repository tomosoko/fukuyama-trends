'use client';

const KEY = 'fukuyama-favorites';

export function getFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  if (favs.has(id)) {
    favs.delete(id);
  } else {
    favs.add(id);
  }
  localStorage.setItem(KEY, JSON.stringify([...favs]));
  return favs.has(id);
}
