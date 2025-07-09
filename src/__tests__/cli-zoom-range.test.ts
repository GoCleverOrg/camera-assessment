import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

describe('CLI zoom range support', () => {
  let outputDir: string;
  let csvPath: string;

  beforeEach(() => {
    // Create a unique temporary directory for this test run
    outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-zoom-test-'));
    csvPath = path.join(outputDir, 'test-results.csv');
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  it('should process single zoom value (backwards compatible)', async () => {
    const { stdout } = await execAsync('node dist/cli.js analyze -z 5 -g 10');

    expect(stdout).toContain('Camera Analysis Results:');
    expect(stdout).toContain('Maximum Distance:');
    expect(stdout).toContain('Optimal Tilt Angle:');
    expect(stdout).toContain('Visible Line Count:');
    expect(stdout).toContain('Focal Length:');
  });

  it('should process zoom range and display table', async () => {
    const { stdout } = await execAsync('node dist/cli.js analyze -z "1-3" -g 10');

    expect(stdout).toContain('Analyzing multiple zoom levels...');
    expect(stdout).toContain(
      '| Zoom | Max Distance (m) | Tilt Angle (°) | Line Count | Focal Length (mm) |',
    );
    expect(stdout).toContain('| 1    |');
    expect(stdout).toContain('| 2    |');
    expect(stdout).toContain('| 3    |');
  });

  it('should process comma-separated zoom values', async () => {
    const { stdout } = await execAsync('node dist/cli.js analyze -z "1,5,10" -g 10');

    expect(stdout).toContain('| 1    |');
    expect(stdout).toContain('| 5    |');
    expect(stdout).toContain('| 10   |');
    expect(stdout).not.toContain('| 2    |');
    expect(stdout).not.toContain('| 3    |');
  });

  it('should process mixed format zoom values', async () => {
    const { stdout } = await execAsync('node dist/cli.js analyze -z "1-3,5,7-8" -g 10');

    expect(stdout).toContain('| 1    |');
    expect(stdout).toContain('| 2    |');
    expect(stdout).toContain('| 3    |');
    expect(stdout).toContain('| 5    |');
    expect(stdout).toContain('| 7    |');
    expect(stdout).toContain('| 8    |');
    expect(stdout).not.toContain('| 4    |');
    expect(stdout).not.toContain('| 6    |');
  });

  it('should export CSV when flag provided', async () => {
    await execAsync(`node dist/cli.js analyze -z "1-3" -g 10 --csv-output ${csvPath}`);

    expect(fs.existsSync(csvPath)).toBe(true);

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    expect(csvContent).toContain(
      'Zoom,Max Distance (m),Tilt Angle (°),Line Count,Focal Length (mm)',
    );
    expect(csvContent).toContain('1,');
    expect(csvContent).toContain('2,');
    expect(csvContent).toContain('3,');
  });

  it('should generate multiple images with correct names', async () => {
    const { stdout } = await execAsync(
      `node dist/cli.js analyze -z "1-2" -g 10 -i -o ${outputDir}/test`,
    );

    expect(stdout).toContain('Generated 2 images:');
    expect(fs.existsSync(path.join(outputDir, 'test-z1-g10.png'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'test-z2-g10.png'))).toBe(true);
  });

  it('should handle all successful zoom levels', async () => {
    // Test with parameters where all zoom levels should succeed
    const { stdout } = await execAsync('node dist/cli.js analyze -z "1,5,20" -g 10');

    expect(stdout).toContain('| 1    |');
    expect(stdout).toContain('| 5    |');
    expect(stdout).toContain('| 20   |');
    // All should succeed with reasonable gap
    expect(stdout).not.toContain('Failed zoom levels:');
  });

  it('should show appropriate error messages for invalid ranges', async () => {
    try {
      await execAsync('node dist/cli.js analyze -z "5-1" -g 10');
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const err = error as { stderr?: string; stdout?: string };
      expect(err.stderr || err.stdout).toContain('Invalid zoom range');
    }
  });

  it('should reject zoom values outside 1-25', async () => {
    try {
      await execAsync('node dist/cli.js analyze -z "0-5" -g 10');
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const err = error as { stderr?: string; stdout?: string };
      const errorMessage = err.stderr || err.stdout || '';
      expect(errorMessage.includes('out of range') || errorMessage.includes('must be >= 1')).toBe(
        true,
      );
    }

    try {
      await execAsync('node dist/cli.js analyze -z "20-30" -g 10');
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const err = error as { stderr?: string; stdout?: string };
      expect(err.stderr || err.stdout).toContain('out of range');
    }
  });

  it('should handle spaces in zoom range', async () => {
    const { stdout } = await execAsync('node dist/cli.js analyze -z "1 - 3, 5" -g 10');

    expect(stdout).toContain('| 1    |');
    expect(stdout).toContain('| 2    |');
    expect(stdout).toContain('| 3    |');
    expect(stdout).toContain('| 5    |');
  });

  it('should deduplicate and sort zoom values', async () => {
    const { stdout } = await execAsync('node dist/cli.js analyze -z "3,1,2,1,3" -g 10');

    // Should appear in sorted order: 1, 2, 3
    const lines = stdout.split('\n');
    const dataLines = lines.filter((line) => line.includes('|') && /\|\s*\d+\s*\|/.test(line));

    expect(dataLines[0]).toContain('| 1    |');
    expect(dataLines[1]).toContain('| 2    |');
    expect(dataLines[2]).toContain('| 3    |');
    expect(dataLines.length).toBe(3); // No duplicates
  });
});
