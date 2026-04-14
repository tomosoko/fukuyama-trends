import { describe, expect, it } from 'vitest';

/**
 * RSSのIDがURLベースで安定していることを確認するテスト
 * （インデックスベースだとフィード更新時にIDがズレてお気に入りが壊れる）
 */

function generateRssId(sourceName: string, url?: string, title?: string): string {
  const idBase = url
    ? url.replace(/[^a-zA-Z0-9]/g, '').slice(-20)
    : (title || '').replace(/\s/g, '').slice(0, 20);
  return `rss-${sourceName.replace(/\s/g, '_')}-${idBase}`;
}

describe('rss ID stability', () => {
  const articleUrl = 'https://www.city.fukuyama.hiroshima.jp/news/12345.html';
  const sourceName = '福山市公式';

  it('同じURLからは常に同じIDが生成される', () => {
    const id1 = generateRssId(sourceName, articleUrl);
    const id2 = generateRssId(sourceName, articleUrl);
    expect(id1).toBe(id2);
  });

  it('フィード内の順序が変わってもIDは変わらない', () => {
    // index-basedなら「rss-source-0」のようなIDになり順序依存になる
    // URL-basedならURLが同じ限り同じID
    const id = generateRssId(sourceName, articleUrl);
    expect(id).not.toMatch(/rss-[^-]+-\d+$/); // 末尾が数字のみのindex-based IDではない
    expect(id).toContain('rss-');
  });

  it('異なるURLは異なるIDになる', () => {
    const url1 = 'https://example.com/article/aaa111bbb222ccc333';
    const url2 = 'https://example.com/article/xxx999yyy888zzz777';
    const id1 = generateRssId(sourceName, url1);
    const id2 = generateRssId(sourceName, url2);
    expect(id1).not.toBe(id2);
  });

  it('URLなし時はタイトルベースのIDになる', () => {
    const id = generateRssId(sourceName, undefined, '福山城イベント開催');
    expect(id).toContain('rss-');
    expect(id.length).toBeGreaterThan(5);
  });

  it('ソース名のスペースはアンダースコアに変換される', () => {
    const id = generateRssId('福山 市公式', articleUrl);
    expect(id).not.toContain(' ');
    expect(id).toContain('_');
  });

  it('IDにプレフィックスrss-が含まれる', () => {
    const id = generateRssId(sourceName, articleUrl);
    expect(id.startsWith('rss-')).toBe(true);
  });
});
