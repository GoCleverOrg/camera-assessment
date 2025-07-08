import { projectGroundPoint } from '../core/projection';
import { degToRad } from '../utils/math-helpers';

describe('projection system', () => {
  describe('projectGroundPoint', () => {
    it('projects point directly below camera to center when looking down', () => {
      const params = {
        focalLength: 4.8,
        tiltAngle: -Math.PI / 2, // Looking straight down
        cameraHeight: 20,
      };

      const result = projectGroundPoint(0, params);
      expect(result.y).toBeCloseTo(720, 1); // Center of 1440px sensor
    });

    it('projects distant point correctly with forward tilt', () => {
      const params = {
        focalLength: 4.8,
        tiltAngle: degToRad(30),
        cameraHeight: 20,
      };

      const result = projectGroundPoint(20, params);
      expect(result.y).toBeLessThan(720); // Above center
    });

    it('handles near-zero zCam case', () => {
      const params = {
        focalLength: 4.8,
        tiltAngle: 0,
        cameraHeight: 0,
      };

      const result = projectGroundPoint(0, params);
      expect(result.x).toBe(1280); // Center X
      expect(result.y).toBe(720); // Center Y
    });
  });
});
