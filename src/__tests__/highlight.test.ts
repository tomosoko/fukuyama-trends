import { describe, expect, it } from 'vitest';
import { highlight } from '@/components/SearchBar';

// highlight() は ReactNode を返すが、テキストのみのケースでは string を返す
describe('highlight', () => {
  it('キーワードが空なら元テキストをそのまま返す', () => {
    expect(highlight('福山ラーメン', '')).toBe('福山ラーメン');
  });

  it('テキストが空ならそのまま返す', () => {
    expect(highlight('', 'ラーメン')).toBe('');
  });

  it('マッチなしなら配列で返る（非一致パートのみ）', () => {
    const result = highlight('福山イベント', 'ラーメン') as string[];
    // split() で ['福山イベント'] が返る
    expect(result).toEqual(['福山イベント']);
  });

  it('マッチありは mark 要素を含む配列を返す', () => {
    const result = highlight('福山ラーメン特集', 'ラーメン') as unknown[];
    // ['福山', <mark>ラーメン</mark>, '特集'] の3要素
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('福山');
    expect(result[2]).toBe('特集');
    // mark要素の確認
    const mark = result[1] as { type: string; props: { children: string } };
    expect(mark.type).toBe('mark');
    expect(mark.props.children).toBe('ラーメン');
  });

  it('大文字小文字を無視してマッチする', () => {
    const result = highlight('Fukuyama City', 'fukuyama') as unknown[];
    expect(result).toHaveLength(3);
    const mark = result[1] as { type: string; props: { children: string } };
    expect(mark.type).toBe('mark');
    expect(mark.props.children).toBe('Fukuyama');
  });

  it('正規表現の特殊文字を含むキーワードでもクラッシュしない', () => {
    expect(() => highlight('テスト (括弧)', '(括弧)')).not.toThrow();
  });

  it('正規表現の特殊文字 $ もエスケープされる', () => {
    expect(() => highlight('$100', '$1')).not.toThrow();
  });

  it('正規表現の特殊文字 * もエスケープされる', () => {
    expect(() => highlight('abc*def', '*')).not.toThrow();
  });

  it('テキスト先頭のマッチ', () => {
    const result = highlight('ラーメン特集', 'ラーメン') as unknown[];
    expect(result[0]).toBe('');
    const mark = result[1] as { type: string; props: { children: string } };
    expect(mark.props.children).toBe('ラーメン');
  });

  it('テキスト末尾のマッチ', () => {
    const result = highlight('福山ラーメン', 'ラーメン') as unknown[];
    expect(result[0]).toBe('福山');
    expect(result[result.length - 1]).toBe('');
  });

  it('複数箇所マッチ', () => {
    const result = highlight('ラーメン屋のラーメン', 'ラーメン') as unknown[];
    const marks = result.filter((r): r is { type: string; props: { children: string } } =>
      typeof r === 'object' && r !== null && (r as { type?: string }).type === 'mark'
    );
    expect(marks).toHaveLength(2);
  });
});
