import { TrendItem } from './types';

/** タイトルのキーワード共通度でスコアリングして関連記事を返す */
export function findRelated(item: TrendItem, all: TrendItem[], limit = 3): TrendItem[] {
  const words = new Set(item.title.match(/[\u4e00-\u9faf\u3040-\u30ff]{2,}/g) ?? []);
  return all
    .filter(i => i.id !== item.id)
    .map(i => {
      const w = i.title.match(/[\u4e00-\u9faf\u3040-\u30ff]{2,}/g) ?? [];
      const shared = w.filter(x => words.has(x)).length;
      return { item: i, score: shared };
    })
    .filter(({ score }) => score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
