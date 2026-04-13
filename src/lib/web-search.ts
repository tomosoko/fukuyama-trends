import { TrendItem } from './types';
import { SEARCH_KEYWORDS } from '../data/rss-sources';

type SearchCategory = keyof typeof SEARCH_KEYWORDS;

// DuckDuckGo Instant Answer API（無料・APIキー不要）でキーワード検索の代替として
// Google News RSS を利用してトレンドを取得
import Parser from 'rss-parser';

const parser = new Parser({ timeout: 8000 });

async function searchGoogleNews(query: string, category: SearchCategory): Promise<TrendItem[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=ja&gl=JP&ceid=JP:ja`;

  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 3).map((item, i) => ({
      id: `search-${category}-${query}-${i}`,
      title: item.title || '',
      summary: item.contentSnippet || '',
      url: item.link,
      source: 'Google News',
      category: category as TrendItem['category'],
      publishedAt: item.pubDate,
    }));
  } catch {
    return [];
  }
}

export async function fetchWebSearchItems(): Promise<TrendItem[]> {
  const tasks: Promise<TrendItem[]>[] = [];

  for (const [cat, keywords] of Object.entries(SEARCH_KEYWORDS) as [SearchCategory, string[]][]) {
    for (const kw of keywords) {
      tasks.push(searchGoogleNews(kw, cat));
    }
  }

  const results = await Promise.allSettled(tasks);
  const all = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));

  // 重複除去（タイトルベース）
  const seen = new Set<string>();
  return all.filter(item => {
    const key = item.title.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
