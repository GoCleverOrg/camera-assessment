import { SENSOR_RES_Y } from './utils/constants';
import { getFocalLength } from './utils/math-helpers';
import { findMaximumDistance } from './core/optimization';

/**
 * Computes the maximum horizontal ground distance from the camera to the furthest
 * visible line while maintaining minimum pixel separation between consecutive lines.
 *
 * @param zoomLevel - Camera zoom level (1-25)
 * @param minPixelGap - Minimum vertical pixel separation between consecutive lines
 * @returns Maximum distance in meters (multiple of 2m line spacing)
 */
export function computeMaxDistance(zoomLevel: number, minPixelGap: number): number {
  // Validate inputs
  if (minPixelGap > SENSOR_RES_Y) {
    return 0; // Impossible constraint
  }

  if (minPixelGap === SENSOR_RES_Y) {
    return 2; // Only one line pair can fit
  }

  // Calculate focal length for given zoom
  const focalLength = getFocalLength(zoomLevel);

  // Find maximum distance using optimization
  return findMaximumDistance(focalLength, minPixelGap);
}
