import Parser from 'rss-parser';
import { TrendItem } from './types';
import { SEARCH_KEYWORDS } from '../data/rss-sources';

const parser = new Parser({ timeout: 8000 });

/** Google News の記事タイトルから発行元を抽出 ("記事名 - 発行元" 形式) */
function extractSource(title: string, fallback: string): { cleanTitle: string; source: string } {
  const match = title.match(/^(.*?)\s+-\s+([^-]+)$/);
  if (match) return { cleanTitle: match[1].trim(), source: match[2].trim() };
  return { cleanTitle: title, source: fallback };
}

async function searchGoogleNews(
  query: string,
  category: TrendItem['category'],
): Promise<TrendItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`;
  try {
    const feed = await parser.parseURL(url);
    const fallbackSource = (feed.title || 'Google News').replace(' - Google ニュース', '').trim();
    const items = (feed.items || []).slice(0, 4).map((item) => {
      const rawTitle = item.title || '';
      const { cleanTitle, source } = extractSource(rawTitle, fallbackSource);
      // URLやタイトルをハッシュとして使いIDを生成（衝突防止）
      const idBase = (item.link || rawTitle).slice(-24).replace(/\W/g, '');
      return {
        id: `news-${category}-${idBase}`,
        title: cleanTitle,
        summary: item.contentSnippet || '',
        url: item.link,
        source,
        category,
        publishedAt: item.pubDate,
      };
    });
    // 「福山」が含まれない記事は除外（広島全域の混入防止）
    return items.filter(it => it.title.includes('福山') || it.summary.includes('福山'));
  } catch {
    return [];
  }
}

export async function fetchWebSearchItems(): Promise<TrendItem[]> {
  const tasks = SEARCH_KEYWORDS.map(({ query, category }) =>
    searchGoogleNews(query, category)
  );

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
