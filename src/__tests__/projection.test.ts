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
      // With a 30-degree downward tilt from 20m height looking at 20m distance,
      // the point appears below center (y > 720)
      expect(result.y).toBeGreaterThan(720); // Below center
      expect(result.x).toBe(1280); // Center X
    });

    it('handles horizontal view case', () => {
      const params = {
        focalLength: 4.8,
        tiltAngle: 0, // Looking horizontally
        cameraHeight: 20,
      };

      // When looking horizontally from 20m height at a ground point 10m away,
      // the point is 20m below the camera and should project far below center
      const result = projectGroundPoint(10, params);
      expect(result.x).toBe(1280); // Center X
      expect(result.y).toBeGreaterThan(1440); // Should be below the sensor bottom
    });
  });
});
