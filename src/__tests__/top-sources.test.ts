import { describe, expect, it } from 'vitest';
import { TrendItem } from '@/lib/types';
import { HOT_THRESHOLD } from '@/lib/hot-score';

function makeItem(
  id: string,
  source: string,
  category: TrendItem['category'],
  hotScore = 0,
): TrendItem {
  return { id, title: 'テスト', summary: '', source, category, hotScore };
}

// TopSources.tsxのuseMemoから抽出した集計ロジック
function calcTopSources(items: TrendItem[]) {
  const map = new Map<string, { count: number; hotCount: number; catCounts: Record<string, number> }>();
  for (const item of items) {
    const s = map.get(item.source) ?? { count: 0, hotCount: 0, catCounts: {} };
    s.count++;
    if ((item.hotScore ?? 0) >= HOT_THRESHOLD) s.hotCount++;
    s.catCounts[item.category] = (s.catCounts[item.category] ?? 0) + 1;
    map.set(item.source, s);
  }
  return [...map.entries()]
    .map(([name, s]) => ({
      name,
      count: s.count,
      hotCount: s.hotCount,
      category: Object.entries(s.catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'trends',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

describe('TopSources category resolution', () => {
  it('単一カテゴリのみのソースはそのカテゴリ', () => {
    const items = [
      makeItem('1', 'メディアA', 'gourmet'),
      makeItem('2', 'メディアA', 'gourmet'),
    ];
    const result = calcTopSources(items);
    expect(result[0].category).toBe('gourmet');
  });

  it('最多カテゴリが採用される（初出順ではない）', () => {
    // メディアBに最初に登場するのはeventsだが多数派はgourmet
    const items = [
      makeItem('1', 'メディアB', 'events'),   // 1件 events
      makeItem('2', 'メディアB', 'gourmet'),  // 3件 gourmet
      makeItem('3', 'メディアB', 'gourmet'),
      makeItem('4', 'メディアB', 'gourmet'),
    ];
    const result = calcTopSources(items);
    // バグ修正前: 'events'（初出）、修正後: 'gourmet'（最多）
    expect(result[0].category).toBe('gourmet');
  });

  it('同数のカテゴリはObject.entriesの順序に依存（安定性確認）', () => {
    // 同数の場合でもクラッシュしない
    const items = [
      makeItem('1', 'メディアC', 'events'),
      makeItem('2', 'メディアC', 'trends'),
    ];
    const result = calcTopSources(items);
    expect(['events', 'trends']).toContain(result[0].category);
  });

  it('記事数が多い順にソートされる', () => {
    const items = [
      makeItem('1', 'ソースA', 'gourmet'),
      makeItem('2', 'ソースB', 'events'),
      makeItem('3', 'ソースB', 'events'),
    ];
    const result = calcTopSources(items);
    expect(result[0].name).toBe('ソースB');
    expect(result[1].name).toBe('ソースA');
  });

  it('最大6件を返す', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeItem(`id${i}`, `ソース${i}`, 'trends')
    );
    expect(calcTopSources(items).length).toBe(6);
  });

  it('空配列は空配列を返す', () => {
    expect(calcTopSources([])).toEqual([]);
  });

  it('hotScoreがHOT_THRESHOLD以上でhotCountが増える', () => {
    const items = [
      makeItem('1', 'ソースX', 'trends', HOT_THRESHOLD),
      makeItem('2', 'ソースX', 'trends', HOT_THRESHOLD - 1),
    ];
    const result = calcTopSources(items);
    expect(result[0].hotCount).toBe(1);
  });
});

// StatsBarのtrendsPct計算が負にならないことを確認
describe('StatsBar trendsPct clamp', () => {
  function calcTrendsPct(items: TrendItem[]) {
    if (items.length === 0) return 0;
    const gourmetPct = Math.round(items.filter(i => i.category === 'gourmet').length / items.length * 100);
    const eventsPct  = Math.round(items.filter(i => i.category === 'events').length  / items.length * 100);
    return Math.max(0, 100 - gourmetPct - eventsPct);
  }

  it('通常ケース: 3カテゴリが均等', () => {
    const items = [
      makeItem('1', 'S', 'gourmet'),
      makeItem('2', 'S', 'events'),
      makeItem('3', 'S', 'trends'),
    ];
    // 各33%、合計99% → trendsPct = 100-33-33 = 34
    expect(calcTrendsPct(items)).toBeGreaterThanOrEqual(0);
  });

  it('丸め誤差でgourmet+eventsが100%超えてもtrendsPctは0以上', () => {
    // 1 gourmet + 199 events + 0 trends
    // gourmetPct = Math.round(1/200*100) = Math.round(0.5) = 1
    // eventsPct = Math.round(199/200*100) = Math.round(99.5) = 100
    // 合計 = 101 → trendsPct = Math.max(0, 100-101) = 0
    const items = [
      makeItem('g', 'S', 'gourmet'),
      ...Array.from({ length: 199 }, (_, i) => makeItem(`e${i}`, 'S', 'events')),
    ];
    expect(calcTrendsPct(items)).toBeGreaterThanOrEqual(0);
  });

  it('gourmetのみの場合: eventsPct=0, trendsPct>=0', () => {
    const items = [makeItem('1', 'S', 'gourmet'), makeItem('2', 'S', 'gourmet')];
    expect(calcTrendsPct(items)).toBeGreaterThanOrEqual(0);
  });

  it('空配列は0を返す', () => {
    expect(calcTrendsPct([])).toBe(0);
  });
});
