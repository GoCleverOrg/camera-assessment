import { generateStripVisualizations } from '../../rendering/strip-visualizer';
import { CameraViewAnalysis } from '../../types/assessment';
import { Angle } from '../../types/angle';
import { SENSOR_RES_Y } from '../../utils/constants';

describe('generateStripVisualizations', () => {
  describe('input validation', () => {
    it('should throw error for null analysis', () => {
      expect(() => generateStripVisualizations(null as unknown as CameraViewAnalysis)).toThrow(
        'Invalid analysis object provided',
      );
    });

    it('should throw error for undefined analysis', () => {
      expect(() => generateStripVisualizations(undefined as unknown as CameraViewAnalysis)).toThrow(
        'Invalid analysis object provided',
      );
    });

    it('should throw error for invalid line count', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(30),
        lineCount: -1,
        focalLength: 50,
      };
      expect(() => generateStripVisualizations(analysis)).toThrow('Invalid line count in analysis');
    });

    it('should throw error for invalid focal length', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(30),
        lineCount: 5,
        focalLength: 0,
      };
      expect(() => generateStripVisualizations(analysis)).toThrow(
        'Invalid focal length in analysis',
      );
    });

    it('should throw error for invalid distance', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: -5,
        tiltAngle: Angle.fromDegrees(30),
        lineCount: 5,
        focalLength: 50,
      };
      expect(() => generateStripVisualizations(analysis)).toThrow('Invalid distance in analysis');
    });
  });

  describe('empty cases', () => {
    it('should return empty array for zero line count', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(30),
        lineCount: 0,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);
      expect(result).toEqual([]);
    });
  });

  describe('strip calculation', () => {
    it('should generate visualizations for single line', () => {
      // Use a realistic analysis from analyzeCameraView
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 2, // One line at 2m
        tiltAngle: Angle.fromDegrees(84.289), // Steep angle to see close line
        lineCount: 1,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);

      expect(result).toHaveLength(1);
      expect(result[0].position).toBeGreaterThanOrEqual(0);
      expect(result[0].position).toBeLessThanOrEqual(1);
      expect(result[0].distance).toBe(0); // First strip has no previous
      expect(result[0].isHighlighted).toBe(true); // Single strip should be highlighted
    });

    it('should generate visualizations for multiple lines', () => {
      // Use more realistic parameters where lines are visible
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 20, // 10 lines from 2m to 20m
        tiltAngle: Angle.fromDegrees(60), // Moderate angle
        lineCount: 10,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(10);

      // Check that positions are normalized
      result.forEach((strip) => {
        expect(strip.position).toBeGreaterThanOrEqual(0);
        expect(strip.position).toBeLessThanOrEqual(1);
      });

      // Check that distances are calculated (except first)
      if (result.length > 0) {
        expect(result[0].distance).toBe(0);
        for (let i = 1; i < result.length; i++) {
          expect(result[i].distance).toBeGreaterThan(0);
        }
      }
    });

    it('should highlight the last two strips', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(70), // Steeper angle to ensure visibility
        lineCount: 5,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);

      if (result.length >= 2) {
        // Last two should be highlighted
        expect(result[result.length - 2].isHighlighted).toBe(true);
        expect(result[result.length - 1].isHighlighted).toBe(true);

        // Others should not be highlighted
        for (let i = 0; i < result.length - 2; i++) {
          expect(result[i].isHighlighted).toBe(false);
        }
      }
    });

    it('should handle tilt angle as plain number', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 6,
        tiltAngle: 1.39626 as unknown as Angle, // ~80 degrees in radians for better visibility
        lineCount: 3,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter out strips outside visible area', () => {
      // Use extreme tilt angle that might project some strips outside sensor
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 2,
        tiltAngle: Angle.fromDegrees(85), // Very steep angle
        lineCount: 10,
        focalLength: 20,
      };
      const result = generateStripVisualizations(analysis);

      // All returned strips should be within sensor bounds
      result.forEach((strip) => {
        const yPixel = strip.position * SENSOR_RES_Y;
        expect(yPixel).toBeGreaterThanOrEqual(0);
        expect(yPixel).toBeLessThanOrEqual(SENSOR_RES_Y);
      });
    });

    it('should calculate correct distances between consecutive strips', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(30),
        lineCount: 4,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);

      if (result.length >= 2) {
        // Verify distances match actual pixel differences
        for (let i = 1; i < result.length; i++) {
          const actualDistance = Math.abs(
            result[i].position * SENSOR_RES_Y - result[i - 1].position * SENSOR_RES_Y,
          );
          expect(result[i].distance).toBeCloseTo(actualDistance, 1);
        }
      }
    });
  });

  describe('edge cases', () => {
    it('should handle very small focal length', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(45),
        lineCount: 3,
        focalLength: 0.1,
      };
      const result = generateStripVisualizations(analysis);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle very large focal length', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(45),
        lineCount: 3,
        focalLength: 1000,
      };
      const result = generateStripVisualizations(analysis);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle zero tilt angle', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(0),
        lineCount: 3,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle 90 degree tilt angle', () => {
      const analysis: CameraViewAnalysis = {
        distanceInMeters: 10,
        tiltAngle: Angle.fromDegrees(90),
        lineCount: 3,
        focalLength: 50,
      };
      const result = generateStripVisualizations(analysis);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
