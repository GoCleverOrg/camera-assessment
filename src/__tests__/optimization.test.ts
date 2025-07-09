import {
  findOptimalTilt,
  findMaximumDistance,
  findMaximumDistanceWithDetails,
} from '../core/optimization';
import { computePixelGap } from '../core/projection';
import { ProjectionParams } from '../types/camera-types';
import { CAMERA_HEIGHT } from '../utils/constants';
import { Zoom } from '../types/zoom';

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

  describe('Monotonic Growth Test', () => {
    it('should have strictly increasing distances for zoom 1-25', () => {
      let prevDistance = 0;
      for (let zoom = 1; zoom <= 25; zoom++) {
        const zoomObj = new Zoom(zoom);
        const distance = findMaximumDistance(zoomObj.focalLength, 10);
        expect(distance).toBeGreaterThan(prevDistance);
        prevDistance = distance;
      }
    });
  });

  describe('No Artificial Cap Test', () => {
    it('zoom 25 should achieve >400m', () => {
      const zoom25 = new Zoom(25);
      const distance = findMaximumDistance(zoom25.focalLength, 10);
      expect(distance).toBeGreaterThan(400);
    });

    it('no zoom level should plateau at 198m', () => {
      const distancesAt198 = [];
      for (let zoom = 1; zoom <= 25; zoom++) {
        const zoomObj = new Zoom(zoom);
        const distance = findMaximumDistance(zoomObj.focalLength, 10);
        if (distance === 198) {
          distancesAt198.push(zoom);
        }
      }
      // At most one zoom level might naturally hit 198m
      expect(distancesAt198.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Pixel Gap Verification', () => {
    it('should be approximately 10px at maximum distance', () => {
      for (let zoom = 1; zoom <= 25; zoom++) {
        const zoomObj = new Zoom(zoom);
        const result = findMaximumDistanceWithDetails(zoomObj.focalLength, 10);

        // Calculate actual pixel gap at the maximum distance
        const params: ProjectionParams = {
          focalLength: zoomObj.focalLength,
          tiltAngle: result.optimalAngle.radians,
          cameraHeight: CAMERA_HEIGHT,
        };

        const pixelGap = computePixelGap(result.distance, result.distance - 2, params);

        // Should be close to 10px (allowing some tolerance due to discretization)
        expect(pixelGap).toBeGreaterThanOrEqual(9.5);
        expect(pixelGap).toBeLessThanOrEqual(11);
      }
    });
  });

  describe('Physical Consistency Test', () => {
    const theoreticalMaxDistances: Record<number, number> = {
      1: 100,
      5: 220,
      10: 312,
      15: 382,
      20: 440,
      25: 492,
    };

    Object.entries(theoreticalMaxDistances).forEach(([zoomStr, expected]) => {
      const zoom = Number(zoomStr);
      it(`zoom ${zoom} should be within 5% of ${expected}m`, () => {
        const zoomObj = new Zoom(zoom);
        const actual = findMaximumDistance(zoomObj.focalLength, 10);
        expect(actual).toBeGreaterThan(expected * 0.95);
        expect(actual).toBeLessThan(expected * 1.05);
      });
    });
  });

  describe('Performance Test', () => {
    it('should converge quickly for all zoom levels', () => {
      for (let zoom = 1; zoom <= 25; zoom++) {
        const zoomObj = new Zoom(zoom);
        const startTime = performance.now();
        findMaximumDistance(zoomObj.focalLength, 10);
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Should complete in less than 100ms
        expect(executionTime).toBeLessThan(100);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small focal lengths', () => {
      const distance = findMaximumDistance(1, 10); // 1mm focal length
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(100); // Small focal length results in shorter max distance
    });

    it('should handle very large focal lengths', () => {
      const distance = findMaximumDistance(200, 10); // 200mm focal length
      expect(distance).toBeGreaterThan(500);
    });

    it('should handle very small pixel gaps', () => {
      const zoom10 = new Zoom(10);
      const distance = findMaximumDistance(zoom10.focalLength, 1);
      expect(distance).toBeGreaterThan(900); // Very small gap allows for longer distances
    });

    it('should handle very large pixel gaps', () => {
      const zoom10 = new Zoom(10);
      const distance = findMaximumDistance(zoom10.focalLength, 100);
      expect(distance).toBeLessThan(100);
      expect(distance).toBeGreaterThan(0);
    });
  });
});
