import { describe, it, expect } from 'vitest';
import { TrendItem } from '@/lib/types';

function makeItem(id: string, source: string, category: TrendItem['category'] = 'gourmet'): TrendItem {
  return { id, title: 'テスト', summary: '', source, category };
}

// StatsBarのnewsCount/rssCountロジックを抽出して単体テスト
function calcCounts(items: TrendItem[]) {
  const rssCount  = items.filter(i => !i.id.startsWith('news-')).length;
  const newsCount = items.filter(i => i.id.startsWith('news-')).length;
  return { rssCount, newsCount };
}

describe('StatsBar newsCount / rssCount (IDプレフィックス判定)', () => {
  it('news- プレフィックスのアイテムがnewsCountに入る', () => {
    const items = [
      makeItem('news-gourmet-abc123', '中国新聞'),
      makeItem('news-events-xyz456', 'RCC'),
      makeItem('rss-福山市公式-abc', '福山市'),
    ];
    const { rssCount, newsCount } = calcCounts(items);
    expect(newsCount).toBe(2);
    expect(rssCount).toBe(1);
  });

  it('sourceが "Google News" でも正しく判定される', () => {
    // web-searchのアイテムはsource = 発行元名 (例: "中国新聞") で "Google News" ではない
    // IDプレフィックスで判定することで正しくカウントできる
    const items = [
      makeItem('news-trends-abc', '中国新聞'),   // Google News由来
      makeItem('news-trends-def', 'Google News'), // fallback sourceでも news- プレフィックスで判定
    ];
    const { newsCount, rssCount } = calcCounts(items);
    expect(newsCount).toBe(2);
    expect(rssCount).toBe(0);
  });

  it('全RSSの場合newsCount=0', () => {
    const items = [
      makeItem('rss-src1-abc', '福山市'),
      makeItem('rss-src2-def', '広島市'),
    ];
    const { newsCount, rssCount } = calcCounts(items);
    expect(newsCount).toBe(0);
    expect(rssCount).toBe(2);
  });

  it('空配列でもエラーなし', () => {
    const { newsCount, rssCount } = calcCounts([]);
    expect(newsCount).toBe(0);
    expect(rssCount).toBe(0);
  });
});
