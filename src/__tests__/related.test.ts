import { describe, expect, it } from 'vitest';
import { findRelated } from '@/lib/related';
import { TrendItem } from '@/lib/types';

function makeItem(overrides: Partial<TrendItem> & { id: string; title: string }): TrendItem {
  return {
    url: 'https://example.com',
    source: 'テストソース',
    category: 'trends',
    summary: '',
    ...overrides,
  };
}

// 日本語連続文字はひとつのトークンになるため、スペースで区切って独立したキーワードにする
const ITEMS = [
  makeItem({ id: 'a', title: '花火大会 開催 情報' }),
  makeItem({ id: 'b', title: '花火大会 日程 決定' }),
  makeItem({ id: 'c', title: 'ラーメン 新店 オープン', category: 'gourmet' }),
  makeItem({ id: 'd', title: 'カープ 試合 結果' }),
  makeItem({ id: 'e', title: '花火大会 当日 交通規制' }),
];

describe('findRelated', () => {
  it('共通キーワードが多い記事を返す', () => {
    const result = findRelated(ITEMS[0], ITEMS);
    // 'b'(花火大会) と 'e'(花火大会) が関連
    const ids = result.map(i => i.id);
    expect(ids).toContain('b');
    expect(ids).toContain('e');
  });

  it('自身は含まれない', () => {
    const result = findRelated(ITEMS[0], ITEMS);
    expect(result.map(i => i.id)).not.toContain('a');
  });

  it('共通キーワードなしは含まれない', () => {
    const result = findRelated(ITEMS[0], ITEMS); // 'a'は花火大会
    // 'd'(カープ試合)は共通なし
    expect(result.map(i => i.id)).not.toContain('d');
  });

  it('limitを超える件数は返さない', () => {
    const result = findRelated(ITEMS[0], ITEMS, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('デフォルトlimitは3', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: `x${i}`, title: `花火大会 イベント 情報 ${i}` })
    );
    const result = findRelated(many[0], many);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('空の全記事リストは空配列', () => {
    expect(findRelated(ITEMS[0], [])).toEqual([]);
  });

  it('全記事が自身だけの場合は空配列', () => {
    expect(findRelated(ITEMS[0], [ITEMS[0]])).toEqual([]);
  });

  it('スコアが高い順に返される', () => {
    const items = [
      makeItem({ id: 'base', title: '花火大会 イベント 祭り 開催' }),
      makeItem({ id: 'high', title: '花火大会 イベント 祭り 情報' }), // 3共通
      makeItem({ id: 'low',  title: '花火大会 詳細' }),               // 1共通
    ];
    const result = findRelated(items[0], items);
    expect(result[0].id).toBe('high');
    expect(result[1].id).toBe('low');
  });
});
