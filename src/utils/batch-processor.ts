import { Zoom } from '../types/zoom';
import { CameraViewAnalysis } from '../types/assessment';
import { analyzeCameraView } from '../analyze-camera-view';
import { generateStripDemoImage } from '../rendering/strip-demo-generator';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Represents the result of processing a single zoom level in a batch.
 */
export interface BatchResult {
  /**
   * The zoom level that was processed.
   */
  zoomLevel: number;

  /**
   * Whether this zoom level was processed successfully.
   */
  success: boolean;

  /**
   * The analysis results if successful, undefined if failed.
   */
  analysis?: CameraViewAnalysis;

  /**
   * The generated image path if image generation was requested and successful.
   */
  imagePath?: string;

  /**
   * Error message if the processing failed.
   */
  error?: string;
}

/**
 * Options for batch processing.
 */
export interface BatchProcessingOptions {
  /**
   * Minimum vertical pixel separation between consecutive lines.
   */
  gap: number;

  /**
   * Whether to generate demonstration images for each zoom level.
   */
  generateImage?: boolean;

  /**
   * Base output path for generated images. Individual zoom levels will be appended.
   */
  outputBasePath?: string;

  /**
   * Whether to create images with transparent background.
   */
  transparent?: boolean;

  /**
   * Camera height in meters (default: 20).
   */
  height?: number;
}

/**
 * Processes multiple zoom levels in a batch, analyzing each one and optionally generating images.
 * Handles partial failures gracefully, allowing successful zoom levels to complete even if others fail.
 *
 * @param zoomLevels - Array of zoom levels to process (must be between 1 and 25)
 * @param options - Processing options including gap, image generation settings
 * @returns Array of BatchResult objects, one for each zoom level
 */
export async function processBatch(
  zoomLevels: number[],
  options: BatchProcessingOptions,
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];

  for (const zoomLevel of zoomLevels) {
    try {
      // Create Zoom instance
      const zoom = new Zoom(zoomLevel);

      // Analyze camera view
      const analysis = analyzeCameraView(zoom, options.gap, options.height);

      // Prepare result
      const result: BatchResult = {
        zoomLevel,
        success: true,
        analysis,
      };

      // Generate image if requested
      if (options.generateImage) {
        try {
          // Generate output path for this zoom level
          const outputPath = options.outputBasePath
            ? `${options.outputBasePath}-z${zoomLevel}-g${options.gap}${options.transparent ? '-transparent' : ''}.png`
            : `./output/camera-strips-z${zoomLevel}-g${options.gap}${options.transparent ? '-transparent' : ''}.png`;

          // Ensure output directory exists
          const outputDir = path.dirname(outputPath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // Generate the demonstration image
          const imageResult = await generateStripDemoImage(
            zoom,
            options.gap,
            outputPath,
            options.transparent || false,
            options.height,
          );

          result.imagePath = imageResult.outputPath;
        } catch (imageError) {
          // Image generation failed, but analysis succeeded
          // Keep the successful analysis result but note the image error
          result.error = `Analysis succeeded but image generation failed: ${
            imageError instanceof Error ? imageError.message : String(imageError)
          }`;
        }
      }

      results.push(result);
    } catch (error) {
      // Complete failure for this zoom level
      results.push({
        zoomLevel,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Filters successful results from a batch processing operation.
 *
 * @param results - Array of BatchResult objects
 * @returns Array of successful BatchResult objects with analysis data
 */
export function getSuccessfulResults(
  results: BatchResult[],
): (BatchResult & { analysis: CameraViewAnalysis })[] {
  return results.filter(
    (result): result is BatchResult & { analysis: CameraViewAnalysis } =>
      result.success && result.analysis !== undefined,
  );
}

/**
 * Filters failed results from a batch processing operation.
 *
 * @param results - Array of BatchResult objects
 * @returns Array of failed BatchResult objects with error messages
 */
export function getFailedResults(results: BatchResult[]): (BatchResult & { error: string })[] {
  return results.filter(
    (result): result is BatchResult & { error: string } =>
      !result.success && result.error !== undefined,
  );
}
