import { CameraViewAnalysis } from '../types/assessment';
import { StripVisualization } from '../types/rendering';
import { ProjectionParams } from '../types/camera-types';
import { projectGroundPoint } from '../core/projection';
import { DEFAULT_CAMERA_HEIGHT, LINE_SPACING, SENSOR_RES_Y } from '../utils/constants';

/**
 * Generates strip visualizations for a camera view analysis.
 *
 * This function calculates the pixel positions of ground strips (lines) as seen by the camera,
 * based on the camera's tilt angle and focal length. It marks the furthest two visible strips
 * as highlighted.
 *
 * @param analysis - The camera view analysis containing tilt angle, line count, and focal length
 * @param cameraHeight - Camera height in meters (default: 20)
 * @returns Array of strip visualizations with pixel positions and highlight status
 * @throws Error if analysis contains invalid parameters
 */
export function generateStripVisualizations(
  analysis: CameraViewAnalysis,
  cameraHeight?: number,
): StripVisualization[] {
  // Validate input
  if (!analysis || typeof analysis !== 'object') {
    throw new Error('Invalid analysis object provided');
  }

  const { tiltAngle, lineCount, focalLength, distanceInMeters } = analysis;

  // Validate required fields
  if (typeof lineCount !== 'number' || lineCount < 0) {
    throw new Error('Invalid line count in analysis');
  }

  if (typeof focalLength !== 'number' || focalLength <= 0) {
    throw new Error('Invalid focal length in analysis');
  }

  if (typeof distanceInMeters !== 'number' || distanceInMeters <= 0) {
    throw new Error('Invalid distance in analysis');
  }

  // Handle empty case
  if (lineCount === 0) {
    return [];
  }

  // Get the tilt angle value in radians
  const tiltAngleRadians =
    typeof tiltAngle === 'object' && tiltAngle !== null && 'radians' in tiltAngle
      ? tiltAngle.radians
      : (tiltAngle as number);

  if (typeof tiltAngleRadians !== 'number' || isNaN(tiltAngleRadians)) {
    throw new Error('Invalid tilt angle in analysis');
  }

  // Create projection parameters
  const projectionParams: ProjectionParams = {
    focalLength,
    tiltAngle: tiltAngleRadians,
    cameraHeight: cameraHeight ?? DEFAULT_CAMERA_HEIGHT,
  };

  const visualizations: StripVisualization[] = [];
  let previousYPixel: number | null = null;

  // Calculate positions for each line
  for (let i = 0; i < lineCount; i++) {
    // Calculate the distance to this line from the camera
    // Lines are positioned from LINE_SPACING up to distanceInMeters
    // The first line is at LINE_SPACING, the last at distanceInMeters
    const lineIndex = i + 1; // 1-based index
    const lineDistance = lineIndex * LINE_SPACING;

    try {
      // Project the ground point to pixel coordinates
      const projectedPoint = projectGroundPoint(lineDistance, projectionParams);
      const yPixel = projectedPoint.y;

      // Skip strips that are outside the visible area (0 to SENSOR_RES_Y)
      // Allow a small margin for numerical precision
      if (yPixel < -0.5 || yPixel > SENSOR_RES_Y + 0.5) {
        continue;
      }

      // Clamp to valid range
      const clampedYPixel = Math.max(0, Math.min(SENSOR_RES_Y, yPixel));

      // Calculate distance from previous strip
      const pixelDistance = previousYPixel !== null ? Math.abs(clampedYPixel - previousYPixel) : 0;

      // Determine if this strip should be highlighted
      // Highlight the furthest two strips (last two in the array)
      const isHighlighted = false; // Will be set later based on final array

      // Normalize position to 0-1 range
      const normalizedPosition = clampedYPixel / SENSOR_RES_Y;

      visualizations.push({
        position: normalizedPosition,
        distance: pixelDistance,
        isHighlighted,
      });

      previousYPixel = clampedYPixel;
    } catch {
      // Handle projection errors gracefully
      // Skip this strip if projection fails
      continue;
    }
  }

  // Mark the last two strips as highlighted (if we have at least 2 strips)
  if (visualizations.length >= 2) {
    visualizations[visualizations.length - 2].isHighlighted = true;
    visualizations[visualizations.length - 1].isHighlighted = true;
  } else if (visualizations.length === 1) {
    // If we only have one strip, highlight it
    visualizations[0].isHighlighted = true;
  }

  return visualizations;
}
