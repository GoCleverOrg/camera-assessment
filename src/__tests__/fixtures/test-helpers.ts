import { getFocalLength } from '../../utils/math-helpers';
import { findOptimalTilt } from '../../core/optimization';
import { computePixelGap } from '../../core/projection';
import { CAMERA_HEIGHT, LINE_SPACING } from '../../utils/constants';

export function computeTheoreticalGap(zoomLevel: number, numLines: number): number {
  const distance = numLines * LINE_SPACING;
  const focalLength = getFocalLength(zoomLevel);
  const optimalTilt = findOptimalTilt(distance, focalLength);

  const params = {
    focalLength,
    tiltAngle: optimalTilt,
    cameraHeight: CAMERA_HEIGHT,
  };

  return computePixelGap(distance, distance - LINE_SPACING, params);
}
