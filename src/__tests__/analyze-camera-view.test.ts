import { analyzeCameraView } from '../analyze-camera-view';
import { Zoom } from '../types/zoom';
import { ImpossibleConstraintError } from '../errors/camera-errors';
import { SENSOR_RES_Y } from '../utils/constants';

describe('analyzeCameraView', () => {
  describe('Basic functionality', () => {
    it('should return camera view analysis for valid inputs', () => {
      const zoom = new Zoom(5);
      const minPixelGap = 10;

      const result = analyzeCameraView(zoom, minPixelGap);

      expect(result).toHaveProperty('distanceInMeters');
      expect(result).toHaveProperty('tiltAngle');
      expect(result).toHaveProperty('lineCount');
      expect(result).toHaveProperty('focalLength');

      expect(result.distanceInMeters).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
      expect(result.focalLength).toBe(zoom.focalLength);
    });

    it('should use the focal length from the Zoom instance', () => {
      const zoom = new Zoom(10);
      const minPixelGap = 20;

      const result = analyzeCameraView(zoom, minPixelGap);

      expect(result.focalLength).toBe(zoom.focalLength);
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum zoom level', () => {
      const zoom = new Zoom(1);
      const minPixelGap = 5;

      const result = analyzeCameraView(zoom, minPixelGap);

      expect(result.distanceInMeters).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
    });

    it('should handle maximum zoom level', () => {
      const zoom = new Zoom(25);
      const minPixelGap = 50;

      const result = analyzeCameraView(zoom, minPixelGap);

      expect(result.distanceInMeters).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
    });

    it('should handle edge case where minPixelGap equals SENSOR_RES_Y', () => {
      const zoom = new Zoom(5);
      const minPixelGap = SENSOR_RES_Y;

      const result = analyzeCameraView(zoom, minPixelGap);

      expect(result.distanceInMeters).toBe(2); // Only one line can fit
      expect(result.lineCount).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should throw ImpossibleConstraintError when minPixelGap > SENSOR_RES_Y', () => {
      const zoom = new Zoom(5);
      const minPixelGap = SENSOR_RES_Y + 1;

      expect(() => analyzeCameraView(zoom, minPixelGap)).toThrow(ImpossibleConstraintError);
      expect(() => analyzeCameraView(zoom, minPixelGap)).toThrow(
        `Impossible constraint: minimum pixel gap (${minPixelGap}) exceeds sensor height (${SENSOR_RES_Y})`,
      );
    });

    it('should throw ImpossibleConstraintError for very large minPixelGap', () => {
      const zoom = new Zoom(10);
      const minPixelGap = 5000;

      expect(() => analyzeCameraView(zoom, minPixelGap)).toThrow(ImpossibleConstraintError);
    });
  });

  describe('Result structure validation', () => {
    it('should return valid CameraViewAnalysis structure', () => {
      const zoom = new Zoom(7);
      const minPixelGap = 15;

      const result = analyzeCameraView(zoom, minPixelGap);

      // Check all required properties exist
      expect(result).toHaveProperty('distanceInMeters');
      expect(result).toHaveProperty('tiltAngle');
      expect(result).toHaveProperty('lineCount');
      expect(result).toHaveProperty('focalLength');

      // Check types
      expect(typeof result.distanceInMeters).toBe('number');
      expect(typeof result.lineCount).toBe('number');
      expect(typeof result.focalLength).toBe('number');
      expect(result.tiltAngle).toBeDefined();
      expect(result.tiltAngle.radians).toBeDefined();
      expect(result.tiltAngle.degrees).toBeDefined();
    });

    it('should return consistent results for the same inputs', () => {
      const zoom = new Zoom(12);
      const minPixelGap = 25;

      const result1 = analyzeCameraView(zoom, minPixelGap);
      const result2 = analyzeCameraView(zoom, minPixelGap);

      expect(result1.distanceInMeters).toBe(result2.distanceInMeters);
      expect(result1.tiltAngle.radians).toBe(result2.tiltAngle.radians);
      expect(result1.lineCount).toBe(result2.lineCount);
      expect(result1.focalLength).toBe(result2.focalLength);
    });
  });

  describe('Integration with Zoom class', () => {
    it('should work with various zoom levels', () => {
      const zoomLevels = [1, 5, 10, 15, 20, 25];
      const minPixelGap = 30;

      zoomLevels.forEach((level) => {
        const zoom = new Zoom(level);
        const result = analyzeCameraView(zoom, minPixelGap);

        expect(result.focalLength).toBe(zoom.focalLength);
        expect(result.distanceInMeters).toBeGreaterThanOrEqual(0);
        expect(result.lineCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Camera height parameter', () => {
    it('should use default camera height when not provided', () => {
      const zoom = new Zoom(5);
      const minPixelGap = 10;

      const resultDefault = analyzeCameraView(zoom, minPixelGap);
      const resultExplicit = analyzeCameraView(zoom, minPixelGap, 20); // DEFAULT_CAMERA_HEIGHT is 20

      expect(resultDefault.distanceInMeters).toBe(resultExplicit.distanceInMeters);
      expect(resultDefault.tiltAngle.radians).toBe(resultExplicit.tiltAngle.radians);
      expect(resultDefault.lineCount).toBe(resultExplicit.lineCount);
    });

    it('should handle different camera heights correctly', () => {
      const zoom = new Zoom(5);
      const minPixelGap = 10;
      const heights = [5, 10, 15, 20, 30, 50];

      const results = heights.map((height) => ({
        height,
        analysis: analyzeCameraView(zoom, minPixelGap, height),
      }));

      // Different heights should produce different results
      for (let i = 1; i < results.length; i++) {
        expect(results[i].analysis.distanceInMeters).not.toBe(results[0].analysis.distanceInMeters);
        expect(results[i].analysis.tiltAngle.radians).not.toBe(
          results[0].analysis.tiltAngle.radians,
        );
      }

      // Higher camera generally allows viewing further
      expect(results[5].analysis.distanceInMeters).toBeGreaterThan(
        results[0].analysis.distanceInMeters,
      );
    });

    it('should handle very low camera height', () => {
      const zoom = new Zoom(10);
      const minPixelGap = 20;
      const lowHeight = 0.5; // 50cm

      const result = analyzeCameraView(zoom, minPixelGap, lowHeight);

      expect(result.distanceInMeters).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
      expect(result.tiltAngle.radians).toBeGreaterThan(0);
    });

    it('should handle very high camera height', () => {
      const zoom = new Zoom(10);
      const minPixelGap = 20;
      const highHeight = 100; // 100 meters

      const result = analyzeCameraView(zoom, minPixelGap, highHeight);

      expect(result.distanceInMeters).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
      expect(result.tiltAngle.radians).toBeGreaterThan(0);
    });

    it('should produce consistent results for the same height', () => {
      const zoom = new Zoom(8);
      const minPixelGap = 15;
      const customHeight = 25;

      const result1 = analyzeCameraView(zoom, minPixelGap, customHeight);
      const result2 = analyzeCameraView(zoom, minPixelGap, customHeight);

      expect(result1.distanceInMeters).toBe(result2.distanceInMeters);
      expect(result1.tiltAngle.radians).toBe(result2.tiltAngle.radians);
      expect(result1.lineCount).toBe(result2.lineCount);
    });
  });
});
