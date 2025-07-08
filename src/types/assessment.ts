import { Angle } from './angle';

/**
 * Represents the analysis results of a camera view.
 * Contains information about the camera's viewing parameters and what it can see.
 */
export interface CameraViewAnalysis {
  /**
   * The distance from the camera to the subject in meters.
   */
  distanceInMeters: number;

  /**
   * The tilt angle of the camera.
   * Positive angles indicate the camera is tilted downward.
   */
  tiltAngle: Angle;

  /**
   * The number of lines visible in the camera view.
   * This could represent parking lines, road markings, or other linear features.
   */
  lineCount: number;

  /**
   * The focal length of the camera lens in millimeters.
   */
  focalLength: number;
}
