import { beforeEach, describe, expect, it } from 'vitest';
import { getAlerts, addAlert, removeAlert, hasAlert, matchesAlert } from '@/lib/keyword-alerts';

beforeEach(() => localStorage.clear());

describe('getAlerts', () => {
  it('空のときは空配列を返す', () => {
    expect(getAlerts()).toEqual([]);
  });
  it('保存済みのキーワードを返す', () => {
    localStorage.setItem('fk_keyword_alerts', JSON.stringify(['福山', 'ラーメン']));
    expect(getAlerts()).toEqual(['福山', 'ラーメン']);
  });
  it('不正なJSONは空配列にフォールバック', () => {
    localStorage.setItem('fk_keyword_alerts', 'broken{json');
    expect(getAlerts()).toEqual([]);
  });
});

describe('addAlert', () => {
  it('キーワードを追加できる', () => {
    const result = addAlert('福山');
    expect(result).toContain('福山');
  });
  it('重複は追加しない', () => {
    addAlert('福山');
    const result = addAlert('福山');
    expect(result.filter(k => k === '福山')).toHaveLength(1);
  });
  it('最大10件でそれ以上は古いものを削除', () => {
    for (let i = 0; i < 11; i++) addAlert(`keyword${i}`);
    expect(getAlerts()).toHaveLength(10);
    expect(getAlerts()).not.toContain('keyword0');
    expect(getAlerts()).toContain('keyword10');
  });
  it('追加後にlocalStorageへ保存される', () => {
    addAlert('テスト');
    expect(JSON.parse(localStorage.getItem('fk_keyword_alerts')!)).toContain('テスト');
  });
});

describe('removeAlert', () => {
  it('指定キーワードを削除する', () => {
    addAlert('福山');
    addAlert('ラーメン');
    const result = removeAlert('福山');
    expect(result).not.toContain('福山');
    expect(result).toContain('ラーメン');
  });
  it('存在しないキーワードを削除しても問題ない', () => {
    addAlert('福山');
    const result = removeAlert('存在しない');
    expect(result).toEqual(['福山']);
  });
});

describe('hasAlert', () => {
  it('存在するキーワードでtrue', () => {
    addAlert('福山');
    expect(hasAlert('福山')).toBe(true);
  });
  it('存在しないキーワードでfalse', () => {
    expect(hasAlert('存在しない')).toBe(false);
  });
});

describe('matchesAlert', () => {
  it('テキストにアラートキーワードが含まれればそのキーワードを返す', () => {
    expect(matchesAlert('福山ラーメン特集', ['ラーメン', 'カフェ'])).toBe('ラーメン');
  });
  it('マッチしない場合はnull', () => {
    expect(matchesAlert('福山イベント情報', ['ラーメン', 'カフェ'])).toBeNull();
  });
  it('大文字小文字を無視して比較する', () => {
    expect(matchesAlert('Fukuyama City News', ['fukuyama'])).toBe('fukuyama');
  });
  it('空のアラートリストはnull', () => {
    expect(matchesAlert('福山ラーメン', [])).toBeNull();
  });
});
