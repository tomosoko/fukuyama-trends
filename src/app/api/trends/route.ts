import { NextResponse } from 'next/server';
import { fetchRssItems } from '@/lib/rss';
import { fetchWebSearchItems } from '@/lib/web-search';
import { enrichWithThumbnails } from '@/lib/og-image';
import { enrichWithScore } from '@/lib/hot-score';
import { getCached, setCached, isStale } from '@/lib/cache';
import { TrendItem } from '@/lib/types';

const TTL = 10 * 60 * 1000; // 10分

async function fetchFresh(): Promise<TrendItem[]> {
  const [rssResult, searchResult] = await Promise.allSettled([
    fetchRssItems(),
    fetchWebSearchItems(),
  ]);

  let all: TrendItem[] = [
    ...(rssResult.status === 'fulfilled' ? rssResult.value : []),
    ...(searchResult.status === 'fulfilled' ? searchResult.value : []),
  ];

  // 日時降順ソート
  all.sort((a, b) => {
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // OG画像を並列取得（上位30件、既存サムネイルはスキップ）
  const top = await enrichWithThumbnails(all.slice(0, 30));
  all = [...top, ...all.slice(30)];

  // ホットスコア付与
  all = enrichWithScore(all);
  return all;
}

let backgroundRefreshing = false;

export async function GET(req: Request) {
  try {
    const bust = new URL(req.url).searchParams.has('bust');
    const cached = getCached<TrendItem[]>('trends');

    if (cached && !bust) {
      // stale-while-revalidate: キャッシュを返しつつバックグラウンドで更新
      if (isStale('trends') && !backgroundRefreshing) {
        backgroundRefreshing = true;
        fetchFresh()
          .then(data => setCached('trends', data, TTL))
          .catch(() => { /* silent */ })
          .finally(() => { backgroundRefreshing = false; });
      }
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const data = await fetchFresh();
    setCached('trends', data, TTL);
    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
  } catch (err) {
    console.error('[/api/trends]', err);
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
