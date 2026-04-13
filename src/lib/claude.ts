import Anthropic from '@anthropic-ai/sdk';
import { TrendItem, AISummary } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateSummary(items: TrendItem[]): Promise<AISummary> {
  if (items.length === 0) {
    return { highlight: '情報を取得できませんでした。', items: [] };
  }

  const itemsText = items
    .slice(0, 20)
    .map(i => `[${i.category}] ${i.title}: ${i.summary.slice(0, 100)}`)
    .join('\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `以下は福山市の最新情報です。今注目すべきことを日本語で簡潔にまとめてください。

${itemsText}

以下のJSON形式で返してください（マークダウンなし、JSONのみ）:
{
  "highlight": "今週の福山を一言で表す文章（50文字以内）",
  "items": [
    { "category": "グルメ", "text": "注目ポイント（60文字以内）" },
    { "category": "イベント", "text": "注目ポイント（60文字以内）" },
    { "category": "トレンド", "text": "注目ポイント（60文字以内）" }
  ]
}`,
      },
    ],
  });

  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return JSON.parse(text) as AISummary;
  } catch {
    return {
      highlight: '福山の最新情報をお届けします',
      items: [
        { category: 'グルメ', text: '人気店の情報をチェック' },
        { category: 'イベント', text: '今週のイベント情報' },
        { category: 'トレンド', text: 'SNSで話題のスポット' },
      ],
    };
  }
}
