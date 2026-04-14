import { beforeEach, describe, expect, it } from 'vitest';
import { getReadLater, toggleReadLater, isInReadLater } from '@/lib/read-later';

beforeEach(() => localStorage.clear());

describe('getReadLater', () => {
  it('空のときは空Setを返す', () => {
    expect(getReadLater().size).toBe(0);
  });
  it('保存済みのIDを返す', () => {
    localStorage.setItem('fk_read_later', JSON.stringify(['article-1', 'article-2']));
    const set = getReadLater();
    expect(set.has('article-1')).toBe(true);
    expect(set.has('article-2')).toBe(true);
  });
  it('不正なJSONは空Setにフォールバック', () => {
    localStorage.setItem('fk_read_later', '}{broken');
    expect(getReadLater().size).toBe(0);
  });
});

describe('toggleReadLater', () => {
  it('追加するとtrueを返す', () => {
    expect(toggleReadLater('article-1')).toBe(true);
  });
  it('追加後にlocalStorageへ保存される', () => {
    toggleReadLater('article-1');
    expect(JSON.parse(localStorage.getItem('fk_read_later')!)).toContain('article-1');
  });
  it('2回呼ぶと削除されfalseを返す', () => {
    toggleReadLater('article-1');
    expect(toggleReadLater('article-1')).toBe(false);
  });
  it('削除後はlocalStorageから消える', () => {
    toggleReadLater('article-1');
    toggleReadLater('article-1');
    expect(JSON.parse(localStorage.getItem('fk_read_later')!)).not.toContain('article-1');
  });
});

describe('isInReadLater', () => {
  it('追加済みならtrue', () => {
    toggleReadLater('article-x');
    expect(isInReadLater('article-x')).toBe(true);
  });
  it('未追加ならfalse', () => {
    expect(isInReadLater('article-y')).toBe(false);
  });
  it('削除後はfalse', () => {
    toggleReadLater('article-x');
    toggleReadLater('article-x');
    expect(isInReadLater('article-x')).toBe(false);
  });
});
