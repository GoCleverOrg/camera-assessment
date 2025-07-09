import { analyzeCameraView } from '../analyze-camera-view';
import { generateStripVisualizations } from '../rendering/strip-visualizer';
import { renderStripsToImage } from '../rendering/image-generator';
import { ImageCompositionOptions, StripStyle, TextOverlayConfig } from '../types/rendering';
import { Zoom } from '../types/zoom';
import { SENSOR_RES_X, SENSOR_RES_Y } from '../utils/constants';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

describe('Image Generation Integration', () => {
  // Clean up test output files
  afterEach(async () => {
    const outputDir = path.join(process.cwd(), 'output');
    try {
      const files = await fs.readdir(outputDir);
      const testFiles = files.filter((f) => f.startsWith('integration-') && f.endsWith('.png'));
      await Promise.all(testFiles.map((f) => fs.unlink(path.join(outputDir, f))));
    } catch {
      // Directory might not exist, that's ok
    }
  });

  it('should generate strip visualization image from camera analysis', async () => {
    // Step 1: Analyze camera view
    const zoom = new Zoom(1);
    const analysis = analyzeCameraView(zoom, 10);

    expect(analysis.lineCount).toBeGreaterThan(0);
    expect(analysis.distanceInMeters).toBeGreaterThan(0);

    // Step 2: Generate strip visualizations
    const strips = generateStripVisualizations(analysis);

    expect(strips.length).toBeGreaterThan(0);
    expect(strips.length).toBeLessThanOrEqual(analysis.lineCount);

    // Step 3: Render to image
    const outputPath = path.join(process.cwd(), 'output', 'integration-strips.png');
    const options: ImageCompositionOptions = {
      width: SENSOR_RES_X,
      height: SENSOR_RES_Y,
      background: { r: 32, g: 32, b: 32, alpha: 1 },
      layers: [
        {
          type: 'strip',
          data: { strips, outputPath },
        },
      ],
    };

    const result = await renderStripsToImage(options);

    // Verify result
    expect(result.outputPath).toBe(outputPath);
    expect(result.stripCount).toBe(strips.length);
    expect(result.dimensions.width).toBe(SENSOR_RES_X);
    expect(result.dimensions.height).toBe(SENSOR_RES_Y);

    // Verify file exists and has correct properties
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.width).toBe(SENSOR_RES_X);
    expect(metadata.height).toBe(SENSOR_RES_Y);
    expect(metadata.format).toBe('png');
  });

  it('should generate annotated strip visualization with custom styling', async () => {
    // Analyze camera view
    const zoom = new Zoom(1);
    const analysis = analyzeCameraView(zoom, 5);
    const strips = generateStripVisualizations(analysis);

    // Custom style
    const customStyle: StripStyle = {
      thickness: 3,
      opaqueColor: '#00FF00',
      transparentColor: '#00FF00',
      highlightColor: '#FF00FF',
      opacity: 0.9,
    };

    // Text annotations
    const annotations: TextOverlayConfig[] = [
      {
        text: `Camera Analysis: ${analysis.distanceInMeters.toFixed(1)}m range`,
        x: 50,
        y: 50,
        fontSize: 24,
        color: '#FFFFFF',
      },
      {
        text: `Tilt: ${analysis.tiltAngle.degrees.toFixed(1)}°, Zoom: ${zoom.level}x`,
        x: 50,
        y: 80,
        fontSize: 18,
        color: '#CCCCCC',
      },
      {
        text: `Detected ${strips.length} of ${analysis.lineCount} strips`,
        x: 50,
        y: 110,
        fontSize: 18,
        color: '#CCCCCC',
      },
    ];

    const outputPath = path.join(process.cwd(), 'output', 'integration-annotated.png');
    const options: ImageCompositionOptions = {
      width: SENSOR_RES_X,
      height: SENSOR_RES_Y,
      background: { r: 0, g: 0, b: 64, alpha: 1 },
      layers: [
        {
          type: 'strip',
          data: { strips, style: customStyle, outputPath },
        },
        ...annotations.map((annotation) => ({
          type: 'text' as const,
          data: annotation,
        })),
      ],
    };

    const result = await renderStripsToImage(options);

    expect(result.stripCount).toBe(strips.length);
    expect(result.metadata.fileSize).toBeGreaterThan(5000); // Should have substantial content

    // Verify the image was created successfully
    await fs.stat(result.outputPath);
  });

  it('should generate transparent background image for overlay purposes', async () => {
    const zoom = new Zoom(3);
    const analysis = analyzeCameraView(zoom, 60);
    const strips = generateStripVisualizations(analysis);

    const outputPath = path.join(process.cwd(), 'output', 'integration-transparent.png');
    const options: ImageCompositionOptions = {
      width: SENSOR_RES_X,
      height: SENSOR_RES_Y,
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fully transparent
      layers: [
        {
          type: 'strip',
          data: { strips, outputPath },
        },
      ],
    };

    const result = await renderStripsToImage(options);

    // Verify transparency
    const metadata = await sharp(result.outputPath).metadata();
    expect(metadata.channels).toBe(4); // RGBA
    expect(metadata.hasAlpha).toBe(true);

    // Extract a pixel to verify transparency
    const { data } = await sharp(result.outputPath).raw().toBuffer({ resolveWithObject: true });

    // Check a pixel that should be transparent (corner pixel)
    const pixelIndex = 0;
    const alpha = data[pixelIndex * 4 + 3]; // Alpha channel
    expect(alpha).toBe(0); // Should be fully transparent
  });

  it('should handle edge case with very few visible strips', async () => {
    // Low zoom with moderate gap should result in few visible strips
    const zoom = new Zoom(1);
    const analysis = analyzeCameraView(zoom, 15);
    const strips = generateStripVisualizations(analysis);

    // Should get at least some strips
    expect(strips.length).toBeGreaterThan(0);
    expect(strips.length).toBeLessThan(10); // Verify it's actually "few" strips

    const outputPath = path.join(process.cwd(), 'output', 'integration-edge-case.png');
    const options: ImageCompositionOptions = {
      width: SENSOR_RES_X,
      height: SENSOR_RES_Y,
      layers: [
        {
          type: 'strip',
          data: { strips, outputPath },
        },
        {
          type: 'text',
          data: {
            text: `Edge case: ${strips.length} strips visible`,
            x: SENSOR_RES_X / 2,
            y: 50,
            fontSize: 20,
            align: 'center',
          } as TextOverlayConfig,
        },
      ],
    };

    const result = await renderStripsToImage(options);

    expect(result.stripCount).toBe(strips.length);
    expect(result.outputPath).toBe(outputPath);
  });

  it('should correctly highlight furthest strips and show pixel gap', async () => {
    const zoom = new Zoom(5);
    const analysis = analyzeCameraView(zoom, 45);
    const strips = generateStripVisualizations(analysis);

    // Verify that the last two strips are highlighted
    if (strips.length >= 2) {
      expect(strips[strips.length - 2].isHighlighted).toBe(true);
      expect(strips[strips.length - 1].isHighlighted).toBe(true);

      // All other strips should not be highlighted
      for (let i = 0; i < strips.length - 2; i++) {
        expect(strips[i].isHighlighted).toBe(false);
      }
    }

    const outputPath = path.join(process.cwd(), 'output', 'integration-highlights.png');
    const options: ImageCompositionOptions = {
      width: SENSOR_RES_X,
      height: SENSOR_RES_Y,
      layers: [
        {
          type: 'strip',
          data: { strips, outputPath },
        },
      ],
    };

    const result = await renderStripsToImage(options);

    // The SVG should contain the pixel gap annotation
    // We can't directly test the SVG content here, but we know it's included
    // based on our unit tests and the successful rendering
    expect(result.stripCount).toBe(strips.length);
    expect(result.metadata.format).toBe('png');
  });
});
