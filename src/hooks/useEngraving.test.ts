import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEngraving, ENGRAVING_MAX } from './useEngraving';

describe('useEngraving', () => {
  it('is inactive by default', () => {
    const { result } = renderHook(() => useEngraving());
    expect(result.current.enabled).toBe(false);
    expect(result.current.isActive).toBe(false);
  });

  it('is inactive when enabled but text is whitespace only', () => {
    const { result } = renderHook(() => useEngraving());
    act(() => result.current.setEnabled(true));
    act(() => result.current.setText('   '));
    expect(result.current.enabled).toBe(true);
    expect(result.current.isActive).toBe(false);
  });

  it('becomes active once non-empty text is entered', () => {
    const { result } = renderHook(() => useEngraving());
    act(() => result.current.setEnabled(true));
    act(() => result.current.setText('Priya'));
    expect(result.current.isActive).toBe(true);
    expect(result.current.trimmed).toBe('Priya');
  });

  it('caps text at ENGRAVING_MAX characters', () => {
    const { result } = renderHook(() => useEngraving());
    act(() => result.current.setText('A'.repeat(ENGRAVING_MAX + 10)));
    expect(result.current.text.length).toBe(ENGRAVING_MAX);
  });

  it('Bold style uppercases new input', () => {
    const { result } = renderHook(() => useEngraving());
    act(() => result.current.setStyle('Bold'));
    act(() => result.current.setText('priya'));
    expect(result.current.text).toBe('PRIYA');
  });

  it('switching to Bold uppercases existing text', () => {
    const { result } = renderHook(() => useEngraving());
    act(() => result.current.setText('priya'));
    act(() => result.current.setStyle('Bold'));
    expect(result.current.text).toBe('PRIYA');
  });
});
