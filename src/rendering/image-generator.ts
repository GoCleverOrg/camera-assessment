import sharp from 'sharp';
import {
  ImageCompositionOptions,
  StripVisualization,
  StripStyle,
  TextOverlayConfig,
  StripRenderResult,
} from '../types/rendering';
import { ImageGenerationError } from '../errors/rendering-errors';
import {
  SENSOR_RES_X,
  SENSOR_RES_Y,
  STRIP_LINE_THICKNESS,
  STRIP_COLOR_OPAQUE,
  STRIP_COLOR_TRANSPARENT,
  HIGHLIGHT_COLOR,
  TEXT_COLOR,
  TEXT_OUTLINE_COLOR,
} from '../utils/constants';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Default strip style configuration
 */
const DEFAULT_STRIP_STYLE: StripStyle = {
  thickness: STRIP_LINE_THICKNESS,
  opaqueColor: STRIP_COLOR_OPAQUE,
  transparentColor: STRIP_COLOR_TRANSPARENT,
  highlightColor: HIGHLIGHT_COLOR,
  opacity: 1.0,
};

/**
 * Renders strips to an image using Sharp for composition.
 * Creates a base image and composites SVG overlays for strips and annotations.
 *
 * @param options - Image composition options including dimensions, background, and layers
 * @returns Promise resolving to strip render result with output path and metadata
 * @throws ImageGenerationError if rendering fails
 */
