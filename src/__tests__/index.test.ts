import { describe, it, expect } from '@jest/globals';
import { greet } from '../index';

describe('greet', () => {
  it('should return a greeting message', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  it('should work with different names', () => {
    expect(greet('TypeScript')).toBe('Hello, TypeScript!');
  });
});