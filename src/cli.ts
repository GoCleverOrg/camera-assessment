#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { analyzeCameraView } from './analyze-camera-view';
import { generateStripDemoImage } from './rendering/strip-demo-generator';
import { Zoom } from './types/zoom';
import { ImpossibleConstraintError, InvalidZoomLevelError } from './errors/camera-errors';
import { NoVisibleStripsError, ImageGenerationError } from './errors/rendering-errors';

const program = new Command();

program
  .name('camera-assessment')
  .description('CLI tool for camera assessment calculations')
  .version('1.0.0');

program
  .command('analyze')
  .alias('analyze-camera-view')
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
  .option('-i, --generate-image', 'Generate a demonstration image showing visible strips')
  .option(
    '-o, --output <path>',
    'Output path for the generated image (defaults to ./camera-strips-z{zoom}-g{gap}.png)',
  )
  .option('-t, --transparent', 'Create image with transparent background')
  .addHelpText(
    'after',
    `
Examples:
  $ camera-assessment analyze -z 5 -g 10
  $ camera-assessment analyze-camera-view -z 5 -g 10 --generate-image
  $ camera-assessment analyze-camera-view -z 5 -g 10 --generate-image --output ./overlay.png
  $ camera-assessment analyze-camera-view -z 5 -g 10 --generate-image --transparent`,
  )
  .action(
    async (options: {
      zoom: number;
      gap: number;
      generateImage?: boolean;
      output?: string;
      transparent?: boolean;
    }) => {
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

        // Generate image if requested
        if (options.generateImage) {
          // eslint-disable-next-line no-console
          console.log(chalk.cyan('🎨 Generating image...'));

          // Generate default output path if not provided
          const outputPath = options.output || 
            `./camera-strips-z${options.zoom}-g${options.gap}${options.transparent ? '-transparent' : ''}.png`;

          // Ensure output directory exists
          const outputDir = path.dirname(outputPath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // Generate the demonstration image
          const result = await generateStripDemoImage(
            zoom,
            options.gap,
            outputPath,
            options.transparent || false,
          );

          // eslint-disable-next-line no-console
          console.log(chalk.green('✓ Image generated successfully!'));
          // eslint-disable-next-line no-console
          console.log(chalk.cyan('📄 Output Path:'), chalk.yellow(result.outputPath));
          // eslint-disable-next-line no-console
          console.log(
            chalk.cyan('🎯 Strips Rendered:'),
            chalk.yellow(`${result.stripCount} strips`),
          );
          // eslint-disable-next-line no-console
          console.log('');
        }
      } catch (error) {
        if (error instanceof InvalidZoomLevelError) {
          console.error(chalk.red('Error:'), error.message);
        } else if (error instanceof ImpossibleConstraintError) {
          console.error(chalk.red('Error:'), error.message);
        } else if (error instanceof NoVisibleStripsError) {
          console.error(chalk.red('Error:'), error.message);
          console.error(
            chalk.yellow('Try adjusting the zoom level or reducing the minimum pixel gap.'),
          );
        } else if (error instanceof ImageGenerationError) {
          console.error(chalk.red('Error generating image:'), error.message);
          if (error.cause) {
            console.error(chalk.gray('Caused by:'), error.cause.message);
          }
        } else {
          console.error(
            chalk.red('Error:'),
            error instanceof Error ? error.message : String(error),
          );
        }
        process.exit(1);
      }
    },
  );

// Only parse arguments if this is the main module
if (require.main === module) {
  program.parse(process.argv);
}

export { program };
