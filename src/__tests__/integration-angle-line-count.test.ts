import { analyzeCameraView } from '../analyze-camera-view';
import { findOptimalTiltWithAngle, findMaximumDistanceWithDetails } from '../core/optimization';
import { Zoom } from '../types/zoom';
import { Angle } from '../types/angle';
import { LINE_SPACING } from '../utils/constants';
import { ImpossibleConstraintError } from '../errors/camera-errors';

describe('Integration: Angle and Line Count Tracking', () => {
  describe('Full workflow with angle tracking', () => {
    it('tracks angle through entire optimization process', () => {
      const zoom = new Zoom(15);
      const minPixelGap = 25;

      // Get detailed results
      const result = analyzeCameraView(zoom, minPixelGap);

      // Verify all properties are present
      expect(result.distanceInMeters).toBeGreaterThan(0);
      expect(result.tiltAngle).toBeInstanceOf(Angle);
      expect(result.lineCount).toBeGreaterThan(0);

      // Verify angle is reasonable
      const angleDegrees = result.tiltAngle.degrees;
      expect(angleDegrees).toBeGreaterThan(0);
      expect(angleDegrees).toBeLessThan(90);

      // Verify line count calculation
      expect(result.lineCount).toBe(result.distanceInMeters / LINE_SPACING);
      expect(Number.isInteger(result.lineCount)).toBe(true);
    });

    it('returns consistent angles for specific distances', () => {
      const targetDistance = 20; // meters
      const focalLength = 48; // mm (zoom ~10)

      const tiltResult = findOptimalTiltWithAngle(targetDistance, focalLength, 20);

      expect(tiltResult.tiltRadians).toBeGreaterThan(0);
      expect(tiltResult.tiltAngle).toBeInstanceOf(Angle);
      expect(tiltResult.tiltAngle.radians).toBe(tiltResult.tiltRadians);

      // The angle should be appropriate for looking at 20m distance
      const expectedAngleApprox = Math.atan2(targetDistance, 20); // DEFAULT_CAMERA_HEIGHT = 20
      expect(tiltResult.tiltRadians).toBeCloseTo(expectedAngleApprox, 1);
    });

    it('tracks angle changes with different zoom levels', () => {
      const minPixelGap = 20;
      const zoomLevels = [1, 5, 10, 15, 20, 25];
      const results = [];

      for (const zoomLevel of zoomLevels) {
        const zoom = new Zoom(zoomLevel);
        const result = analyzeCameraView(zoom, minPixelGap);
        results.push({
          zoom: zoomLevel,
          distance: result.distanceInMeters,
          angle: result.tiltAngle.degrees,
          lineCount: result.lineCount,
        });
      }

      // Higher zoom should generally allow greater distances
      for (let i = 1; i < results.length; i++) {
        expect(results[i].distance).toBeGreaterThanOrEqual(results[i - 1].distance);
      }

      // Verify results have expected structure
      results.forEach((r) => {
        expect(r.zoom).toBeGreaterThanOrEqual(1);
        expect(r.zoom).toBeLessThanOrEqual(25);
        expect(r.distance).toBeGreaterThanOrEqual(0);
        expect(r.angle).toBeGreaterThanOrEqual(0);
        expect(r.angle).toBeLessThan(90);
        expect(Number.isInteger(r.lineCount)).toBe(true);
      });
    });

    it('handles edge cases with proper angle reporting', () => {
      // Case 1: Impossible constraint
      const zoom1 = new Zoom(1);
      expect(() => analyzeCameraView(zoom1, 1500)).toThrow(ImpossibleConstraintError);

      // Case 2: Exactly one line fits
      const zoom10 = new Zoom(10);
      const oneLine = analyzeCameraView(zoom10, 1440);
      expect(oneLine.distanceInMeters).toBe(2);
      expect(oneLine.lineCount).toBe(1);
      expect(oneLine.tiltAngle.radians).toBeGreaterThan(0);

      // Case 3: Normal operation
      const normal = analyzeCameraView(zoom10, 50);
      expect(normal.distanceInMeters).toBeGreaterThan(2);
      expect(normal.lineCount).toBeGreaterThan(1);
      expect(normal.tiltAngle.radians).toBeGreaterThan(0);
    });
  });

  describe('Low-level optimization functions', () => {
    it('findMaximumDistanceWithDetails provides complete information', () => {
      const focalLength = 24; // mm
      const minPixelGap = 30;

      const result = findMaximumDistanceWithDetails(focalLength, minPixelGap, 20);

      // Verify structure
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('optimalAngle');
      expect(result).toHaveProperty('lineCount');

      // Verify types
      expect(typeof result.distance).toBe('number');
      expect(result.optimalAngle).toBeInstanceOf(Angle);
      expect(typeof result.lineCount).toBe('number');

      // Verify values make sense
      expect(result.distance % LINE_SPACING).toBe(0);
      expect(result.lineCount * LINE_SPACING).toBe(result.distance);
    });
  });
});
