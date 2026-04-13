import Parser from 'rss-parser';
import { TrendItem } from './types';
import { SEARCH_KEYWORDS } from '../data/rss-sources';

const parser = new Parser({ timeout: 8000 });

async function searchGoogleNews(
  query: string,
  category: TrendItem['category'],
): Promise<TrendItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`;
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 3).map((item, i) => ({
      id: `search-${category}-${i}-${Date.now()}`,
      title: item.title || '',
      summary: item.contentSnippet || '',
      url: item.link,
      source: 'Google News',
      category,
      publishedAt: item.pubDate,
    }));
  } catch {
    return [];
  }
}

export async function fetchWebSearchItems(): Promise<TrendItem[]> {
  const tasks: Promise<TrendItem[]>[] = [];

  for (const entries of Object.values(SEARCH_KEYWORDS)) {
    for (const { query, category } of entries) {
      tasks.push(searchGoogleNews(query, category));
    }
  }

  const results = await Promise.allSettled(tasks);
  const all = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));

  // タイトル先頭40字で重複除去
  const seen = new Set<string>();
  return all.filter(item => {
    if (!item.title) return false;
    const key = item.title.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
