import { Zoom } from '../types/zoom';
import { StripRenderResult } from '../types/rendering';
import { analyzeCameraView } from '../analyze-camera-view';
import { generateStripVisualizations } from './strip-visualizer';
import { renderStripsToImage } from './image-generator';
import { NoVisibleStripsError } from '../errors/rendering-errors';
import { SENSOR_RES_X, SENSOR_RES_Y } from '../utils/constants';

/**
 * Generates a demonstration image showing the visible strips in a camera view.
 * This function integrates camera analysis, strip visualization, and image rendering
 * to create a visual representation of ground marking detection.
 *
 * @param zoom - The camera zoom level to analyze
 * @param minPixelGap - Minimum pixel gap required between strips
 * @param outputPath - File path where the generated image will be saved
 * @param transparentBackground - Whether to use transparent background (default: false)
 * @param height - Camera height in meters (default: 20)
 * @returns Promise resolving to render result with output path and metadata
 * @throws NoVisibleStripsError if no strips are visible in the camera view
 * @throws ImageGenerationError if image rendering fails
 * @throws CameraAssessmentError for other camera configuration issues
 *
 * @example
 * ```typescript
 * // Generate demo image at zoom level 10
 * const result = await generateStripDemoImage(
 *   new Zoom(10),
 *   50, // minimum 50 pixels between strips
 *   './output/strips-demo.png',
 *   false // opaque background
 * );
 * console.log(`Generated image at ${result.outputPath}`);
 * console.log(`Rendered ${result.stripCount} strips`);
 * ```
 */
export async function generateStripDemoImage(
  zoom: Zoom,
  minPixelGap: number,
  outputPath: string,
  transparentBackground?: boolean,
  height?: number,
): Promise<StripRenderResult> {
  // Step 1: Analyze camera view to detect visible strips
  const analysis = analyzeCameraView(zoom, minPixelGap, height);

  // Step 2: Validate that we have visible strips
  if (analysis.lineCount < 1) {
    throw new NoVisibleStripsError(
      `No visible strips detected at zoom level ${zoom.level} with minimum pixel gap ${minPixelGap}`,
    );
  }

  // Step 3: Generate strip visualizations from the analysis
  const stripVisualizations = generateStripVisualizations(analysis, height);

  // Step 4: Create composition options for rendering (no text overlays)
  const compositionOptions = {
    width: SENSOR_RES_X,
    height: SENSOR_RES_Y,
    background: transparentBackground
      ? { r: 0, g: 0, b: 0, alpha: 0 }
      : { r: 0, g: 0, b: 0, alpha: 1 },
    layers: [
      {
        type: 'strip' as const,
        data: {
          strips: stripVisualizations,
          outputPath, // Pass the output path through to the renderer
        },
      },
    ],
  };

  // Step 5: Render the image
  const renderResult = await renderStripsToImage(compositionOptions);

  return renderResult;
}
