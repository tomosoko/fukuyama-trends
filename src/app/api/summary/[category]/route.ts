import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/cache';
import { TrendItem, AISummary } from '@/lib/types';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const VALID = ['gourmet', 'events', 'trends'] as const;
type ValidCategory = (typeof VALID)[number];

const LABELS: Record<ValidCategory, string> = {
  gourmet: 'グルメ・飲食',
  events: 'イベント・観光',
  trends: 'トレンド・話題',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  if (!VALID.includes(category as ValidCategory)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  const cat = category as ValidCategory;

  const cacheKey = `summary-${cat}`;
  const cached = getCached<AISummary>(cacheKey);
  if (cached) return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });

  const allItems = getCached<TrendItem[]>('trends') ?? [];
  const items = allItems.filter(i => i.category === cat).slice(0, 10);

  if (items.length === 0) {
    const fallback: AISummary = {
      highlight: `${LABELS[cat]}の情報を収集中です`,
      items: [{ category: LABELS[cat], text: '最新情報をお待ちください' }],
    };
    return NextResponse.json(fallback);
  }

  try {
    const itemsText = items
      .map(i => `・${i.title}: ${i.summary.slice(0, 80)}`)
      .join('\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `以下は福山市の「${LABELS[cat]}」情報です。簡潔にまとめてください。

${itemsText}

JSON形式で（マークダウンなし）:
{
  "highlight": "一言まとめ（40文字以内）",
  "items": [
    { "category": "${LABELS[cat]}", "text": "ポイント（50文字以内）" }
  ]
}`,
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const summary = JSON.parse(text) as AISummary;
    setCached(cacheKey, summary, 20 * 60 * 1000);
    return NextResponse.json(summary);
  } catch {
    const fallback: AISummary = {
      highlight: `${LABELS[cat]}の最新情報`,
      items: items.slice(0, 2).map(i => ({ category: LABELS[cat], text: i.title.slice(0, 50) })),
    };
    return NextResponse.json(fallback);
  }
}
