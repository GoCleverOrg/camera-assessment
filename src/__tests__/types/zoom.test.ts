import { Zoom } from '../../types/zoom';
import { InvalidZoomLevelError } from '../../errors/camera-errors';
import { F_MIN, F_MAX } from '../../utils/constants';

describe('Zoom', () => {
  describe('constructor', () => {
    it('should create a zoom instance with valid zoom level', () => {
      const zoom = new Zoom(5);
      expect(zoom.level).toBe(5);
    });

    it('should accept minimum zoom level of 1', () => {
      const zoom = new Zoom(1);
      expect(zoom.level).toBe(1);
    });

    it('should accept maximum zoom level of 25', () => {
      const zoom = new Zoom(25);
      expect(zoom.level).toBe(25);
    });

    it('should accept zoom level in the middle of the range', () => {
      const zoom = new Zoom(12.5);
      expect(zoom.level).toBe(12.5);
    });

    it('should throw InvalidZoomLevelError for zoom level below 1', () => {
      expect(() => new Zoom(0)).toThrow(InvalidZoomLevelError);
      expect(() => new Zoom(0.5)).toThrow(InvalidZoomLevelError);
      expect(() => new Zoom(-1)).toThrow(InvalidZoomLevelError);
    });

    it('should throw InvalidZoomLevelError for zoom level above 25', () => {
      expect(() => new Zoom(26)).toThrow(InvalidZoomLevelError);
      expect(() => new Zoom(25.1)).toThrow(InvalidZoomLevelError);
      expect(() => new Zoom(100)).toThrow(InvalidZoomLevelError);
    });

    it('should throw InvalidZoomLevelError with descriptive message', () => {
      expect(() => new Zoom(0)).toThrow('Zoom level must be between 1 and 25, got: 0');
      expect(() => new Zoom(30)).toThrow('Zoom level must be between 1 and 25, got: 30');
    });
  });

  describe('focalLength getter', () => {
    it('should return focal length calculated correctly', () => {
      const zoomLevel = 5;
      const zoom = new Zoom(zoomLevel);
      const expectedFocalLength = Math.min(F_MIN * zoomLevel, F_MAX);
      expect(zoom.focalLength).toBe(expectedFocalLength);
    });

    it('should cache the focal length value', () => {
      const zoom = new Zoom(10);
      const focalLength1 = zoom.focalLength;
      const focalLength2 = zoom.focalLength;
      expect(focalLength1).toBe(focalLength2);
    });

    it('should calculate different focal lengths for different zoom levels', () => {
      const zoom1 = new Zoom(1);
      const zoom2 = new Zoom(10);
      const zoom3 = new Zoom(25);

      expect(zoom1.focalLength).toBe(Math.min(F_MIN * 1, F_MAX));
      expect(zoom2.focalLength).toBe(Math.min(F_MIN * 10, F_MAX));
      expect(zoom3.focalLength).toBe(Math.min(F_MIN * 25, F_MAX));

      // Ensure they are different (assuming getFocalLength returns different values)
      expect(zoom1.focalLength).not.toBe(zoom2.focalLength);
    });
  });

  describe('level getter', () => {
    it('should return the zoom level', () => {
      const zoomLevel = 7.5;
      const zoom = new Zoom(zoomLevel);
      expect(zoom.level).toBe(zoomLevel);
    });
  });
});
