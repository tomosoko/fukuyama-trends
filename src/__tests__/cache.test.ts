import { describe, expect, it, vi, afterEach } from 'vitest';
import { getCached, setCached, isStale, clearCache } from '@/lib/cache';

afterEach(() => {
  clearCache();
  vi.useRealTimers();
});

describe('getCached', () => {
  it('存在しないキーはnullを返す', () => {
    expect(getCached('missing')).toBeNull();
  });

  it('セットしたデータを返す', () => {
    setCached('key', { value: 42 }, 60000);
    expect(getCached('key')).toEqual({ value: 42 });
  });

  it('TTL切れはnullを返してキャッシュを削除する', () => {
    vi.useFakeTimers();
    setCached('key', 'data', 1000);
    vi.advanceTimersByTime(1001);
    expect(getCached('key')).toBeNull();
    // 再度取得してもnull
    expect(getCached('key')).toBeNull();
  });

  it('TTL内なら有効なデータを返す', () => {
    vi.useFakeTimers();
    setCached('key', 'valid', 60000);
    vi.advanceTimersByTime(30000);
    expect(getCached('key')).toBe('valid');
  });

  it('配列・オブジェクト型を正しく扱う', () => {
    setCached('arr', [1, 2, 3], 60000);
    expect(getCached<number[]>('arr')).toEqual([1, 2, 3]);
  });
});

describe('isStale', () => {
  it('存在しないキーはstale', () => {
    expect(isStale('missing')).toBe(true);
  });

  it('キャッシュ直後はstaleでない', () => {
    setCached('key', 'data', 60000);
    expect(isStale('key')).toBe(false);
  });

  it('TTLの80%経過後はstale', () => {
    vi.useFakeTimers();
    setCached('key', 'data', 10000); // TTL=10s, staleAt=8s
    vi.advanceTimersByTime(8001);
    expect(isStale('key')).toBe(true);
  });

  it('TTLの79%時点ではstaleでない', () => {
    vi.useFakeTimers();
    setCached('key', 'data', 10000);
    vi.advanceTimersByTime(7900);
    expect(isStale('key')).toBe(false);
  });
});

describe('clearCache', () => {
  it('指定キーのみ削除する', () => {
    setCached('a', 1, 60000);
    setCached('b', 2, 60000);
    clearCache('a');
    expect(getCached('a')).toBeNull();
    expect(getCached<number>('b')).toBe(2);
  });

  it('引数なしで全キャッシュを削除する', () => {
    setCached('a', 1, 60000);
    setCached('b', 2, 60000);
    clearCache();
    expect(getCached('a')).toBeNull();
    expect(getCached('b')).toBeNull();
  });
});

describe('setCached', () => {
  it('同じキーを再セットすると上書きされる', () => {
    setCached('key', 'first', 60000);
    setCached('key', 'second', 60000);
    expect(getCached('key')).toBe('second');
  });

  it('複数キーを独立して管理できる', () => {
    setCached('key1', 'v1', 60000);
    setCached('key2', 'v2', 60000);
    expect(getCached('key1')).toBe('v1');
    expect(getCached('key2')).toBe('v2');
  });
});
