import { CameraViewAnalysis } from '../../types/assessment';
import { Angle } from '../../types/angle';

describe('CameraViewAnalysis interface', () => {
  it('should accept valid camera view analysis data', () => {
    const analysis: CameraViewAnalysis = {
      distanceInMeters: 10.5,
      tiltAngle: new Angle(Math.PI / 4),
      lineCount: 5,
      focalLength: 35,
    };

    expect(analysis.distanceInMeters).toBe(10.5);
    expect(analysis.tiltAngle).toBeInstanceOf(Angle);
    expect(analysis.tiltAngle.radians).toBe(Math.PI / 4);
    expect(analysis.lineCount).toBe(5);
    expect(analysis.focalLength).toBe(35);
  });

  it('should work with zero values', () => {
    const analysis: CameraViewAnalysis = {
      distanceInMeters: 0,
      tiltAngle: new Angle(0),
      lineCount: 0,
      focalLength: 0,
    };

    expect(analysis.distanceInMeters).toBe(0);
    expect(analysis.tiltAngle.radians).toBe(0);
    expect(analysis.lineCount).toBe(0);
    expect(analysis.focalLength).toBe(0);
  });

  it('should work with large values', () => {
    const analysis: CameraViewAnalysis = {
      distanceInMeters: 1000,
      tiltAngle: Angle.fromDegrees(90),
      lineCount: 100,
      focalLength: 1200,
    };

    expect(analysis.distanceInMeters).toBe(1000);
    expect(analysis.tiltAngle.degrees).toBeCloseTo(90);
    expect(analysis.lineCount).toBe(100);
    expect(analysis.focalLength).toBe(1200);
  });

  it('should work with decimal values', () => {
    const analysis: CameraViewAnalysis = {
      distanceInMeters: 15.75,
      tiltAngle: Angle.fromDegrees(45.5),
      lineCount: 7,
      focalLength: 50.5,
    };

    expect(analysis.distanceInMeters).toBe(15.75);
    expect(analysis.tiltAngle.degrees).toBeCloseTo(45.5);
    expect(analysis.lineCount).toBe(7);
    expect(analysis.focalLength).toBe(50.5);
  });
});
