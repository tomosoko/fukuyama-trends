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
  const items = allItems.filter(i => i.category === cat).slice(0, 15);

  if (items.length === 0) {
    const fallback: AISummary = {
      highlight: `${LABELS[cat]}の情報を収集中です`,
      items: [{ category: LABELS[cat], text: '最新情報をお待ちください' }],
    };
    return NextResponse.json(fallback);
  }

  try {
    const now = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    const itemsText = items
      .map((i, idx) => `${idx + 1}. ${i.title}${i.summary ? `\n   → ${i.summary.slice(0, 100)}` : ''}`)
      .join('\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `あなたは福山市（広島県）の地域情報キュレーターです。${now}時点の「${LABELS[cat]}」情報を分析し、市民に最も役立つポイントをまとめてください。

【${LABELS[cat]}情報一覧】
${itemsText}

以下のJSON形式のみで返答してください（前後にマークダウンや説明文を一切含めないこと）:
{
  "highlight": "${LABELS[cat]}の今の注目ポイント（具体的な名称・場所を含む、40文字以内）",
  "items": [
    { "category": "注目1", "text": "具体的な情報（店名・場所・日程を含む、65文字以内）" },
    { "category": "注目2", "text": "具体的な情報（65文字以内）" }
  ]
}`,
      }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
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
