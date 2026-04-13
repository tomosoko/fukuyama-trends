import { NextResponse } from 'next/server';
import { fetchRssItems } from '@/lib/rss';
import { fetchWebSearchItems } from '@/lib/web-search';
import { getCached, setCached } from '@/lib/cache';
import { TrendItem } from '@/lib/types';

const TTL = 10 * 60 * 1000; // 10分

export async function GET() {
  try {
    const cached = getCached<TrendItem[]>('trends');
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const [rssResult, searchResult] = await Promise.allSettled([
      fetchRssItems(),
      fetchWebSearchItems(),
    ]);

    const all: TrendItem[] = [
      ...(rssResult.status === 'fulfilled' ? rssResult.value : []),
      ...(searchResult.status === 'fulfilled' ? searchResult.value : []),
    ];

    // 日時でソート（新着順）、日時なしは末尾
    all.sort((a, b) => {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    setCached('trends', all, TTL);
    return NextResponse.json(all, { headers: { 'X-Cache': 'MISS' } });
  } catch (err) {
    console.error('[/api/trends]', err);
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
