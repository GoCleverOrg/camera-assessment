import { ProjectionParams } from '../types/camera-types';
import { LINE_SPACING, SENSOR_RES_Y, DISTANCE_TOLERANCE } from '../utils/constants';
import { projectGroundPoint, computePixelGap } from './projection';
import { Angle } from '../types/angle';

export function findOptimalTilt(
  targetDistance: number,
  focalLength: number,
  cameraHeight: number,
): number {
  // Initial estimate: angle to look at target point
  // The tilt angle is from horizontal, where positive means tilting down
  // For a camera at height H looking at ground distance D, tilt = atan(H/D)
  let tilt = Math.atan(cameraHeight / targetDistance);

  // Refine to place line near bottom of sensor
  const targetPixel = SENSOR_RES_Y * 0.9; // 90% down the sensor

  // Newton's method for refinement
  for (let i = 0; i < 20; i++) {
    // Ensure tilt angle stays within valid bounds
    // Maximum tilt is almost straight down (89 degrees)
    // Minimum tilt is slightly above horizontal to avoid numeric issues
    const maxTilt = Math.PI / 2 - 0.01; // ~89 degrees
    const minTilt = 0.01; // ~0.57 degrees
    tilt = Math.max(minTilt, Math.min(maxTilt, tilt));

    const params: ProjectionParams = {
      focalLength,
      tiltAngle: tilt,
      cameraHeight: cameraHeight,
    };

    try {
      const projection = projectGroundPoint(targetDistance, params);
      const error = projection.y - targetPixel;

      if (Math.abs(error) < 1) break;

      // Adjust tilt based on error
      const delta = 0.0001;
      const paramsDelta = { ...params, tiltAngle: Math.min(maxTilt, tilt + delta) };
      const projectionDelta = projectGroundPoint(targetDistance, paramsDelta);
      const derivative = (projectionDelta.y - projection.y) / delta;

      if (Math.abs(derivative) > 1e-6) {
        const newTilt = tilt - (error / derivative) * 0.5; // Damped update
        // Ensure the new tilt is within bounds
        tilt = Math.max(minTilt, Math.min(maxTilt, newTilt));
      }
    } catch {
      // If projection fails, we've hit a limit, break out of refinement
      break;
    }
  }

  return tilt;
}

export function findMaximumDistance(
  focalLength: number,
  minPixelGap: number,
  cameraHeight: number,
): number {
  let left = 0;
  let right = 1000; // Initial guess, will expand if needed
  const maxIterations = 50; // Safety limit to prevent infinite loops
  let iterations = 0;

  // First, expand the upper bound if needed
  while (iterations < maxIterations) {
    const testDistance = Math.floor(right / LINE_SPACING) * LINE_SPACING;
    if (testDistance <= 0) break;

    try {
      const optimalTilt = findOptimalTilt(testDistance, focalLength, cameraHeight);
      const params: ProjectionParams = {
        focalLength,
        tiltAngle: optimalTilt,
        cameraHeight: cameraHeight,
      };

      const gap = computePixelGap(testDistance, testDistance - LINE_SPACING, params);

      // If we can still achieve the minimum gap at this distance, double the bound
      if (gap >= minPixelGap) {
        left = right;
        right *= 2;
        iterations++;
      } else {
        // Found an upper bound where the gap is too small
        break;
      }
    } catch {
      // If projection fails, we've found the limit
      break;
    }
  }

  // Now perform binary search within the established bounds
  while (right - left > DISTANCE_TOLERANCE) {
    const mid = (left + right) / 2;
    const distance = Math.floor(mid / LINE_SPACING) * LINE_SPACING;

    if (distance <= 0) {
      left = mid;
      continue;
    }

    try {
      const optimalTilt = findOptimalTilt(distance, focalLength, cameraHeight);
      const params: ProjectionParams = {
        focalLength,
        tiltAngle: optimalTilt,
        cameraHeight: cameraHeight,
      };

      const gap = computePixelGap(distance, distance - LINE_SPACING, params);

      if (gap >= minPixelGap) {
        left = mid;
      } else {
        right = mid;
      }
    } catch {
      // If projection fails, this distance is too far
      right = mid;
    }
  }

  return Math.floor(left / LINE_SPACING) * LINE_SPACING;
}

// New interfaces for returning detailed results
export interface OptimalTiltResult {
  tiltRadians: number;
  tiltAngle: Angle;
}

export interface MaximumDistanceResult {
  distance: number;
  optimalAngle: Angle;
  lineCount: number;
}

export function findOptimalTiltWithAngle(
  targetDistance: number,
  focalLength: number,
  cameraHeight: number,
): OptimalTiltResult {
  const tiltRadians = findOptimalTilt(targetDistance, focalLength, cameraHeight);
  return {
    tiltRadians,
    tiltAngle: new Angle(tiltRadians),
  };
}

export function findMaximumDistanceWithDetails(
  focalLength: number,
  minPixelGap: number,
  cameraHeight: number,
): MaximumDistanceResult {
  let left = 0;
  let right = 1000; // Initial guess, will expand if needed
  const maxIterations = 50; // Safety limit to prevent infinite loops
  let iterations = 0;

  // First, expand the upper bound if needed
  while (iterations < maxIterations) {
    const testDistance = Math.floor(right / LINE_SPACING) * LINE_SPACING;
    if (testDistance <= 0) break;

    try {
      const optimalTilt = findOptimalTilt(testDistance, focalLength, cameraHeight);
      const params: ProjectionParams = {
        focalLength,
        tiltAngle: optimalTilt,
        cameraHeight: cameraHeight,
      };

      const gap = computePixelGap(testDistance, testDistance - LINE_SPACING, params);

      // If we can still achieve the minimum gap at this distance, double the bound
      if (gap >= minPixelGap) {
        left = right;
        right *= 2;
        iterations++;
      } else {
        // Found an upper bound where the gap is too small
        break;
      }
    } catch {
      // If projection fails, we've found the limit
      break;
    }
  }

  // Now perform binary search within the established bounds
  while (right - left > DISTANCE_TOLERANCE) {
    const mid = (left + right) / 2;
    const distance = Math.floor(mid / LINE_SPACING) * LINE_SPACING;

    if (distance <= 0) {
      left = mid;
      continue;
    }

    try {
      const optimalTilt = findOptimalTilt(distance, focalLength, cameraHeight);

      const params: ProjectionParams = {
        focalLength,
        tiltAngle: optimalTilt,
        cameraHeight: cameraHeight,
      };

      const gap = computePixelGap(distance, distance - LINE_SPACING, params);

      if (gap >= minPixelGap) {
        left = mid;
      } else {
        right = mid;
      }
    } catch {
      // If projection fails, this distance is too far
      right = mid;
    }
  }

  const finalDistance = Math.floor(left / LINE_SPACING) * LINE_SPACING;

  // For zero distance, return zero angle
  if (finalDistance === 0) {
    return {
      distance: 0,
      optimalAngle: new Angle(0),
      lineCount: 0,
    };
  }

  // Get the optimal angle for the final distance
  try {
    const finalOptimalTilt = findOptimalTilt(finalDistance, focalLength, cameraHeight);

    return {
      distance: finalDistance,
      optimalAngle: new Angle(finalOptimalTilt),
      lineCount: finalDistance / LINE_SPACING,
    };
  } catch {
    // If we can't find an optimal tilt for the final distance, return zero
    return {
      distance: 0,
      optimalAngle: new Angle(0),
      lineCount: 0,
    };
  }
}
