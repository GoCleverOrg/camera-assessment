// Main API function
export { analyzeCameraView } from './analyze-camera-view';

// Types and classes
export { Zoom } from './types/zoom';
export { Angle } from './types/angle';
export type { CameraViewAnalysis } from './types/assessment';
export type { CameraConfig, ProjectionParams } from './types/camera-types';
export type { StripVisualization, StripRenderResult } from './types/rendering';

// Error classes
export {
  CameraAssessmentError,
  ImpossibleConstraintError,
  InvalidZoomLevelError,
} from './errors/camera-errors';
export { NoVisibleStripsError, ImageGenerationError } from './errors/rendering-errors';

// Rendering utilities
export { generateStripVisualizations } from './rendering/strip-visualizer';
export { generateStripDemoImage } from './rendering/strip-demo-generator';

// Table formatting utilities
export { TableFormatter, type TableRow } from './utils/table-formatter';
