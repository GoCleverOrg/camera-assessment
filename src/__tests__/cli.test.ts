import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('CLI', () => {
  const cliPath = path.resolve(__dirname, '../../dist/cli.js');

  beforeAll(() => {
    // Ensure the CLI is built
    execSync('pnpm run build', { cwd: path.resolve(__dirname, '../..') });
  });

  describe('analyze command', () => {
    it('should display help', () => {
      const output = execSync(`node ${cliPath} analyze --help`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Analyze camera view for given zoom level and pixel gap');
      expect(output).toContain('--zoom');
      expect(output).toContain('--gap');
      expect(output).toContain('--generate-image');
      expect(output).toContain('--output');
      expect(output).toContain('--transparent');
      expect(output).toContain('Examples:');
    });

    it('should analyze with valid inputs', () => {
      const output = execSync(`node ${cliPath} analyze --zoom 5 --gap 10`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Camera Analysis Results:');
      expect(output).toContain('Maximum Distance:');
      expect(output).toContain('220.00 meters');
      expect(output).toContain('Optimal Tilt Angle:');
      expect(output).toContain('7.91°');
      expect(output).toContain('Visible Line Count:');
      expect(output).toContain('110 lines');
      expect(output).toContain('Focal Length:');
      expect(output).toContain('24.00 mm');
    });

    it('should handle zoom=1 gap=50', () => {
      const output = execSync(`node ${cliPath} analyze --zoom 1 --gap 50`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Maximum Distance:');
      expect(output).toContain('40.00 meters');
      expect(output).toContain('Visible Line Count:');
      expect(output).toContain('20 lines');
    });

    it('should handle zoom=25 gap=5', () => {
      const output = execSync(`node ${cliPath} analyze --zoom 25 --gap 5`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Maximum Distance:');
      expect(output).toContain('696.00 meters');
      expect(output).toContain('Visible Line Count:');
      expect(output).toContain('348 lines');
    });

    it('should error with invalid zoom level', () => {
      expect(() => {
        execSync(`node ${cliPath} analyze --zoom 30 --gap 10`, {
          encoding: 'utf8',
        });
      }).toThrow('Zoom level must be a number between 1 and 25');
    });

    it('should error with negative gap', () => {
      expect(() => {
        execSync(`node ${cliPath} analyze --zoom 5 --gap -10`, {
          encoding: 'utf8',
        });
      }).toThrow('Minimum pixel gap must be a non-negative number');
    });

    it('should error with impossible constraint', () => {
      expect(() => {
        execSync(`node ${cliPath} analyze --zoom 5 --gap 5000`, {
          encoding: 'utf8',
        });
      }).toThrow('Impossible constraint');
    });

    it('should error with missing parameters', () => {
      expect(() => {
        execSync(`node ${cliPath} analyze --zoom 5`, {
          encoding: 'utf8',
        });
      }).toThrow();
    });

    describe('image generation', () => {
      let tempDir: string;

      beforeEach(() => {
        // Create a temporary directory for test outputs
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-test-'));
      });

      afterEach(() => {
        // Clean up temporary directory
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true });
        }
      });

      it('should generate image with black background', () => {
        const outputPath = path.join(tempDir, 'test-black.png');
        const output = execSync(
          `node ${cliPath} analyze --zoom 5 --gap 10 --generate-image --output ${outputPath}`,
          {
            encoding: 'utf8',
          },
        );

        // Check console output
        expect(output).toContain('Camera Analysis Results:');
        expect(output).toContain('Generating image...');
        expect(output).toContain('Image generated successfully!');
        expect(output).toContain(outputPath);
        expect(output).toContain('Strips Rendered:');

        // Check file exists
        expect(fs.existsSync(outputPath)).toBe(true);
      });

      it('should generate image with transparent background', () => {
        const outputPath = path.join(tempDir, 'test-transparent.png');
        const output = execSync(
          `node ${cliPath} analyze --zoom 5 --gap 10 --generate-image --transparent --output ${outputPath}`,
          {
            encoding: 'utf8',
          },
        );

        // Check console output
        expect(output).toContain('Camera Analysis Results:');
        expect(output).toContain('Generating image...');
        expect(output).toContain('Image generated successfully!');

        // Check file exists
        expect(fs.existsSync(outputPath)).toBe(true);
      });

      it('should work with analyze-camera-view alias', () => {
        const outputPath = path.join(tempDir, 'test-alias.png');
        const output = execSync(
          `node ${cliPath} analyze-camera-view --zoom 10 --gap 50 --generate-image --output ${outputPath}`,
          {
            encoding: 'utf8',
          },
        );

        expect(output).toContain('Camera Analysis Results:');
        expect(output).toContain('Image generated successfully!');
        expect(fs.existsSync(outputPath)).toBe(true);
      });

      it('should create output directory if it does not exist', () => {
        const nestedPath = path.join(tempDir, 'nested', 'dir', 'test.png');
        const output = execSync(
          `node ${cliPath} analyze --zoom 5 --gap 10 --generate-image --output ${nestedPath}`,
          {
            encoding: 'utf8',
          },
        );

        expect(output).toContain('Image generated successfully!');
        expect(fs.existsSync(nestedPath)).toBe(true);
      });

      it('should generate image with default filename when no output is specified', () => {
        const defaultPath = './output/camera-strips-z5-g10.png';

        // Clean up any existing file
        if (fs.existsSync(defaultPath)) {
          fs.unlinkSync(defaultPath);
        }

        const output = execSync(`node ${cliPath} analyze --zoom 5 --gap 10 --generate-image`, {
          encoding: 'utf8',
        });

        expect(output).toContain('Image generated successfully!');
        expect(output).toContain(defaultPath);
        expect(fs.existsSync(defaultPath)).toBe(true);
      });

      it('should generate transparent image with default filename including transparent suffix', () => {
        const defaultPath = './output/camera-strips-z5-g10-transparent.png';

        // Clean up any existing file
        if (fs.existsSync(defaultPath)) {
          fs.unlinkSync(defaultPath);
        }

        const output = execSync(
          `node ${cliPath} analyze --zoom 5 --gap 10 --generate-image --transparent`,
          {
            encoding: 'utf8',
          },
        );

        expect(output).toContain('Image generated successfully!');
        expect(output).toContain(defaultPath);
        expect(fs.existsSync(defaultPath)).toBe(true);
      });

      it('should still work without image generation (backward compatibility)', () => {
        const output = execSync(`node ${cliPath} analyze --zoom 5 --gap 10`, {
          encoding: 'utf8',
        });

        expect(output).toContain('Camera Analysis Results:');
        expect(output).not.toContain('Generating image');
        expect(output).not.toContain('Image generated successfully');
      });
    });
  });

  describe('main command', () => {
    it('should display version', () => {
      const output = execSync(`node ${cliPath} --version`, {
        encoding: 'utf8',
      });
      expect(output.trim()).toBe('1.0.0');
    });

    it('should display help', () => {
      const output = execSync(`node ${cliPath} --help`, {
        encoding: 'utf8',
      });
      expect(output).toContain('CLI tool for camera assessment calculations');
      expect(output).toContain('analyze');
    });
  });
});
