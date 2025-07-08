import { computeMaxDistance } from '../compute-max-distance';
import { computeTheoreticalGap } from './fixtures/test-helpers';
import { getFocalLength } from '../utils/math-helpers';
import { findOptimalTilt } from '../core/optimization';
import { computePixelGap } from '../core/projection';
import { CAMERA_HEIGHT, LINE_SPACING } from '../utils/constants';

describe('computeMaxDistance', () => {
  describe('boundary conditions', () => {
    it('returns 0 when minPixelGap exceeds sensor height', () => {
      expect(computeMaxDistance(1, 2000)).toBe(0);
    });

    it('returns 2 when minPixelGap equals sensor height', () => {
      expect(computeMaxDistance(1, 1440)).toBe(2);
    });

    it('returns 0 for impossible gap at max zoom', () => {
      expect(computeMaxDistance(25, 2000)).toBe(0);
    });

    it('returns 2 for full height gap at max zoom', () => {
      expect(computeMaxDistance(25, 1440)).toBe(2);
    });
  });

  describe('integration tests', () => {
    describe('monotonicity properties', () => {
      it('never decreases with increasing zoom', () => {
        const gap = 50;
        for (let z = 1; z < 24; z++) {
          const d1 = computeMaxDistance(z, gap);
          const d2 = computeMaxDistance(z + 1, gap);
          expect(d2).toBeGreaterThanOrEqual(d1);
        }
      });

      it('never increases with increasing gap', () => {
        const zoom = 10;
        for (let g = 10; g < 100; g += 10) {
          const d1 = computeMaxDistance(zoom, g);
          const d2 = computeMaxDistance(zoom, g + 10);
          expect(d2).toBeLessThanOrEqual(d1);
        }
      });
    });
  });

  describe('small-N consistency', () => {
    const testCases = [1, 2, 5, 10];
    const zoomLevels = [1, 25];

    zoomLevels.forEach((zoom) => {
      describe(`zoom level ${zoom}`, () => {
        testCases.forEach((n) => {
          it(`correctly handles ${n} lines`, () => {
            const theoreticalGap = computeTheoreticalGap(zoom, n);
            const distance = n * LINE_SPACING;

            // Skip test if theoretical gap exceeds sensor height
            if (theoreticalGap > 1440) {
              expect(computeMaxDistance(zoom, 1440)).toBe(2);
              return;
            }

            // Should achieve at least this distance with floor(gap)
            expect(computeMaxDistance(zoom, Math.floor(theoreticalGap))).toBeGreaterThanOrEqual(
              distance,
            );

            // Should not achieve this distance with ceil(gap) + 1
            if (Math.ceil(theoreticalGap) + 1 <= 1440) {
              expect(computeMaxDistance(zoom, Math.ceil(theoreticalGap) + 1)).toBeLessThan(
                distance,
              );
            }
          });
        });
      });
    });
  });

  describe('round-trip validation', () => {
    it('verifies computed distance satisfies pixel gap constraint', () => {
      const testCases = [
        { zoom: 1, gap: 10 },
        { zoom: 10, gap: 50 },
        { zoom: 25, gap: 100 },
      ];

      testCases.forEach(({ zoom, gap }) => {
        const distance = computeMaxDistance(zoom, gap);
        if (distance === 0) return;

        const focalLength = getFocalLength(zoom);
        const optimalTilt = findOptimalTilt(distance, focalLength);
        const params = {
          focalLength,
          tiltAngle: optimalTilt,
          cameraHeight: CAMERA_HEIGHT,
        };

        // Verify constraint is satisfied
        const actualGap = computePixelGap(distance, distance - LINE_SPACING, params);
        expect(actualGap).toBeGreaterThanOrEqual(gap - 0.01);

        // Verify next line would violate constraint
        if (distance < 100) {
          const nextGap = computePixelGap(distance + LINE_SPACING, distance, params);
          expect(nextGap).toBeLessThan(gap + 0.01);
        }
      });
    });
  });

  describe('performance', () => {
    it('completes in under 10ms', () => {
      const start = performance.now();
      computeMaxDistance(10, 50);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });

    it('handles 100 random inputs efficiently', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const zoom = Math.random() * 24 + 1;
        const gap = Math.random() * 100 + 1;
        computeMaxDistance(zoom, gap);
      }
      const avgTime = (performance.now() - start) / 100;
      expect(avgTime).toBeLessThan(5);
    });
  });
});
