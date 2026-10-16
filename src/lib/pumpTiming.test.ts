import { describe, it, expect } from 'vitest';
import { pumpSeconds } from './pumpTiming';

describe('pumpSeconds', () => {
  it('is ml divided by ml per second', () => {
    expect(pumpSeconds(4.5, 1.5)).toBe(3);
  });
  it('is null when the pump has no rate', () => {
    expect(pumpSeconds(4.5, 0)).toBeNull();
  });
});
