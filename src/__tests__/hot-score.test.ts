import { describe, expect, it } from 'vitest';
import { calcHotScore, HOT_THRESHOLD, enrichWithScore } from '@/lib/hot-score';
import { TrendItem } from '@/lib/types';

function makeItem(overrides: Partial<TrendItem> = {}): TrendItem {
  return {
    id: 'test-1',
    title: 'テスト記事',
    url: 'https://example.com',
    source: 'テストソース',
    category: 'trends',
    publishedAt: undefined,
    thumbnail: undefined,
    summary: '',
    hotScore: 0,
    ...overrides,
  };
}

describe('calcHotScore', () => {
  it('publishedAtなしはスコア0ベース（カテゴリボーナスのみ）', () => {
    const score = calcHotScore(makeItem({ category: 'trends' }));
    expect(score).toBe(0);
  });

  it('6時間以内は+60', () => {
    const now = new Date(Date.now() - 3 * 3600000).toISOString();
    const score = calcHotScore(makeItem({ publishedAt: now }));
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it('24時間以内（6h超）は+50', () => {
    const now = new Date(Date.now() - 12 * 3600000).toISOString();
    const score = calcHotScore(makeItem({ publishedAt: now }));
    expect(score).toBeGreaterThanOrEqual(50);
    expect(score).toBeLessThan(60);
  });

  it('72時間以内は+30', () => {
    const now = new Date(Date.now() - 48 * 3600000).toISOString();
    const score = calcHotScore(makeItem({ publishedAt: now }));
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThan(50);
  });

  it('168時間以内は+10', () => {
    const now = new Date(Date.now() - 120 * 3600000).toISOString();
    const score = calcHotScore(makeItem({ publishedAt: now }));
    expect(score).toBeGreaterThanOrEqual(10);
    expect(score).toBeLessThan(30);
  });

  it('1週間超はスコアなし', () => {
    const old = new Date(Date.now() - 200 * 3600000).toISOString();
    const score = calcHotScore(makeItem({ publishedAt: old }));
    expect(score).toBe(0);
  });

  it('サムネイルありで+20', () => {
    const score = calcHotScore(makeItem({ thumbnail: 'https://example.com/img.jpg' }));
    expect(score).toBe(20);
  });

  it('eventsカテゴリは+8ボーナス', () => {
    const score = calcHotScore(makeItem({ category: 'events' }));
    expect(score).toBe(8);
  });

  it('gourmetカテゴリは+5ボーナス', () => {
    const score = calcHotScore(makeItem({ category: 'gourmet' }));
    expect(score).toBe(5);
  });

  it('6時間以内 + サムネイル + events = 60+20+8 = 88', () => {
    const now = new Date(Date.now() - 1 * 3600000).toISOString();
    const score = calcHotScore(makeItem({ publishedAt: now, thumbnail: 'img.jpg', category: 'events' }));
    expect(score).toBe(88);
  });
});

describe('HOT_THRESHOLD', () => {
  it('50に設定されている', () => {
    expect(HOT_THRESHOLD).toBe(50);
  });
});

describe('enrichWithScore', () => {
  it('hotScoreプロパティを追加する', () => {
    const items = [makeItem({ id: 'a' }), makeItem({ id: 'b' })];
    const result = enrichWithScore(items);
    expect(result[0]).toHaveProperty('hotScore');
    expect(result[1]).toHaveProperty('hotScore');
  });

  it('同じ単語が3件以上に出てくるとトレンドボーナスがつく', () => {
    const items = [
      makeItem({ id: 'a', title: '福山 花火大会 イベント' }),
      makeItem({ id: 'b', title: '福山 花火大会 開催' }),
      makeItem({ id: 'c', title: '福山 花火大会 詳細' }),
      makeItem({ id: 'd', title: '別の記事' }),
    ];
    const result = enrichWithScore(items);
    const aScore = result.find(r => r.id === 'a')!.hotScore;
    const dScore = result.find(r => r.id === 'd')!.hotScore;
    expect(aScore).toBeGreaterThan(dScore);
  });

  it('トレンドボーナスは最大+16', () => {
    // 多数の共通単語がある場合でも上限16
    const items = Array.from({ length: 5 }, (_, i) => makeItem({
      id: `item${i}`,
      title: '福山 花火 イベント ラーメン カフェ 開催 おすすめ 新着',
    }));
    const result = enrichWithScore(items);
    const bonus = result[0].hotScore - calcHotScore(items[0]);
    expect(bonus).toBeLessThanOrEqual(16);
  });
});
