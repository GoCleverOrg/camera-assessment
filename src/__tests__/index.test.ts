import { describe, it, expect } from '@jest/globals';
import { computeMaxDistance } from '../index';

describe('index exports', () => {
  it('should export computeMaxDistance function', () => {
    expect(computeMaxDistance).toBeDefined();
    expect(typeof computeMaxDistance).toBe('function');
  });

  it('should work with the exported function', () => {
    expect(computeMaxDistance(1, 2000)).toBe(0);
  });
});
