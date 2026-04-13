import { NextResponse } from 'next/server';
import { fetchRssItems } from '@/lib/rss';
import { fetchWebSearchItems } from '@/lib/web-search';

export async function GET() {
  const [rssItems, searchItems] = await Promise.allSettled([
    fetchRssItems(),
    fetchWebSearchItems(),
  ]);

  const all = [
    ...(rssItems.status === 'fulfilled' ? rssItems.value : []),
    ...(searchItems.status === 'fulfilled' ? searchItems.value : []),
  ];

  return NextResponse.json(all);
}
