import { findOptimalTilt, findMaximumDistance } from '../core/optimization';

describe('optimization', () => {
  describe('findOptimalTilt', () => {
    it('finds tilt that places target line near bottom of frame', () => {
      const tilt = findOptimalTilt(20, 4.8);
      // Should place line at ~20m near bottom of sensor
      expect(tilt).toBeGreaterThan(0);
      expect(tilt).toBeLessThan(Math.PI / 2);
    });

    it('handles edge case with very small derivative', () => {
      // Test with extreme focal length to trigger small derivative
      const tilt = findOptimalTilt(1, 120);
      expect(tilt).toBeDefined();
      expect(isNaN(tilt)).toBe(false);
    });
  });

  describe('findMaximumDistance', () => {
    it('finds maximum distance respecting pixel gap constraint', () => {
      const result = findMaximumDistance(4.8, 10);
      expect(result).toBeGreaterThan(0);
      expect(result % 2).toBe(0); // Should be multiple of LINE_SPACING
    });

    it('handles very large pixel gap constraints', () => {
      const result = findMaximumDistance(4.8, 1000);
      expect(result).toBe(0); // Should return 0 for impossible constraints
    });
  });
});
