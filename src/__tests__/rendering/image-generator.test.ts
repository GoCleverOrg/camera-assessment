import { renderStripsToImage, createStripsSVG } from '../../rendering/image-generator';
import {
  ImageCompositionOptions,
  StripVisualization,
  StripStyle,
  TextOverlayConfig,
} from '../../types/rendering';
import { ImageGenerationError } from '../../errors/rendering-errors';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { SENSOR_RES_X, SENSOR_RES_Y } from '../../utils/constants';

describe('Image Generator', () => {
  // Clean up test output files
  afterEach(async () => {
    const outputDir = path.join(process.cwd(), 'output');
    try {
      const files = await fs.readdir(outputDir);
      const testFiles = files.filter((f) => f.startsWith('test-') && f.endsWith('.png'));
      await Promise.all(testFiles.map((f) => fs.unlink(path.join(outputDir, f))));
    } catch {
      // Directory might not exist, that's ok
    }
  });

  describe('renderStripsToImage', () => {
    it('should render strips to an image with default background', async () => {
      const strips: StripVisualization[] = [
        { position: 0.2, distance: 0, isHighlighted: false },
        { position: 0.5, distance: 100, isHighlighted: true },
        { position: 0.8, distance: 150, isHighlighted: true },
      ];

      const outputPath = path.join(process.cwd(), 'output', 'test-strips-default.png');
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

      expect(result.outputPath).toBe(outputPath);
      expect(result.dimensions.width).toBe(SENSOR_RES_X);
      expect(result.dimensions.height).toBe(SENSOR_RES_Y);
      expect(result.stripCount).toBe(3);
      expect(result.metadata.format).toBe('png');
      expect(result.metadata.renderTime).toBeGreaterThan(0);
      expect(result.metadata.fileSize).toBeGreaterThan(0);

      // Verify file exists
      const stats = await fs.stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);

      // Verify image metadata
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.width).toBe(SENSOR_RES_X);
      expect(metadata.height).toBe(SENSOR_RES_Y);
      expect(metadata.format).toBe('png');
    });

    it('should render strips with transparent background', async () => {
      const strips: StripVisualization[] = [
        { position: 0.3, distance: 0, isHighlighted: false },
        { position: 0.7, distance: 200, isHighlighted: false },
      ];

      const outputPath = path.join(process.cwd(), 'output', 'test-strips-transparent.png');
      const options: ImageCompositionOptions = {
        width: SENSOR_RES_X,
        height: SENSOR_RES_Y,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        layers: [
          {
            type: 'strip',
            data: { strips, outputPath },
          },
        ],
      };

      const result = await renderStripsToImage(options);

      expect(result.stripCount).toBe(2);

      // Verify transparency
      const metadata = await sharp(result.outputPath).metadata();
      expect(metadata.channels).toBe(4); // RGBA
      expect(metadata.hasAlpha).toBe(true);
    });

    it('should render strips with custom style', async () => {
      const strips: StripVisualization[] = [{ position: 0.4, distance: 0, isHighlighted: true }];

      const customStyle: StripStyle = {
        thickness: 4,
        opaqueColor: '#0000FF',
        transparentColor: '#00FF00',
        highlightColor: '#FF00FF',
        opacity: 0.8,
      };

      const outputPath = path.join(process.cwd(), 'output', 'test-strips-custom-style.png');
      const options: ImageCompositionOptions = {
        width: SENSOR_RES_X,
        height: SENSOR_RES_Y,
        layers: [
          {
            type: 'strip',
            data: { strips, style: customStyle, outputPath },
          },
        ],
      };

      const result = await renderStripsToImage(options);

      expect(result.stripCount).toBe(1);
      expect(result.outputPath).toBe(outputPath);

      // Verify file exists
      await fs.stat(outputPath);
    });

    it('should render strips with text annotations', async () => {
      const strips: StripVisualization[] = [
        { position: 0.25, distance: 0, isHighlighted: false },
        { position: 0.75, distance: 300, isHighlighted: false },
      ];

      const textOverlays: TextOverlayConfig[] = [
        {
          text: 'Camera View Analysis',
          x: 100,
          y: 50,
          fontSize: 24,
          color: '#FFFFFF',
          align: 'left',
        },
        {
          text: 'Strip Detection Result',
          x: SENSOR_RES_X / 2,
          y: SENSOR_RES_Y - 50,
          fontSize: 18,
          align: 'center',
        },
      ];

      const outputPath = path.join(process.cwd(), 'output', 'test-strips-with-text.png');
      const options: ImageCompositionOptions = {
        width: SENSOR_RES_X,
        height: SENSOR_RES_Y,
        background: { r: 64, g: 64, b: 64, alpha: 1 },
        layers: [
          {
            type: 'strip',
            data: { strips, outputPath },
          },
          {
            type: 'text',
            data: textOverlays[0],
          },
          {
            type: 'text',
            data: textOverlays[1],
          },
        ],
      };

      const result = await renderStripsToImage(options);

      expect(result.stripCount).toBe(2);

      // Verify file exists and has content
      const stats = await fs.stat(result.outputPath);
      expect(stats.size).toBeGreaterThan(1000); // Should have substantial content
    });

    it('should throw error for invalid composition options', async () => {
      // @ts-expect-error Testing invalid input
      await expect(renderStripsToImage(null)).rejects.toThrow(ImageGenerationError);
      // @ts-expect-error Testing invalid input
      await expect(renderStripsToImage({})).rejects.toThrow(ImageGenerationError);
      await expect(renderStripsToImage({ width: 0, height: 100, layers: [] })).rejects.toThrow(
        ImageGenerationError,
      );
      await expect(renderStripsToImage({ width: 100, height: -1, layers: [] })).rejects.toThrow(
        ImageGenerationError,
      );
      await expect(renderStripsToImage({ width: 100, height: 100, layers: [] })).rejects.toThrow(
        ImageGenerationError,
      );
    });

    it('should throw error when no strip layers provided', async () => {
      const options: ImageCompositionOptions = {
        width: SENSOR_RES_X,
        height: SENSOR_RES_Y,
        layers: [
          {
            type: 'text',
            data: { text: 'Test', x: 0, y: 0 },
          },
        ],
      };

      await expect(renderStripsToImage(options)).rejects.toThrow(ImageGenerationError);
      await expect(renderStripsToImage(options)).rejects.toThrow('No strip layers provided');
    });

    it('should handle file system errors gracefully', async () => {
      const strips: StripVisualization[] = [{ position: 0.5, distance: 0, isHighlighted: false }];

      // Use an invalid path that cannot be created
      const invalidPath = '/invalid/path/that/cannot/be/created/test.png';
      const options: ImageCompositionOptions = {
        width: SENSOR_RES_X,
        height: SENSOR_RES_Y,
        layers: [
          {
            type: 'strip',
            data: { strips, outputPath: invalidPath },
          },
        ],
      };

      await expect(renderStripsToImage(options)).rejects.toThrow(ImageGenerationError);
    });

    it('should generate default output path when not specified', async () => {
      const strips: StripVisualization[] = [{ position: 0.5, distance: 0, isHighlighted: false }];

      const options: ImageCompositionOptions = {
        width: SENSOR_RES_X,
        height: SENSOR_RES_Y,
        layers: [
          {
            type: 'strip',
            data: { strips },
          },
        ],
      };

      const result = await renderStripsToImage(options);

      expect(result.outputPath).toMatch(
        /output[/\\]strips-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.png$/,
      );

      // Clean up
      await fs.unlink(result.outputPath);
    });
  });

  describe('createStripsSVG', () => {
    it('should create SVG with strip lines', () => {
      const strips: StripVisualization[] = [
        { position: 0.2, distance: 0, isHighlighted: false },
        { position: 0.5, distance: 100, isHighlighted: true },
        { position: 0.8, distance: 150, isHighlighted: true },
      ];

      const style: StripStyle = {
        thickness: 2,
        opaqueColor: '#FF0000',
        transparentColor: '#00FF00',
        highlightColor: '#FFFF00',
      };

      const svg = createStripsSVG(strips, style);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain(`width="${SENSOR_RES_X}"`);
      expect(svg).toContain(`height="${SENSOR_RES_Y}"`);

      // Check for strip lines
      expect(svg).toMatch(/<line[^>]*y1="288"[^>]*stroke="#FF0000"/); // First strip at 0.2 * 1440
      expect(svg).toMatch(/<line[^>]*y1="720"[^>]*stroke="#FFFF00"/); // Second strip highlighted
      expect(svg).toMatch(/<line[^>]*y1="1152"[^>]*stroke="#FFFF00"/); // Third strip highlighted

      // No pixel gap annotation or labels should be present
      expect(svg).not.toContain('px'); // No pixel measurements
      expect(svg).not.toContain('<text'); // No text elements
    });

    it('should create SVG with text annotations', () => {
      const strips: StripVisualization[] = [{ position: 0.5, distance: 0, isHighlighted: false }];

      const style: StripStyle = {
        thickness: 3,
        opaqueColor: '#0000FF',
        transparentColor: '#00FF00',
        highlightColor: '#FF00FF',
      };

      const annotations: TextOverlayConfig[] = [
        {
          text: 'Test Annotation',
          x: 100,
          y: 200,
          fontSize: 20,
          color: '#FFFFFF',
          align: 'center',
        },
      ];

      const svg = createStripsSVG(strips, style, annotations);

      expect(svg).toContain('Test Annotation');
      expect(svg).toContain('x="100"');
      expect(svg).toContain('y="200"');
      expect(svg).toContain('font-size="20"');
      expect(svg).toContain('text-anchor="middle"'); // center alignment
    });

    it('should escape XML special characters in text', () => {
      const strips: StripVisualization[] = [];
      const style: StripStyle = {
        thickness: 2,
        opaqueColor: '#000000',
        transparentColor: '#000000',
        highlightColor: '#000000',
      };

      const annotations: TextOverlayConfig[] = [
        {
          text: 'Test <tag> & "quotes" \'apostrophe\'',
          x: 0,
          y: 0,
        },
      ];

      const svg = createStripsSVG(strips, style, annotations);

      expect(svg).toContain('Test &lt;tag&gt; &amp; &quot;quotes&quot; &apos;apostrophe&apos;');
    });

    it('should handle empty strips array', () => {
      const strips: StripVisualization[] = [];
      const style: StripStyle = {
        thickness: 2,
        opaqueColor: '#FF0000',
        transparentColor: '#00FF00',
        highlightColor: '#FFFF00',
      };

      const svg = createStripsSVG(strips, style);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).not.toContain('<line');
      expect(svg).not.toContain('px'); // No gap annotation
    });

    it('should handle single strip without gap annotation', () => {
      const strips: StripVisualization[] = [{ position: 0.5, distance: 0, isHighlighted: true }];

      const style: StripStyle = {
        thickness: 2,
        opaqueColor: '#FF0000',
        transparentColor: '#00FF00',
        highlightColor: '#FFFF00',
      };

      const svg = createStripsSVG(strips, style);

      expect(svg).toContain('<line');
      expect(svg).toContain('stroke="#FFFF00"'); // Highlighted
      expect(svg).not.toMatch(/\d+px/); // No gap annotation for single strip
    });

    it('should apply opacity when specified', () => {
      const strips: StripVisualization[] = [{ position: 0.5, distance: 0, isHighlighted: false }];

      const style: StripStyle = {
        thickness: 2,
        opaqueColor: '#FF0000',
        transparentColor: '#00FF00',
        highlightColor: '#FFFF00',
        opacity: 0.5,
      };

      const svg = createStripsSVG(strips, style);

      expect(svg).toContain('opacity="0.5"');
    });
  });
});
