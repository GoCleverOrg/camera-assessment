import { InvalidZoomLevelError } from '../errors/camera-errors';
import { F_MIN, F_MAX } from '../utils/constants';

/**
 * Represents a camera zoom level with validation and focal length calculation.
 * Zoom levels must be at least 1.
 */
export class Zoom {
  private _level: number;
  private _focalLength: number | undefined;

  /**
   * Creates a Zoom instance with validation.
   * @param level - The zoom level, must be at least 1
   * @throws {InvalidZoomLevelError} If zoom level is less than 1
   */
  constructor(level: number) {
    if (level < 1) {
      throw new InvalidZoomLevelError(level);
    }
    this._level = level;
  }

  /**
   * Gets the zoom level.
   */
  get level(): number {
    return this._level;
  }

  /**
   * Gets the focal length for this zoom level.
   * The value is cached after the first calculation.
   */
  get focalLength(): number {
    if (this._focalLength === undefined) {
      this._focalLength = Math.min(F_MIN * this._level, F_MAX);
    }
    return this._focalLength;
  }
}
