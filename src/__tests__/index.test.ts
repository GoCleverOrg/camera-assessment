import { describe, it, expect } from '@jest/globals';
import {
  analyzeCameraView,
  Zoom,
  Angle,
  CameraAssessmentError,
  ImpossibleConstraintError,
  InvalidZoomLevelError,
} from '../index';

describe('index exports', () => {
  describe('Main API exports', () => {
    it('should export analyzeCameraView function', () => {
      expect(analyzeCameraView).toBeDefined();
      expect(typeof analyzeCameraView).toBe('function');
    });

    it('should export Zoom class', () => {
      expect(Zoom).toBeDefined();
      expect(typeof Zoom).toBe('function');
      const zoom = new Zoom(5);
      expect(zoom).toBeInstanceOf(Zoom);
    });

    it('should export Angle class', () => {
      expect(Angle).toBeDefined();
      expect(typeof Angle).toBe('function');
      const angle = new Angle(0.5);
      expect(angle).toBeInstanceOf(Angle);
    });
  });

  describe('Error class exports', () => {
    it('should export CameraAssessmentError', () => {
      expect(CameraAssessmentError).toBeDefined();
      expect(typeof CameraAssessmentError).toBe('function');
    });

    it('should export ImpossibleConstraintError', () => {
      expect(ImpossibleConstraintError).toBeDefined();
      expect(typeof ImpossibleConstraintError).toBe('function');
    });

    it('should export InvalidZoomLevelError', () => {
      expect(InvalidZoomLevelError).toBeDefined();
      expect(typeof InvalidZoomLevelError).toBe('function');
    });
  });

  describe('Integration test', () => {
    it('should work with the exported analyzeCameraView function', () => {
      const zoom = new Zoom(5);
      const result = analyzeCameraView(zoom, 10);

      expect(result).toHaveProperty('distanceInMeters');
      expect(result).toHaveProperty('tiltAngle');
      expect(result).toHaveProperty('lineCount');
      expect(result).toHaveProperty('focalLength');
    });
  });
});
