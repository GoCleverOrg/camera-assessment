import { ProjectionParams, Point2D } from '../types/camera-types';
import { SENSOR_HEIGHT, SENSOR_RES_Y, SENSOR_RES_X } from '../utils/constants';

export function projectGroundPoint(distance: number, params: ProjectionParams): Point2D {
  const { focalLength, tiltAngle, cameraHeight } = params;

  // Camera coordinates after rotation
  const yCam = -cameraHeight * Math.cos(tiltAngle) + distance * Math.sin(tiltAngle);
  const zCam = cameraHeight * Math.sin(tiltAngle) + distance * Math.cos(tiltAngle);

  // Avoid division by zero
  if (Math.abs(zCam) < 1e-10) {
    return { x: SENSOR_RES_X / 2, y: SENSOR_RES_Y / 2 };
  }

  // Project to image plane
  const yImage = focalLength * (yCam / zCam);

  // Convert to pixel coordinates
  const yPixel = (yImage / SENSOR_HEIGHT + 0.5) * SENSOR_RES_Y;

  return {
    x: SENSOR_RES_X / 2, // Always centered horizontally
    y: yPixel,
  };
}

export function computePixelGap(
  lineDistance: number,
  prevLineDistance: number,
  params: ProjectionParams,
): number {
  const currentProjection = projectGroundPoint(lineDistance, params);
  const prevProjection = projectGroundPoint(prevLineDistance, params);

  return Math.abs(currentProjection.y - prevProjection.y);
}