export async function renderStripsToImage(
  options: ImageCompositionOptions,
): Promise<StripRenderResult> {
  const startTime = Date.now();

  try {
    // Validate input options
    validateCompositionOptions(options);

    // Extract strips and text overlays from layers
    const stripLayers = options.layers.filter((layer) => layer.type === 'strip');
    const textLayers = options.layers.filter((layer) => layer.type === 'text');

    if (stripLayers.length === 0) {
      throw new ImageGenerationError('No strip layers provided for rendering');
    }

    // Extract strip visualizations and style
    const strips = stripLayers[0].data as { strips: StripVisualization[]; style?: StripStyle };
    const stripStyle = strips.style || DEFAULT_STRIP_STYLE;

    // Extract text overlays
    const textOverlays = textLayers.map((layer) => layer.data as TextOverlayConfig);

    // Create base image
    const baseImage = sharp({
      create: {
        width: options.width,
        height: options.height,
        channels: 4,
        background: options.background || { r: 0, g: 0, b: 0, alpha: 1 },
      },
    });

    // Generate SVG overlay
    const svgOverlay = createStripsSVG(strips.strips, stripStyle, textOverlays);

    // Composite SVG onto base image
    const compositeBuffer = await baseImage
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Determine output path
    const outputPath = determineOutputPath(options);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write to file
    await fs.writeFile(outputPath, compositeBuffer);

    // Get file stats
    const stats = await fs.stat(outputPath);

    // Calculate render time
    const renderTime = Date.now() - startTime;

    return {
      outputPath,
      dimensions: {
        width: options.width,
        height: options.height,
      },
      stripCount: strips.strips.length,
      metadata: {
        renderTime,
        fileSize: stats.size,
        format: 'png',
      },
    };
  } catch (error) {
    if (error instanceof ImageGenerationError) {
      throw error;
    }
    throw new ImageGenerationError(
      `Failed to render strips to image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Creates an SVG string containing strip lines and text annotations.
 *
 * @param strips - Array of strip visualizations to render
 * @param style - Strip styling configuration
 * @param annotations - Optional text overlay configurations
 * @returns SVG string representation of strips and annotations
 */
export function createStripsSVG(
  strips: StripVisualization[],
  style: StripStyle,
  annotations: TextOverlayConfig[] = [],
): string {
  // Determine dimensions based on sensor resolution
  const width = SENSOR_RES_X;
  const height = SENSOR_RES_Y;

  // Start SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Add strip lines
  strips.forEach((strip, index) => {
    const yPosition = Math.round(strip.position * height);
    const color = strip.isHighlighted
      ? style.highlightColor
      : style.opaqueColor || style.transparentColor;
    const opacity = style.opacity || 1.0;

    svg += `<line x1="0" y1="${yPosition}" x2="${width}" y2="${yPosition}" `;
    svg += `stroke="${color}" stroke-width="${style.thickness}" `;
    svg += `opacity="${opacity}" />`;

    // Add strip index label (small, unobtrusive)
    const labelX = 10;
    const labelY = yPosition - 5;
    svg += `<text x="${labelX}" y="${labelY}" font-family="Arial" font-size="10" `;
    svg += `fill="${TEXT_COLOR}" stroke="${TEXT_OUTLINE_COLOR}" stroke-width="0.5">`;
    svg += `${index + 1}</text>`;
  });

  // Add pixel gap annotation between furthest two strips if we have at least 2 strips
  if (strips.length >= 2) {
    const furthestStrips = strips.slice(-2);
    const y1 = Math.round(furthestStrips[0].position * height);
    const y2 = Math.round(furthestStrips[1].position * height);
    const pixelGap = Math.abs(y2 - y1);

    // Draw a measurement line
    const measureX = width - 100;
    svg += `<line x1="${measureX}" y1="${y1}" x2="${measureX}" y2="${y2}" `;
    svg += `stroke="${TEXT_COLOR}" stroke-width="1" stroke-dasharray="2,2" />`;

    // Add end caps
    svg += `<line x1="${measureX - 5}" y1="${y1}" x2="${measureX + 5}" y2="${y1}" `;
    svg += `stroke="${TEXT_COLOR}" stroke-width="1" />`;
    svg += `<line x1="${measureX - 5}" y1="${y2}" x2="${measureX + 5}" y2="${y2}" `;
    svg += `stroke="${TEXT_COLOR}" stroke-width="1" />`;

    // Add gap label
    const midY = (y1 + y2) / 2;
    svg += `<text x="${measureX + 10}" y="${midY + 4}" font-family="Arial" font-size="14" `;
    svg += `fill="${TEXT_COLOR}" stroke="${TEXT_OUTLINE_COLOR}" stroke-width="0.5">`;
    svg += `${pixelGap}px</text>`;
  }

  // Add custom text annotations
  annotations.forEach((annotation) => {
    const fontSize = annotation.fontSize || 16;
    const color = annotation.color || TEXT_COLOR;
    const outlineColor = annotation.outlineColor || TEXT_OUTLINE_COLOR;
    const align = annotation.align || 'left';

    let textAnchor = 'start';
    if (align === 'center') textAnchor = 'middle';
    if (align === 'right') textAnchor = 'end';

    svg += `<text x="${annotation.x}" y="${annotation.y}" `;
    svg += `font-family="Arial" font-size="${fontSize}" `;
    svg += `fill="${color}" stroke="${outlineColor}" stroke-width="0.5" `;
    svg += `text-anchor="${textAnchor}">`;
    svg += escapeXml(annotation.text);
    svg += '</text>';
  });

  svg += '</svg>';

  return svg;
}

/**
 * Validates image composition options
 * @throws ImageGenerationError if options are invalid
 */
function validateCompositionOptions(options: ImageCompositionOptions): void {
  if (!options || typeof options !== 'object') {
    throw new ImageGenerationError('Invalid composition options provided');
  }

  if (typeof options.width !== 'number' || options.width <= 0) {
    throw new ImageGenerationError('Invalid width: must be a positive number');
  }

  if (typeof options.height !== 'number' || options.height <= 0) {
    throw new ImageGenerationError('Invalid height: must be a positive number');
  }

  if (!Array.isArray(options.layers) || options.layers.length === 0) {
    throw new ImageGenerationError('No layers provided for composition');
  }
}

/**
 * Determines the output path for the generated image
 */
function determineOutputPath(options: ImageCompositionOptions): string {
  // Check if an explicit output path is provided in layers
  const stripLayer = options.layers.find((layer) => layer.type === 'strip');
  if (
    stripLayer &&
    stripLayer.data &&
    typeof stripLayer.data === 'object' &&
    'outputPath' in stripLayer.data
  ) {
    const data = stripLayer.data as { outputPath?: string };
    if (data.outputPath) {
      return data.outputPath;
    }
  }

  // Generate default output path
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(process.cwd(), 'output', `strips-${timestamp}.png`);
}

/**
 * Escapes XML special characters in text
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
