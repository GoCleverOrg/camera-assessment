import { Zoom } from './types/zoom';
import { CameraViewAnalysis } from './types/assessment';
import { ImpossibleConstraintError } from './errors/camera-errors';
import { findMaximumDistanceWithDetails, findOptimalTiltWithAngle } from './core/optimization';
import { SENSOR_RES_Y, LINE_SPACING } from './utils/constants';

/**
 * Analyzes the camera view for a given zoom level and minimum pixel gap requirement.
 *
 * @param zoom - The Zoom instance representing the camera's zoom level
 * @param minPixelGap - Minimum vertical pixel separation between consecutive lines
 * @returns A CameraViewAnalysis object containing distance, tilt angle, line count, and focal length
 * @throws {ImpossibleConstraintError} When the minimum pixel gap exceeds the sensor height
 */
export function analyzeCameraView(zoom: Zoom, minPixelGap: number): CameraViewAnalysis {
  // Validate that the constraint is possible
  if (minPixelGap > SENSOR_RES_Y) {
    throw new ImpossibleConstraintError(
      `Impossible constraint: minimum pixel gap (${minPixelGap}) exceeds sensor height (${SENSOR_RES_Y})`,
    );
  }

  // Get focal length from the Zoom instance
  const focalLength = zoom.focalLength;

  // Special case: when minPixelGap equals SENSOR_RES_Y, only one line can fit
  if (minPixelGap === SENSOR_RES_Y) {
    // Find optimal angle for viewing a single line at 2m distance
    const { tiltAngle } = findOptimalTiltWithAngle(LINE_SPACING, focalLength);
    return {
      distanceInMeters: LINE_SPACING,
      tiltAngle: tiltAngle,
      lineCount: 1,
      focalLength: focalLength,
    };
  }

  // Use computeMaxDistanceDetailed logic through findMaximumDistanceWithDetails
  const result = findMaximumDistanceWithDetails(focalLength, minPixelGap);

  // Return the analysis in the expected format
  return {
    distanceInMeters: result.distance,
    tiltAngle: result.optimalAngle,
    lineCount: result.lineCount,
    focalLength: focalLength,
  };
}
