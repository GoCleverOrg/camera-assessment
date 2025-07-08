import { execSync } from 'child_process';
import * as path from 'path';

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
    });

    it('should analyze with valid inputs', () => {
      const output = execSync(`node ${cliPath} analyze --zoom 5 --gap 10`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Camera Analysis Results:');
      expect(output).toContain('Maximum Distance:');
      expect(output).toContain('198.00 meters');
      expect(output).toContain('Optimal Tilt Angle:');
      expect(output).toContain('8.49°');
      expect(output).toContain('Visible Line Count:');
      expect(output).toContain('99 lines');
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
      expect(output).toContain('198.00 meters');
      expect(output).toContain('Visible Line Count:');
      expect(output).toContain('99 lines');
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
