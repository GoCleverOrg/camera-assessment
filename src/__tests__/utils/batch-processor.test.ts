import { processBatch, getSuccessfulResults, getFailedResults } from '../../utils/batch-processor';
import { BatchResult, BatchProcessingOptions } from '../../utils/batch-processor';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Angle } from '../../types/angle';

describe('Batch Processor', () => {
  let testOutputDir: string;

  beforeEach(() => {
    // Create a unique temporary directory for this test run
    testOutputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'batch-processor-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('processBatch', () => {
    it('should process multiple zoom levels successfully', async () => {
      const zoomLevels = [1, 5, 10];
      const options: BatchProcessingOptions = {
        gap: 45,
        generateImage: false,
      };

      const results = await processBatch(zoomLevels, options);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.zoomLevel).toBe(zoomLevels[index]);
        expect(result.success).toBe(true);
        expect(result.analysis).toBeDefined();
        expect(result.analysis?.distanceInMeters).toBeGreaterThan(0);
        expect(result.analysis?.lineCount).toBeGreaterThan(0);
        expect(result.error).toBeUndefined();
      });
    });

    it('should handle partial failures gracefully', async () => {
      const zoomLevels = [1, 0, 10]; // 0 is invalid (must be at least 1)
      const options: BatchProcessingOptions = {
        gap: 45,
        generateImage: false,
      };

      const results = await processBatch(zoomLevels, options);

      expect(results).toHaveLength(3);

      // First zoom level should succeed
      expect(results[0].zoomLevel).toBe(1);
      expect(results[0].success).toBe(true);
      expect(results[0].analysis).toBeDefined();

      // Second zoom level should fail
      expect(results[1].zoomLevel).toBe(0);
      expect(results[1].success).toBe(false);
      expect(results[1].analysis).toBeUndefined();
      expect(results[1].error).toContain('must be at least 1');

      // Third zoom level should still succeed
      expect(results[2].zoomLevel).toBe(10);
      expect(results[2].success).toBe(true);
      expect(results[2].analysis).toBeDefined();
    });

    it('should aggregate results correctly for successful zoom levels', async () => {
      const zoomLevels = [5, 10, 15];
      const options: BatchProcessingOptions = {
        gap: 30,
        generateImage: false,
      };

      const results = await processBatch(zoomLevels, options);

      // All should succeed with reasonable gap
      expect(results.every((r) => r.success)).toBe(true);

      // Verify each result has proper analysis data
      results.forEach((result) => {
        expect(result.analysis).toBeDefined();
        expect(result.analysis?.focalLength).toBeGreaterThan(0);
        expect(result.analysis?.tiltAngle).toBeDefined();
        expect(result.analysis?.tiltAngle.degrees).toBeGreaterThan(0);
      });

      // Higher zoom levels should have longer focal lengths
      expect(results[1].analysis!.focalLength).toBeGreaterThan(results[0].analysis!.focalLength);
      expect(results[2].analysis!.focalLength).toBeGreaterThan(results[1].analysis!.focalLength);
    });

    it('should generate images when requested', async () => {
      const zoomLevels = [5];
      const options: BatchProcessingOptions = {
        gap: 45,
        generateImage: true,
        outputBasePath: path.join(testOutputDir, 'batch-test.png'),
      };

      const results = await processBatch(zoomLevels, options);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].imagePath).toBeDefined();
      expect(results[0].imagePath).toContain('batch-test.png-z5-g45.png');

      // Verify image file exists
      expect(fs.existsSync(results[0].imagePath!)).toBe(true);
    });

    it('should handle image generation paths correctly', async () => {
      const zoomLevels = [3, 7];
      const options: BatchProcessingOptions = {
        gap: 50,
        generateImage: true,
        outputBasePath: path.join(testOutputDir, 'custom', 'path', 'image.png'),
        transparent: true,
      };

      const results = await processBatch(zoomLevels, options);

      expect(results).toHaveLength(2);

      // Check first zoom level
      expect(results[0].imagePath).toBeDefined();
      expect(results[0].imagePath).toContain('custom/path');
      expect(results[0].imagePath).toContain('image.png-z3-g50-transparent.png');

      // Check second zoom level
      expect(results[1].imagePath).toBeDefined();
      expect(results[1].imagePath).toContain('custom/path');
      expect(results[1].imagePath).toContain('image.png-z7-g50-transparent.png');
    });

    it('should handle impossible constraints', async () => {
      const zoomLevels = [5, 10];
      const options: BatchProcessingOptions = {
        gap: 5000, // Impossible gap (exceeds sensor height)
        generateImage: false,
      };

      const results = await processBatch(zoomLevels, options);

      expect(results).toHaveLength(2);
      results.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toContain('Impossible constraint');
        expect(result.analysis).toBeUndefined();
      });
    });

    it('should process empty zoom levels array', async () => {
      const zoomLevels: number[] = [];
      const options: BatchProcessingOptions = {
        gap: 45,
        generateImage: false,
      };

      const results = await processBatch(zoomLevels, options);

      expect(results).toHaveLength(0);
    });

    it('should handle analysis success with image generation failure', async () => {
      const zoomLevels = [5];
      const options: BatchProcessingOptions = {
        gap: 45,
        generateImage: true,
        // Use an invalid path that will cause image generation to fail
        outputBasePath: '/invalid\0path/image.png', // Null character in path
      };

      const results = await processBatch(zoomLevels, options);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true); // Analysis still succeeded
      expect(results[0].analysis).toBeDefined();
      expect(results[0].error).toContain('Analysis succeeded but image generation failed');
      expect(results[0].imagePath).toBeUndefined();
    });
  });

  describe('getSuccessfulResults', () => {
    it('should filter only successful results with analysis', () => {
      const results: BatchResult[] = [
        {
          zoomLevel: 5,
          success: true,
          analysis: {
            distanceInMeters: 10,
            tiltAngle: Angle.fromDegrees(45),
            lineCount: 5,
            focalLength: 50,
          },
        },
        {
          zoomLevel: 50,
          success: false,
          error: 'Invalid zoom level',
        },
        {
          zoomLevel: 10,
          success: true,
          analysis: {
            distanceInMeters: 15,
            tiltAngle: Angle.fromDegrees(40),
            lineCount: 7,
            focalLength: 100,
          },
        },
      ];

      const successful = getSuccessfulResults(results);

      expect(successful).toHaveLength(2);
      expect(successful[0].zoomLevel).toBe(5);
      expect(successful[1].zoomLevel).toBe(10);
      expect(successful.every((r) => r.analysis !== undefined)).toBe(true);
    });

    it('should return empty array when all results failed', () => {
      const results: BatchResult[] = [
        {
          zoomLevel: 50,
          success: false,
          error: 'Invalid zoom level',
        },
        {
          zoomLevel: 100,
          success: false,
          error: 'Invalid zoom level',
        },
      ];

      const successful = getSuccessfulResults(results);

      expect(successful).toHaveLength(0);
    });
  });

  describe('getFailedResults', () => {
    it('should filter only failed results with errors', () => {
      const results: BatchResult[] = [
        {
          zoomLevel: 5,
          success: true,
          analysis: {
            distanceInMeters: 10,
            tiltAngle: Angle.fromDegrees(45),
            lineCount: 5,
            focalLength: 50,
          },
        },
        {
          zoomLevel: 50,
          success: false,
          error: 'Invalid zoom level',
        },
        {
          zoomLevel: 100,
          success: false,
          error: 'Invalid zoom level',
        },
      ];

      const failed = getFailedResults(results);

      expect(failed).toHaveLength(2);
      expect(failed[0].zoomLevel).toBe(50);
      expect(failed[1].zoomLevel).toBe(100);
      expect(failed.every((r) => r.error !== undefined)).toBe(true);
    });

    it('should return empty array when all results succeeded', () => {
      const results: BatchResult[] = [
        {
          zoomLevel: 5,
          success: true,
          analysis: {
            distanceInMeters: 10,
            tiltAngle: Angle.fromDegrees(45),
            lineCount: 5,
            focalLength: 50,
          },
        },
        {
          zoomLevel: 10,
          success: true,
          analysis: {
            distanceInMeters: 15,
            tiltAngle: Angle.fromDegrees(40),
            lineCount: 7,
            focalLength: 100,
          },
        },
      ];

      const failed = getFailedResults(results);

      expect(failed).toHaveLength(0);
    });
  });
});
