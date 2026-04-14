import { NextResponse } from 'next/server';
import { fetchRssItems } from '@/lib/rss';
import { fetchWebSearchItems } from '@/lib/web-search';
import { generateSummary } from '@/lib/claude';
import { getCached, setCached } from '@/lib/cache';
import { TrendItem, AISummary } from '@/lib/types';

const SUMMARY_TTL = 30 * 60 * 1000; // 要約は30分キャッシュ

export async function GET() {
  const cachedSummary = getCached<AISummary>('summary');
  if (cachedSummary) {
    return NextResponse.json(cachedSummary, { headers: { 'X-Cache': 'HIT' } });
  }

  // trendsキャッシュを読み取り専用で使う（summaryルートは'trends'キャッシュに書き込まない）
  // ← 書き込むと OG画像・hotScore未付与の生データで上書きされてしまう
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
    // 注意: ここでは 'trends' キャッシュに書かない。richデータは /api/trends が管理する。
    // summaryはsummaryキャッシュのみ管理する
  }

  try {
    const summary = await generateSummary(items);
    setCached('summary', summary, SUMMARY_TTL);
    return NextResponse.json(summary, { headers: { 'X-Cache': 'MISS' } });
  } catch (err) {
    console.error('[/api/summary]', err);
    const fallback: AISummary = {
      highlight: '福山の最新情報をお届けします',
      items: [
        { category: 'グルメ', text: '人気グルメ情報をチェック' },
        { category: 'イベント', text: '最新イベント情報' },
        { category: 'トレンド', text: '話題のスポット情報' },
      ],
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}
