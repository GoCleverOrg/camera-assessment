/**
 * Represents an angle with efficient conversion between radians and degrees.
 * The angle is stored internally in radians, and degrees are cached on first access.
 */
export class Angle {
  private _radians: number;
  private _degrees: number | undefined;

  /**
   * Creates an Angle instance from radians.
   * @param radians - The angle in radians
   */
  constructor(radians: number) {
    this._radians = radians;
  }

  /**
   * Creates an Angle instance from degrees.
   * @param degrees - The angle in degrees
   * @returns A new Angle instance
   */
  static fromDegrees(degrees: number): Angle {
    return new Angle(degrees * (Math.PI / 180));
  }

  /**
   * Gets the angle in radians.
   */
  get radians(): number {
    return this._radians;
  }

  /**
   * Gets the angle in degrees. The value is cached after the first calculation.
   */
  get degrees(): number {
    if (this._degrees === undefined) {
      this._degrees = this._radians * (180 / Math.PI);
    }
    return this._degrees;
  }
}
