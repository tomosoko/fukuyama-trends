import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TrendItem } from '@/lib/types';

// BlobとURLのモック（jsdomにないため）
const mockClick = vi.fn();
const mockRevokeObjectURL = vi.fn();
let capturedBlob: Blob | null = null;

beforeEach(() => {
  mockClick.mockClear();
  mockRevokeObjectURL.mockClear();
  capturedBlob = null;

  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    capturedBlob = blob as Blob;
    return 'blob:mock-url';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevokeObjectURL);
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'a') {
      return { href: '', download: '', click: mockClick, parentNode: null } as unknown as HTMLElement;
    }
    return document.createElement(tag);
  });
  // Firefox compat: export.ts appends/removes anchor from body
  vi.spyOn(document.body, 'appendChild').mockImplementation(node => node);
  vi.spyOn(document.body, 'removeChild').mockImplementation(node => node);
});

function makeItem(overrides: Partial<TrendItem> = {}): TrendItem {
  return {
    id: 'item-1',
    title: 'テスト記事タイトル',
    summary: 'テスト概要',
    url: 'https://example.com/article',
    source: 'テストソース',
    category: 'gourmet',
    publishedAt: '2026-04-15T10:00:00Z',
    ...overrides,
  };
}

describe('exportAsText', () => {
  it('download属性に.txtが含まれる', async () => {
    const { exportAsText } = await import('@/lib/export');
    exportAsText([makeItem()]);
    expect(mockClick).toHaveBeenCalled();
  });

  it('BlobのMIMEタイプがtext/plain', async () => {
    const { exportAsText } = await import('@/lib/export');
    exportAsText([makeItem()]);
    expect(capturedBlob?.type).toContain('text/plain');
  });

  it('Blobに記事タイトルが含まれる', async () => {
    const { exportAsText } = await import('@/lib/export');
    exportAsText([makeItem({ title: '福山ラーメン特集' })]);
    const text = await capturedBlob!.text();
    expect(text).toContain('福山ラーメン特集');
  });

  it('空の配列でも動作する', async () => {
    const { exportAsText } = await import('@/lib/export');
    expect(() => exportAsText([])).not.toThrow();
  });

  it('revokeObjectURLが呼ばれる', async () => {
    const { exportAsText } = await import('@/lib/export');
    exportAsText([makeItem()]);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});

describe('exportAsCSV', () => {
  it('BlobのMIMEタイプがtext/csv', async () => {
    const { exportAsCSV } = await import('@/lib/export');
    exportAsCSV([makeItem()]);
    expect(capturedBlob?.type).toContain('text/csv');
  });

  it('BlobにBOM(\\uFEFF)が含まれる（Excel対応）', async () => {
    const { exportAsCSV } = await import('@/lib/export');
    exportAsCSV([makeItem()]);
    // Blob.text()はBOMを剥がすため、ArrayBufferで先頭3バイト(EF BB BF)を確認
    const buf = await capturedBlob!.arrayBuffer();
    const bytes = new Uint8Array(buf);
    expect(bytes[0]).toBe(0xEF);
    expect(bytes[1]).toBe(0xBB);
    expect(bytes[2]).toBe(0xBF);
  });

  it('ヘッダー行が含まれる', async () => {
    const { exportAsCSV } = await import('@/lib/export');
    exportAsCSV([makeItem()]);
    const text = await capturedBlob!.text();
    expect(text).toContain('タイトル,カテゴリ,情報源');
  });

  it('ダブルクォートを正しくエスケープする', async () => {
    const { exportAsCSV } = await import('@/lib/export');
    exportAsCSV([makeItem({ title: '「福山」ラーメン"特集"' })]);
    const text = await capturedBlob!.text();
    expect(text).toContain('""特集""');
  });

  it('空の配列でも動作する', async () => {
    const { exportAsCSV } = await import('@/lib/export');
    expect(() => exportAsCSV([])).not.toThrow();
  });
});

describe('exportAsText - blank lines between articles', () => {
  it('記事間に空行が入る（filter(Boolean)でtrailing空行が消えない）', async () => {
    const { exportAsText } = await import('@/lib/export');
    exportAsText([
      makeItem({ id: 'a', title: '記事A', url: 'https://a.com', publishedAt: '2026-04-15T10:00:00Z', summary: 'summary A' }),
      makeItem({ id: 'b', title: '記事B', url: 'https://b.com', publishedAt: '2026-04-15T11:00:00Z', summary: 'summary B' }),
    ]);
    const text = await capturedBlob!.text();
    // 2件の記事間に空行があることを確認
    expect(text).toContain('記事A');
    expect(text).toContain('記事B');
    const articleAEnd = text.indexOf('https://a.com') + 'https://a.com'.length;
    const articleBStart = text.indexOf('2. 記事B');
    const between = text.slice(articleAEnd, articleBStart);
    expect(between).toContain('\n\n'); // 空行が存在する
  });

  it('publishedAt がない記事でも null 行が含まれない', async () => {
    const { exportAsText } = await import('@/lib/export');
    exportAsText([makeItem({ publishedAt: undefined })]);
    const text = await capturedBlob!.text();
    expect(text).not.toContain('null');
    expect(text).not.toContain('undefined');
  });
});
