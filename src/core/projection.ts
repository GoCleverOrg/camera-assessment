import { ProjectionParams, Point2D } from '../types/camera-types';
import { SENSOR_HEIGHT, SENSOR_RES_Y, SENSOR_RES_X } from '../utils/constants';

export function projectGroundPoint(distance: number, params: ProjectionParams): Point2D {
  const { focalLength, tiltAngle, cameraHeight } = params;

  // Camera coordinates after rotation
  // Correct rotation matrix for pitch-down by tiltAngle (positive = down)
  // For ground point at (0, -cameraHeight, distance) in world coordinates
  const yCam = -cameraHeight * Math.cos(tiltAngle) - distance * Math.sin(tiltAngle);
  const zCam = -cameraHeight * Math.sin(tiltAngle) + distance * Math.cos(tiltAngle);

  // Sanity check: point must be in front of camera
  if (zCam <= 0) {
    throw new Error('Point behind the camera');
  }

  // Project to image plane (in mm)
  const yImage = focalLength * (yCam / zCam);

  // Convert to pixel coordinates
  // yImage is negative for ground points, need to flip for screen coordinates
  // Screen origin is top-left, so smaller yPixel = higher on screen = farther away
  const normalizedY = -yImage / (SENSOR_HEIGHT / 2);
  const yPixel = (0.5 + normalizedY / 2) * SENSOR_RES_Y;

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
