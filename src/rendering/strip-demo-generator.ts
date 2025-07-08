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
): Promise<StripRenderResult> {
  // Step 1: Analyze camera view to detect visible strips
  const analysis = analyzeCameraView(zoom, minPixelGap);

  // Step 2: Validate that we have visible strips
  if (analysis.lineCount < 1) {
    throw new NoVisibleStripsError(
      `No visible strips detected at zoom level ${zoom.level} with minimum pixel gap ${minPixelGap}`,
    );
  }

  // Step 3: Generate strip visualizations from the analysis
  const stripVisualizations = generateStripVisualizations(analysis);

  // Step 4: Calculate pixel gap annotation for furthest strips
  let pixelGapText = '';
  if (stripVisualizations.length >= 2) {
    // Calculate the pixel gap between the furthest two strips
    const furthestStrips = stripVisualizations.slice(-2);
    const y1 = Math.round(furthestStrips[0].position * SENSOR_RES_Y);
    const y2 = Math.round(furthestStrips[1].position * SENSOR_RES_Y);
    const pixelGap = Math.abs(y2 - y1);
    pixelGapText = `Gap: ${pixelGap}px`;
  }

  // Step 5: Prepare text overlays
  const textOverlays = [];

  // Add main title
  textOverlays.push({
    text: `Zoom: ${zoom.level}x | Strips: ${analysis.lineCount}`,
    x: SENSOR_RES_X / 2,
    y: 30,
    fontSize: 20,
    align: 'center' as const,
  });

  // Add pixel gap info if we have multiple strips
  if (pixelGapText && analysis.lineCount >= 2) {
    textOverlays.push({
      text: pixelGapText,
      x: SENSOR_RES_X / 2,
      y: 60,
      fontSize: 16,
      align: 'center' as const,
    });
  }

  // Step 6: Create composition options for rendering
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
      ...textOverlays.map((overlay) => ({
        type: 'text' as const,
        data: overlay,
      })),
    ],
  };

  // Step 7: Render the image
  const renderResult = await renderStripsToImage(compositionOptions);

  return renderResult;
}
