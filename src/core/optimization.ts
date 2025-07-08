import { ProjectionParams } from '../types/camera-types';
import { CAMERA_HEIGHT, LINE_SPACING, SENSOR_RES_Y, DISTANCE_TOLERANCE } from '../utils/constants';
import { projectGroundPoint, computePixelGap } from './projection';

export function findOptimalTilt(targetDistance: number, focalLength: number): number {
  // Initial estimate: angle to look at target point
  let tilt = Math.atan2(targetDistance, CAMERA_HEIGHT);

  // Refine to place line near bottom of sensor
  const targetPixel = SENSOR_RES_Y * 0.9; // 90% down the sensor

  // Newton's method for refinement
  for (let i = 0; i < 20; i++) {
    const params: ProjectionParams = {
      focalLength,
      tiltAngle: tilt,
      cameraHeight: CAMERA_HEIGHT,
    };

    const projection = projectGroundPoint(targetDistance, params);
    const error = projection.y - targetPixel;

    if (Math.abs(error) < 1) break;

    // Adjust tilt based on error
    const delta = 0.0001;
    const paramsDelta = { ...params, tiltAngle: tilt + delta };
    const projectionDelta = projectGroundPoint(targetDistance, paramsDelta);
    const derivative = (projectionDelta.y - projection.y) / delta;

    if (Math.abs(derivative) > 1e-6) {
      tilt -= (error / derivative) * 0.5; // Damped update
    }
  }

  return tilt;
}

export function findMaximumDistance(focalLength: number, minPixelGap: number): number {
  let left = 0;
  let right = 200; // Maximum reasonable distance

  while (right - left > DISTANCE_TOLERANCE) {
    const mid = (left + right) / 2;
    const distance = Math.floor(mid / LINE_SPACING) * LINE_SPACING;

    if (distance <= 0) {
      left = mid;
      continue;
    }

    const optimalTilt = findOptimalTilt(distance, focalLength);
    const params: ProjectionParams = {
      focalLength,
      tiltAngle: optimalTilt,
      cameraHeight: CAMERA_HEIGHT,
    };

    const gap = computePixelGap(distance, distance - LINE_SPACING, params);

    if (gap >= minPixelGap) {
      left = mid;
    } else {
      right = mid;
    }
  }

  return Math.floor(left / LINE_SPACING) * LINE_SPACING;
}
