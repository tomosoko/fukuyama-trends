import { describe, expect, it } from 'vitest';
import { filterByDate } from '@/components/DateFilter';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

describe('filterByDate', () => {
  it('range=all は常に true', () => {
    expect(filterByDate(undefined,               'all')).toBe(true);
    expect(filterByDate(hoursAgo(100),           'all')).toBe(true);
    expect(filterByDate('2000-01-01T00:00:00Z',  'all')).toBe(true);
  });

  it('publishedAt なしは range に関わらず true（日時不明は除外しない）', () => {
    expect(filterByDate(undefined, 'today')).toBe(true);
    expect(filterByDate(undefined, 'week')).toBe(true);
    expect(filterByDate(undefined, 'month')).toBe(true);
  });

  it('不正な日時文字列は true にフォールバック', () => {
    expect(filterByDate('not-a-date', 'today')).toBe(true);
  });

  describe('today（24時間以内）', () => {
    it('23時間前の記事は含む', () => {
      expect(filterByDate(hoursAgo(23), 'today')).toBe(true);
    });
    it('25時間前の記事は除外', () => {
      expect(filterByDate(hoursAgo(25), 'today')).toBe(false);
    });
  });

  describe('week（7日以内）', () => {
    it('6日前の記事は含む', () => {
      expect(filterByDate(hoursAgo(6 * 24), 'week')).toBe(true);
    });
    it('8日前の記事は除外', () => {
      expect(filterByDate(hoursAgo(8 * 24), 'week')).toBe(false);
    });
  });

  describe('month（30日以内）', () => {
    it('29日前の記事は含む', () => {
      expect(filterByDate(hoursAgo(29 * 24), 'month')).toBe(true);
    });
    it('31日前の記事は除外', () => {
      expect(filterByDate(hoursAgo(31 * 24), 'month')).toBe(false);
    });
  });
});
