import { beforeEach, describe, expect, it } from 'vitest';
import { getFavorites, toggleFavorite } from '@/lib/favorites';

beforeEach(() => localStorage.clear());

describe('getFavorites', () => {
  it('空のときは空Setを返す', () => {
    expect(getFavorites().size).toBe(0);
  });
  it('保存済みのIDを返す', () => {
    localStorage.setItem('fukuyama-favorites', JSON.stringify(['id1', 'id2']));
    const favs = getFavorites();
    expect(favs.has('id1')).toBe(true);
    expect(favs.has('id2')).toBe(true);
  });
  it('不正なJSONは空Setにフォールバック', () => {
    localStorage.setItem('fukuyama-favorites', 'broken');
    expect(getFavorites().size).toBe(0);
  });
});

describe('toggleFavorite', () => {
  it('追加するとtrueを返す', () => {
    expect(toggleFavorite('id1')).toBe(true);
  });
  it('追加後にlocalStorageへ保存される', () => {
    toggleFavorite('id1');
    const raw = localStorage.getItem('fukuyama-favorites');
    expect(JSON.parse(raw!)).toContain('id1');
  });
  it('2回呼ぶと削除されfalseを返す', () => {
    toggleFavorite('id1');
    expect(toggleFavorite('id1')).toBe(false);
  });
  it('削除後はlocalStorageから消える', () => {
    toggleFavorite('id1');
    toggleFavorite('id1');
    const raw = localStorage.getItem('fukuyama-favorites');
    expect(JSON.parse(raw!)).not.toContain('id1');
  });
  it('複数IDを独立して管理できる', () => {
    toggleFavorite('id1');
    toggleFavorite('id2');
    expect(getFavorites().has('id1')).toBe(true);
    expect(getFavorites().has('id2')).toBe(true);
    toggleFavorite('id1');
    expect(getFavorites().has('id1')).toBe(false);
    expect(getFavorites().has('id2')).toBe(true);
  });
});
