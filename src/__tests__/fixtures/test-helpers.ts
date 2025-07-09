import { Zoom } from '../../types/zoom';
import { findOptimalTilt } from '../../core/optimization';
import { computePixelGap } from '../../core/projection';
import { DEFAULT_CAMERA_HEIGHT, LINE_SPACING } from '../../utils/constants';

export function computeTheoreticalGap(
  zoomLevel: number,
  numLines: number,
  cameraHeight?: number,
): number {
  const distance = numLines * LINE_SPACING;
  const zoom = new Zoom(zoomLevel);
  const focalLength = zoom.focalLength;
  const optimalTilt = findOptimalTilt(distance, focalLength, cameraHeight ?? DEFAULT_CAMERA_HEIGHT);

  const params = {
    focalLength,
    tiltAngle: optimalTilt,
    cameraHeight: cameraHeight ?? DEFAULT_CAMERA_HEIGHT,
  };

  return computePixelGap(distance, distance - LINE_SPACING, params);
}
