import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/lib/useDebounce';

afterEach(() => vi.useRealTimers());

describe('useDebounce', () => {
  it('初期値をすぐに返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('delay経過前は値が変わらない', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'updated' });
    vi.advanceTimersByTime(200);
    expect(result.current).toBe('initial');
  });

  it('delay経過後に値が更新される', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'updated' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('updated');
  });

  it('連続した変更は最後の値だけが反映される', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );
    rerender({ value: 'b' });
    vi.advanceTimersByTime(100);
    rerender({ value: 'c' });
    vi.advanceTimersByTime(100);
    rerender({ value: 'd' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('d');
  });

  it('delay=0は即座に更新', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    );
    rerender({ value: 'fast' });
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current).toBe('fast');
  });

  it('数値型でも動作する', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 0 } }
    );
    rerender({ value: 42 });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe(42);
  });
});
