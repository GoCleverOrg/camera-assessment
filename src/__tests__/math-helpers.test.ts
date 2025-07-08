import { degToRad, radToDeg, getFocalLength, computeSensorDimensions } from '../utils/math-helpers';

describe('math helpers', () => {
  describe('degToRad', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(degToRad(0)).toBe(0);
    });

    it('converts 180 degrees to π radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
    });

    it('converts 90 degrees to π/2 radians', () => {
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2, 10);
    });
  });

  describe('radToDeg', () => {
    it('converts 0 radians to 0 degrees', () => {
      expect(radToDeg(0)).toBe(0);
    });

    it('converts π radians to 180 degrees', () => {
      expect(radToDeg(Math.PI)).toBeCloseTo(180, 10);
    });

    it('converts π/2 radians to 90 degrees', () => {
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 10);
    });
  });

  describe('getFocalLength', () => {
    it('returns 4.8mm for zoom level 1', () => {
      expect(getFocalLength(1)).toBe(4.8);
    });

    it('returns 120mm for zoom level 25', () => {
      expect(getFocalLength(25)).toBe(120);
    });

    it('returns 48mm for zoom level 10', () => {
      expect(getFocalLength(10)).toBe(48);
    });

    it('clamps at 120mm for zoom > 25', () => {
      expect(getFocalLength(30)).toBe(120);
    });
  });

  describe('computeSensorDimensions', () => {
    it('computes correct sensor dimensions', () => {
      const dimensions = computeSensorDimensions();
      expect(dimensions).toHaveProperty('width');
      expect(dimensions).toHaveProperty('height');
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
      // Check expected values based on FOV and F_MIN
      // width = 2 * 4.8 * tan(55/2 * π/180) ≈ 4.997
      // height = 2 * 4.8 * tan(33/2 * π/180) ≈ 2.844
      expect(dimensions.width).toBeCloseTo(4.997, 3);
      expect(dimensions.height).toBeCloseTo(2.844, 3);
    });
  });
});
