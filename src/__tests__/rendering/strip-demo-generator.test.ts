import { generateStripDemoImage } from '../../rendering/strip-demo-generator';
import { Zoom } from '../../types/zoom';
import { NoVisibleStripsError, ImageGenerationError } from '../../errors/rendering-errors';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('generateStripDemoImage', () => {
  let testOutputDir: string;

  beforeEach(async () => {
    // Create a unique temporary directory for this test run
    testOutputDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'strip-demo-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.promises.rm(testOutputDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('successful generation', () => {
    it('should generate an image with visible strips', async () => {
      const zoom = new Zoom(1);
      const minPixelGap = 10;
      const outputPath = path.join(testOutputDir, 'test-strips.png');

      const result = await generateStripDemoImage(zoom, minPixelGap, outputPath, false);

      expect(result).toMatchObject({
        outputPath,
        dimensions: {
          width: 2560,
          height: 1440,
        },
        stripCount: expect.any(Number) as number,
        metadata: {
          renderTime: expect.any(Number) as number,
          fileSize: expect.any(Number) as number,
          format: 'png',
        },
      });

      expect(result.stripCount).toBeGreaterThan(0);

      // Verify file exists
      const stats = await fs.promises.stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should generate an image with transparent background', async () => {
      const zoom = new Zoom(1);
      const minPixelGap = 5;
      const outputPath = path.join(testOutputDir, 'test-transparent.png');

      const result = await generateStripDemoImage(zoom, minPixelGap, outputPath, true);

      expect(result.outputPath).toBe(outputPath);
      expect(result.stripCount).toBeGreaterThan(0);

      // Verify file exists
      const stats = await fs.promises.stat(outputPath);
      expect(stats.isFile()).toBe(true);
    });

    it('should handle minimum zoom level', async () => {
      const zoom = new Zoom(1);
      const minPixelGap = 10;
      const outputPath = path.join(testOutputDir, 'test-min-zoom.png');

      const result = await generateStripDemoImage(zoom, minPixelGap, outputPath);

      expect(result.stripCount).toBeGreaterThan(0);
    });

    it('should handle higher zoom levels', async () => {
      const zoom = new Zoom(2);
      const minPixelGap = 5;
      const outputPath = path.join(testOutputDir, 'test-max-zoom.png');

      const result = await generateStripDemoImage(zoom, minPixelGap, outputPath);

      expect(result.stripCount).toBeGreaterThan(0);
    });
  });

  describe('error cases', () => {
    it('should throw NoVisibleStripsError when no strips are visible', async () => {
      const zoom = new Zoom(1);
      const minPixelGap = 1400; // Very large gap that prevents any strips
      const outputPath = path.join(testOutputDir, 'test-no-strips.png');

      await expect(generateStripDemoImage(zoom, minPixelGap, outputPath)).rejects.toThrow(
        NoVisibleStripsError,
      );
    });

    it('should throw error for invalid output path', async () => {
      const zoom = new Zoom(1);
      const minPixelGap = 10;
      const invalidPath = '/invalid/path/that/does/not/exist/image.png';

      await expect(generateStripDemoImage(zoom, minPixelGap, invalidPath)).rejects.toThrow(
        ImageGenerationError,
      );
    });
  });

  describe('integration with camera analysis', () => {
    it('should produce consistent results for the same input', async () => {
      const zoom = new Zoom(1);
      const minPixelGap = 10;
      const outputPath1 = path.join(testOutputDir, 'test-consistent-1.png');
      const outputPath2 = path.join(testOutputDir, 'test-consistent-2.png');

      const result1 = await generateStripDemoImage(zoom, minPixelGap, outputPath1);

      const result2 = await generateStripDemoImage(zoom, minPixelGap, outputPath2);

      expect(result1.stripCount).toBe(result2.stripCount);
      expect(result1.dimensions).toEqual(result2.dimensions);
    });

    it('should generate fewer strips with larger pixel gaps', async () => {
      const zoom = new Zoom(1);
      const outputPath1 = path.join(testOutputDir, 'test-small-gap.png');
      const outputPath2 = path.join(testOutputDir, 'test-large-gap.png');

      const result1 = await generateStripDemoImage(
        zoom,
        5, // Small gap
        outputPath1,
      );

      const result2 = await generateStripDemoImage(
        zoom,
        20, // Large gap
        outputPath2,
      );

      expect(result1.stripCount).toBeGreaterThan(result2.stripCount);
    });
  });
});
