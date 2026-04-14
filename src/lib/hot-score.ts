import { TrendItem } from './types';

/**
 * ホットスコア算出
 * - 新着度: 24時間以内 +50, 3日以内 +30, 7日以内 +10
 * - サムネイル有 +20（注目度が高い記事は画像が多い）
 * - gourmet/events は trendsより少し重み付け
 */
export function calcHotScore(item: TrendItem): number {
  let score = 0;

  if (item.publishedAt) {
    const diffH = (Date.now() - new Date(item.publishedAt).getTime()) / 3600000;
    if (diffH < 6) score += 60;
    else if (diffH < 24) score += 50;
    else if (diffH < 72) score += 30;
    else if (diffH < 168) score += 10;
  }

  if (item.thumbnail) score += 20;

  const categoryBonus: Record<TrendItem['category'], number> = {
    gourmet: 5,
    events: 8,
    trends: 0,
  };
  score += categoryBonus[item.category];

  return score;
}

/** HOTバッジを表示する閾値 */
export const HOT_THRESHOLD = 50;

/** キーワード共通性から「話題度ボーナス」を計算（同じ単語が複数の記事に出てくる = トレンド） */
function buildTrendBonus(items: TrendItem[]): Map<string, number> {
  const wordCount = new Map<string, number>();
  for (const item of items) {
    // タイトルから2文字以上の日本語・英単語を抽出
    const words = item.title.match(/[\u4e00-\u9faf\u3040-\u30ff\w]{2,}/g) ?? [];
    const unique = new Set(words);
    unique.forEach(w => wordCount.set(w, (wordCount.get(w) ?? 0) + 1));
  }
  // 各記事のトレンドボーナス = 含む単語のうち3回以上出現するものの数 × 4
  const bonus = new Map<string, number>();
  for (const item of items) {
    const words = new Set(item.title.match(/[\u4e00-\u9faf\u3040-\u30ff\w]{2,}/g) ?? []);
    const hot = [...words].filter(w => (wordCount.get(w) ?? 0) >= 3).length;
    bonus.set(item.id, Math.min(hot * 4, 16)); // 最大 +16
  }
  return bonus;
}

export function enrichWithScore(items: TrendItem[]): (TrendItem & { hotScore: number })[] {
  const trendBonus = buildTrendBonus(items);
  return items.map(item => ({
    ...item,
    hotScore: calcHotScore(item) + (trendBonus.get(item.id) ?? 0),
  }));
}
