import { analyzeCameraView } from '../analyze-camera-view';
import { generateStripVisualizations } from '../rendering/strip-visualizer';
import { Zoom } from '../types/zoom';

describe('Integration: Strip Visualization', () => {
  it('should generate strip visualizations from camera analysis', () => {
    // Create a zoom instance
    const zoom = new Zoom(1);

    // Analyze camera view with a minimum pixel gap requirement
    const analysis = analyzeCameraView(zoom, 10);

    // Generate strip visualizations
    const strips = generateStripVisualizations(analysis);

    // Verify we have visualizations
    expect(strips.length).toBeGreaterThan(0);
    expect(strips.length).toBeLessThanOrEqual(analysis.lineCount);

    // Verify strip properties
    strips.forEach((strip, index) => {
      expect(strip.position).toBeGreaterThanOrEqual(0);
      expect(strip.position).toBeLessThanOrEqual(1);

      if (index === 0) {
        expect(strip.distance).toBe(0);
      } else {
        expect(strip.distance).toBeGreaterThan(0);
      }
    });

    // Verify highlighting
    if (strips.length >= 2) {
      expect(strips[strips.length - 2].isHighlighted).toBe(true);
      expect(strips[strips.length - 1].isHighlighted).toBe(true);
    }
  });

  it('should handle different zoom levels appropriately', () => {
    const testCases = [
      { zoom: 1, minGap: 100 },
      { zoom: 5, minGap: 50 },
      { zoom: 15, minGap: 20 },
      { zoom: 25, minGap: 10 },
    ];

    testCases.forEach(({ zoom, minGap }) => {
      const zoomInstance = new Zoom(zoom);
      const analysis = analyzeCameraView(zoomInstance, minGap);
      const strips = generateStripVisualizations(analysis);

      // Should always produce valid visualizations
      expect(Array.isArray(strips)).toBe(true);

      // If we have strips, they should be valid
      if (strips.length > 0) {
        expect(strips[0].position).toBeGreaterThanOrEqual(0);
        expect(strips[0].position).toBeLessThanOrEqual(1);
      }
    });
  });

  it('should produce consistent results for the same input', () => {
    const zoom = new Zoom(8);
    const analysis = analyzeCameraView(zoom, 30);

    const strips1 = generateStripVisualizations(analysis);
    const strips2 = generateStripVisualizations(analysis);

    expect(strips1).toEqual(strips2);
  });
});
