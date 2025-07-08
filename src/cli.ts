#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { analyzeCameraView } from './analyze-camera-view';
import { Zoom } from './types/zoom';
import { ImpossibleConstraintError, InvalidZoomLevelError } from './errors/camera-errors';

const program = new Command();

program
  .name('camera-assessment')
  .description('CLI tool for camera assessment calculations')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze camera view for given zoom level and pixel gap')
  .requiredOption('-z, --zoom <number>', 'Camera zoom level (1-25)', (value) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 1 || parsed > 25) {
      throw new Error('Zoom level must be a number between 1 and 25');
    }
    return parsed;
  })
  .requiredOption(
    '-g, --gap <number>',
    'Minimum vertical pixel separation between consecutive lines',
    (value) => {
      const parsed = parseFloat(value);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error('Minimum pixel gap must be a non-negative number');
      }
      return parsed;
    },
  )
  .action((options: { zoom: number; gap: number }) => {
    try {
      // Create Zoom instance
      const zoom = new Zoom(options.zoom);

      // Analyze camera view
      const analysis = analyzeCameraView(zoom, options.gap);

      // Display results with formatting
      // eslint-disable-next-line no-console
      console.log(chalk.bold('\nCamera Analysis Results:'));
      // eslint-disable-next-line no-console
      console.log(chalk.gray('━'.repeat(24)));
      // eslint-disable-next-line no-console
      console.log(
        chalk.cyan('📏 Maximum Distance:'),
        chalk.yellow(`${analysis.distanceInMeters.toFixed(2)} meters`),
      );
      // eslint-disable-next-line no-console
      console.log(
        chalk.cyan('📐 Optimal Tilt Angle:'),
        chalk.yellow(`${analysis.tiltAngle.degrees.toFixed(2)}°`),
      );
      // eslint-disable-next-line no-console
      console.log(
        chalk.cyan('📊 Visible Line Count:'),
        chalk.yellow(`${analysis.lineCount} lines`),
      );
      // eslint-disable-next-line no-console
      console.log(
        chalk.cyan('🔍 Focal Length:'),
        chalk.yellow(`${analysis.focalLength.toFixed(2)} mm`),
      );
      // eslint-disable-next-line no-console
      console.log('');
    } catch (error) {
      if (error instanceof InvalidZoomLevelError) {
        console.error(chalk.red('Error:'), error.message);
      } else if (error instanceof ImpossibleConstraintError) {
        console.error(chalk.red('Error:'), error.message);
      } else {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      }
      process.exit(1);
    }
  });

// Only parse arguments if this is the main module
if (require.main === module) {
  program.parse(process.argv);
}

export { program };
