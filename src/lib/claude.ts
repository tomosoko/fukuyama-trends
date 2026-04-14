import Anthropic from '@anthropic-ai/sdk';
import { TrendItem, AISummary } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateSummary(items: TrendItem[]): Promise<AISummary> {
  if (items.length === 0) {
    return { highlight: '情報を取得できませんでした。', items: [] };
  }

  const now = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const itemsText = items
    .slice(0, 25)
    .map((i, idx) => `${idx + 1}. [${i.category}] ${i.title}${i.summary ? `\n   → ${i.summary.slice(0, 120)}` : ''}`)
    .join('\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `あなたは福山市（広島県）の地域情報キュレーターです。${now}時点の最新情報を分析し、市民が今日注目すべき情報を的確にまとめてください。

【最新情報一覧】
${itemsText}

以下のJSON形式のみで返答してください（前後にマークダウンや説明文を一切含めないこと）:
{
  "highlight": "今の福山市を端的に表すキャッチコピー（40文字以内、具体的な話題に言及）",
  "items": [
    { "category": "グルメ", "text": "具体的な店名・料理名・エリアを含む注目ポイント（70文字以内）" },
    { "category": "イベント", "text": "日程・場所を含む具体的な注目イベント（70文字以内）" },
    { "category": "トレンド", "text": "SNSや話題のスポット・ニュース（70文字以内）" }
  ]
}`,
      },
    ],
  });

  try {
    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    // マークダウンコードブロックを除去してからパース
    const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
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
