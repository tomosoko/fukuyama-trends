import { beforeEach, describe, expect, it } from 'vitest';
import { getReadIds, markAsRead, clearReadHistory } from '@/lib/read-history';

beforeEach(() => localStorage.clear());

describe('getReadIds', () => {
  it('空のときは空Setを返す', () => {
    expect(getReadIds().size).toBe(0);
  });
  it('保存済みのIDを返す', () => {
    localStorage.setItem('fukuyama-read', JSON.stringify(['id1', 'id2']));
    const ids = getReadIds();
    expect(ids.has('id1')).toBe(true);
    expect(ids.has('id2')).toBe(true);
  });
  it('不正なJSONは空Setにフォールバック', () => {
    localStorage.setItem('fukuyama-read', 'not-json');
    expect(getReadIds().size).toBe(0);
  });
});

describe('markAsRead', () => {
  it('IDをlocalStorageに保存する', () => {
    markAsRead('article-1');
    expect(getReadIds().has('article-1')).toBe(true);
  });
  it('同じIDを複数回markしても重複しない', () => {
    markAsRead('article-1');
    markAsRead('article-1');
    expect([...getReadIds()].filter(id => id === 'article-1')).toHaveLength(1);
  });
  it('200件超えると古いものが削除される', () => {
    // 201件追加
    for (let i = 0; i < 201; i++) markAsRead(`article-${i}`);
    const ids = getReadIds();
    expect(ids.size).toBe(200);
    // 最初の article-0 は削除されている
    expect(ids.has('article-0')).toBe(false);
    // 最後の article-200 は残っている
    expect(ids.has('article-200')).toBe(true);
  });

  it('markAsReadはstorageイベントを発火する（同タブのlistenerに通知）', () => {
    let fired = false;
    window.addEventListener('storage', () => { fired = true; }, { once: true });
    markAsRead('new-article');
    expect(fired).toBe(true);
  });

  it('既読済みのIDに対しては二度目のstorageイベントを発火しない', () => {
    markAsRead('article-x');
    let count = 0;
    window.addEventListener('storage', () => { count++; });
    markAsRead('article-x'); // 2回目 — 既読済みなのでスキップ
    expect(count).toBe(0);
  });
});

describe('clearReadHistory', () => {
  it('localStorageから履歴を削除する', () => {
    markAsRead('article-1');
    markAsRead('article-2');
    clearReadHistory();
    expect(getReadIds().size).toBe(0);
  });
  it('空の状態でclearしても問題ない', () => {
    expect(() => clearReadHistory()).not.toThrow();
  });
  it('clearReadHistoryはstorageイベントを発火する（カードのisRead状態をリセットさせる）', () => {
    markAsRead('article-1');
    let fired = false;
    window.addEventListener('storage', () => { fired = true; }, { once: true });
    clearReadHistory();
    expect(fired).toBe(true);
  });
});
