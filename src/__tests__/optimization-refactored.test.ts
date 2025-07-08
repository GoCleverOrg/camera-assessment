import { findOptimalTiltWithAngle, findMaximumDistanceWithDetails } from '../core/optimization';
import { Angle } from '../types/angle';
import { LINE_SPACING } from '../utils/constants';

describe('optimization refactored', () => {
  describe('findOptimalTiltWithAngle', () => {
    it('returns both tilt angle in radians and as Angle instance', () => {
      const result = findOptimalTiltWithAngle(20, 4.8);

      expect(result).toHaveProperty('tiltRadians');
      expect(result).toHaveProperty('tiltAngle');
      expect(result.tiltAngle).toBeInstanceOf(Angle);
      expect(result.tiltRadians).toBe(result.tiltAngle.radians);
      expect(result.tiltRadians).toBeGreaterThan(0);
      expect(result.tiltRadians).toBeLessThan(Math.PI / 2);
    });

    it('calculates correct angle for edge cases', () => {
      const result = findOptimalTiltWithAngle(1, 120);

      expect(result.tiltAngle).toBeInstanceOf(Angle);
      expect(isNaN(result.tiltRadians)).toBe(false);
      expect(result.tiltAngle.degrees).toBeDefined();
    });
  });

  describe('findMaximumDistanceWithDetails', () => {
    it('returns distance, angle, and line count', () => {
      const result = findMaximumDistanceWithDetails(4.8, 10);

      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('optimalAngle');
      expect(result).toHaveProperty('lineCount');

      expect(result.distance).toBeGreaterThan(0);
      expect(result.distance % LINE_SPACING).toBe(0);
      expect(result.optimalAngle).toBeInstanceOf(Angle);
      expect(result.lineCount).toBe(result.distance / LINE_SPACING);
    });

    it('returns zero distance and line count for impossible constraints', () => {
      const result = findMaximumDistanceWithDetails(4.8, 1000);

      expect(result.distance).toBe(0);
      expect(result.lineCount).toBe(0);
      expect(result.optimalAngle).toBeInstanceOf(Angle);
      expect(result.optimalAngle.radians).toBe(0);
    });

    it('calculates correct line count for valid distances', () => {
      const result = findMaximumDistanceWithDetails(4.8, 10);

      expect(result.lineCount).toBeGreaterThan(0);
      expect(result.lineCount).toBe(Math.floor(result.distance / LINE_SPACING));
      expect(Number.isInteger(result.lineCount)).toBe(true);
    });

    it('provides optimal angle used for the maximum distance', () => {
      const result = findMaximumDistanceWithDetails(10, 15);

      expect(result.optimalAngle.radians).toBeGreaterThan(0);
      expect(result.optimalAngle.radians).toBeLessThan(Math.PI / 2);
      expect(result.optimalAngle.degrees).toBeGreaterThan(0);
      expect(result.optimalAngle.degrees).toBeLessThan(90);
    });
  });
});
