/**
 * Base error class for all camera assessment related errors.
 */
export class CameraAssessmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CameraAssessmentError';
    // Maintains proper stack trace for where our error was thrown
    Object.setPrototypeOf(this, CameraAssessmentError.prototype);
  }
}

/**
 * Error thrown when a constraint is impossible to satisfy.
 * For example, when trying to achieve a combination of parameters that
 * cannot physically work together.
 */
export class ImpossibleConstraintError extends CameraAssessmentError {
  constructor(message: string) {
    super(message);
    this.name = 'ImpossibleConstraintError';
    Object.setPrototypeOf(this, ImpossibleConstraintError.prototype);
  }
}

/**
 * Error thrown when an invalid zoom level is provided.
 * Zoom levels must be at least 1.
 */
export class InvalidZoomLevelError extends CameraAssessmentError {
  constructor(zoomLevel: number) {
    super(`Zoom level must be at least 1, got: ${zoomLevel}`);
    this.name = 'InvalidZoomLevelError';
    Object.setPrototypeOf(this, InvalidZoomLevelError.prototype);
  }
}
