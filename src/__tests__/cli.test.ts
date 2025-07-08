import { execSync } from 'child_process';
import * as path from 'path';

describe('CLI', () => {
  const cliPath = path.resolve(__dirname, '../../dist/cli.js');

  beforeAll(() => {
    // Ensure the CLI is built
    execSync('pnpm run build', { cwd: path.resolve(__dirname, '../..') });
  });

  describe('compute-max-distance command', () => {
    it('should display help', () => {
      const output = execSync(`node ${cliPath} compute-max-distance --help`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Compute the maximum horizontal ground distance');
      expect(output).toContain('--zoom');
      expect(output).toContain('--gap');
    });

    it('should compute distance with valid inputs', () => {
      const output = execSync(`node ${cliPath} compute-max-distance --zoom 5 --gap 10`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Maximum distance: 198 meters');
    });

    it('should handle zoom=1 gap=50', () => {
      const output = execSync(`node ${cliPath} compute-max-distance --zoom 1 --gap 50`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Maximum distance: 40 meters');
    });

    it('should handle zoom=25 gap=5', () => {
      const output = execSync(`node ${cliPath} compute-max-distance --zoom 25 --gap 5`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Maximum distance: 198 meters');
    });

    it('should error with invalid zoom level', () => {
      expect(() => {
        execSync(`node ${cliPath} compute-max-distance --zoom 30 --gap 10`, {
          encoding: 'utf8',
        });
      }).toThrow('Zoom level must be a number between 1 and 25');
    });

    it('should error with negative gap', () => {
      expect(() => {
        execSync(`node ${cliPath} compute-max-distance --zoom 5 --gap -10`, {
          encoding: 'utf8',
        });
      }).toThrow('Minimum pixel gap must be a non-negative number');
    });

    it('should error with missing parameters', () => {
      expect(() => {
        execSync(`node ${cliPath} compute-max-distance --zoom 5`, {
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
      expect(output).toContain('compute-max-distance');
    });
  });
});
