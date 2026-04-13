import Parser from 'rss-parser';
import { TrendItem } from './types';
import { RSS_SOURCES, RssSource } from '../data/rss-sources';

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'fukuyama-trends/1.0' },
});

async function fetchSource(source: RssSource): Promise<TrendItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 5).map((item, i) => ({
      id: `rss-${source.name}-${i}`,
      title: item.title || '(タイトルなし)',
      summary: item.contentSnippet || item.content || item.summary || '',
      url: item.link,
      source: source.name,
      category: source.category,
      publishedAt: item.pubDate || item.isoDate,
    }));
  } catch {
    return [];
  }
}

export async function fetchRssItems(): Promise<TrendItem[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchSource));
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
