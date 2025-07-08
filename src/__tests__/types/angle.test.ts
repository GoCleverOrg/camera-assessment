import { Angle } from '../../types/angle';

describe('Angle', () => {
  describe('constructor', () => {
    it('should create an angle with radians', () => {
      const angle = new Angle(Math.PI);
      expect(angle.radians).toBe(Math.PI);
    });

    it('should handle zero radians', () => {
      const angle = new Angle(0);
      expect(angle.radians).toBe(0);
    });

    it('should handle negative radians', () => {
      const angle = new Angle(-Math.PI / 2);
      expect(angle.radians).toBe(-Math.PI / 2);
    });
  });

  describe('fromDegrees', () => {
    it('should create an angle from degrees', () => {
      const angle = Angle.fromDegrees(180);
      expect(angle.radians).toBeCloseTo(Math.PI);
    });

    it('should handle 90 degrees', () => {
      const angle = Angle.fromDegrees(90);
      expect(angle.radians).toBeCloseTo(Math.PI / 2);
    });

    it('should handle negative degrees', () => {
      const angle = Angle.fromDegrees(-90);
      expect(angle.radians).toBeCloseTo(-Math.PI / 2);
    });

    it('should handle zero degrees', () => {
      const angle = Angle.fromDegrees(0);
      expect(angle.radians).toBe(0);
    });

    it('should handle 360 degrees', () => {
      const angle = Angle.fromDegrees(360);
      expect(angle.radians).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('degrees getter', () => {
    it('should convert radians to degrees', () => {
      const angle = new Angle(Math.PI);
      expect(angle.degrees).toBeCloseTo(180);
    });

    it('should convert PI/2 radians to 90 degrees', () => {
      const angle = new Angle(Math.PI / 2);
      expect(angle.degrees).toBeCloseTo(90);
    });

    it('should convert negative radians to negative degrees', () => {
      const angle = new Angle(-Math.PI / 2);
      expect(angle.degrees).toBeCloseTo(-90);
    });

    it('should convert zero radians to zero degrees', () => {
      const angle = new Angle(0);
      expect(angle.degrees).toBe(0);
    });

    it('should cache the degrees value', () => {
      const angle = new Angle(Math.PI);
      const degrees1 = angle.degrees;
      const degrees2 = angle.degrees;
      expect(degrees1).toBe(degrees2);
    });
  });

  describe('radians getter', () => {
    it('should return the same radians value', () => {
      const radians = 1.5;
      const angle = new Angle(radians);
      expect(angle.radians).toBe(radians);
    });
  });

  describe('conversion accuracy', () => {
    it('should maintain accuracy when converting back and forth', () => {
      const originalDegrees = 45.5;
      const angle = Angle.fromDegrees(originalDegrees);
      expect(angle.degrees).toBeCloseTo(originalDegrees);
    });

    it('should handle common angles correctly', () => {
      const testCases = [
        { degrees: 0, radians: 0 },
        { degrees: 30, radians: Math.PI / 6 },
        { degrees: 45, radians: Math.PI / 4 },
        { degrees: 60, radians: Math.PI / 3 },
        { degrees: 90, radians: Math.PI / 2 },
        { degrees: 180, radians: Math.PI },
        { degrees: 270, radians: (3 * Math.PI) / 2 },
        { degrees: 360, radians: 2 * Math.PI },
      ];

      testCases.forEach(({ degrees, radians }) => {
        const angleFromDegrees = Angle.fromDegrees(degrees);
        const angleFromRadians = new Angle(radians);

        expect(angleFromDegrees.radians).toBeCloseTo(radians);
        expect(angleFromRadians.degrees).toBeCloseTo(degrees);
      });
    });
  });
});
