// Main API function
export { analyzeCameraView } from './analyze-camera-view';

// Types and classes
export { Zoom } from './types/zoom';
export { Angle } from './types/angle';
export type { CameraViewAnalysis } from './types/assessment';
export type { CameraConfig, ProjectionParams } from './types/camera-types';

// Error classes
export {
  CameraAssessmentError,
  ImpossibleConstraintError,
  InvalidZoomLevelError,
} from './errors/camera-errors';
