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

export function enrichWithScore(items: TrendItem[]): (TrendItem & { hotScore: number })[] {
  return items.map(item => ({ ...item, hotScore: calcHotScore(item) }));
}
