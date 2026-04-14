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
    return (feed.items || []).slice(0, 5).map((item) => {
      // URLまたはタイトルのハッシュをIDに使う（インデックス不使用でフィード更新後も安定）
      const idBase = item.link
        ? item.link.replace(/[^a-zA-Z0-9]/g, '').slice(-20)
        : (item.title || '').replace(/\s/g, '').slice(0, 20);
      return {
        id: `rss-${source.name.replace(/\s/g, '_')}-${idBase}`,
        title: item.title || '(タイトルなし)',
        summary: item.contentSnippet || item.content || item.summary || '',
        url: item.link,
        source: source.name,
        category: source.category,
        publishedAt: item.pubDate || item.isoDate,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchRssItems(): Promise<TrendItem[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchSource));
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
