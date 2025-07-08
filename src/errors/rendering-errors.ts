import { CameraAssessmentError } from './camera-errors';

/**
 * Error thrown when no visible strips are detected in the camera analysis.
 * This typically occurs when the camera configuration or positioning
 * results in no ground markings being visible in the frame.
 */
export class NoVisibleStripsError extends CameraAssessmentError {
  public readonly code = 'NO_VISIBLE_STRIPS';

  constructor(message = 'No visible strips detected in the camera frame') {
    super(message);
    this.name = 'NoVisibleStripsError';
    Object.setPrototypeOf(this, NoVisibleStripsError.prototype);
  }
}

/**
 * Error thrown when image generation fails.
 * This can occur due to various reasons such as invalid parameters,
 * file system issues, or rendering failures.
 */
export class ImageGenerationError extends CameraAssessmentError {
  public readonly code = 'IMAGE_GENERATION_FAILED';

  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'ImageGenerationError';
    Object.setPrototypeOf(this, ImageGenerationError.prototype);
  }
}
