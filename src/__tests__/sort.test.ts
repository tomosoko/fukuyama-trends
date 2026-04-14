import { describe, expect, it } from 'vitest';
import { TrendItem } from '@/lib/types';

// page.tsx の sortItems ロジックを独立してテスト
function sortItems(items: TrendItem[], order: 'newest' | 'oldest' | 'source'): TrendItem[] {
  return [...items].sort((a, b) => {
    if (order === 'source') return a.source.localeCompare(b.source);
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return order === 'newest' ? tb - ta : ta - tb;
  });
}

function makeItem(id: string, publishedAt: string | undefined, source = 'ソース'): TrendItem {
  return { id, title: id, summary: '', source, category: 'trends', url: undefined, publishedAt };
}

describe('sortItems', () => {
  const items = [
    makeItem('a', '2026-04-10T10:00:00Z', 'Cソース'),
    makeItem('b', '2026-04-15T10:00:00Z', 'Aソース'),
    makeItem('c', '2026-04-01T10:00:00Z', 'Bソース'),
    makeItem('d', undefined,               'Dソース'), // 日時なし
  ];

  it('newest: 新しい順', () => {
    const result = sortItems(items, 'newest');
    expect(result[0].id).toBe('b');
    expect(result[1].id).toBe('a');
    expect(result[2].id).toBe('c');
  });

  it('oldest: 古い順', () => {
    const result = sortItems(items, 'oldest');
    expect(result[0].id).toBe('d'); // publishedAt=undefinedはtimestamp=0なので先頭
    expect(result[1].id).toBe('c');
    expect(result[2].id).toBe('a');
    expect(result[3].id).toBe('b');
  });

  it('source: ソース名順（localeCompare）', () => {
    const result = sortItems(items, 'source');
    // A, B, C, D の順
    expect(result[0].source).toBe('Aソース');
    expect(result[1].source).toBe('Bソース');
    expect(result[2].source).toBe('Cソース');
    expect(result[3].source).toBe('Dソース');
  });

  it('元の配列を変更しない（immutable）', () => {
    const original = [...items];
    sortItems(items, 'oldest');
    expect(items).toEqual(original);
  });

  it('空配列は空配列を返す', () => {
    expect(sortItems([], 'newest')).toEqual([]);
  });

  it('1件は同じ配列を返す', () => {
    const single = [makeItem('only', '2026-01-01T00:00:00Z')];
    expect(sortItems(single, 'newest')).toEqual(single);
  });
});
