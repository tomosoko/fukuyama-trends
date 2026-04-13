import { NextResponse } from 'next/server';
import { fetchRssItems } from '@/lib/rss';
import { fetchWebSearchItems } from '@/lib/web-search';
import { generateSummary } from '@/lib/claude';
import { getCached, setCached } from '@/lib/cache';
import { TrendItem, AISummary } from '@/lib/types';

const TRENDS_TTL = 10 * 60 * 1000;
const SUMMARY_TTL = 30 * 60 * 1000; // 要約は30分キャッシュ

export async function GET() {
  const cachedSummary = getCached<AISummary>('summary');
  if (cachedSummary) {
    return NextResponse.json(cachedSummary, { headers: { 'X-Cache': 'HIT' } });
  }

  let items = getCached<TrendItem[]>('trends');
  if (!items) {
    const [rssItems, searchItems] = await Promise.allSettled([
      fetchRssItems(),
      fetchWebSearchItems(),
    ]);
    items = [
      ...(rssItems.status === 'fulfilled' ? rssItems.value : []),
      ...(searchItems.status === 'fulfilled' ? searchItems.value : []),
    ];
    setCached('trends', items, TRENDS_TTL);
  }

  const summary = await generateSummary(items);
  setCached('summary', summary, SUMMARY_TTL);
  return NextResponse.json(summary, { headers: { 'X-Cache': 'MISS' } });
}
