import { NextResponse } from 'next/server';
import { fetchRssItems } from '@/lib/rss';
import { fetchWebSearchItems } from '@/lib/web-search';
import { getCached, setCached } from '@/lib/cache';
import { TrendItem } from '@/lib/types';

const TTL = 10 * 60 * 1000; // 10分

export async function GET() {
  const cached = getCached<TrendItem[]>('trends');
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  const [rssItems, searchItems] = await Promise.allSettled([
    fetchRssItems(),
    fetchWebSearchItems(),
  ]);

  const all = [
    ...(rssItems.status === 'fulfilled' ? rssItems.value : []),
    ...(searchItems.status === 'fulfilled' ? searchItems.value : []),
  ];

  setCached('trends', all, TTL);
  return NextResponse.json(all, { headers: { 'X-Cache': 'MISS' } });
}
