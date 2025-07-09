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
import { parseZoomRange } from './utils/zoom-range-parser';
import { processBatch, getSuccessfulResults, getFailedResults } from './utils/batch-processor';
import { TableFormatter, TableRow } from './utils/table-formatter';

interface CLIOptions {
  zoom: string;
  gap: number;
  height?: number;
  generateImage?: boolean;
  output?: string;
  transparent?: boolean;
  csvOutput?: string;
}

const program = new Command();

program
  .name('camera-assessment')
  .description('CLI tool for camera assessment calculations')
  .version('1.0.0');

program
  .command('analyze')
  .alias('analyze-camera-view')
  .description('Analyze camera view for given zoom level and pixel gap')
  .requiredOption('-z, --zoom <range>', 'Camera zoom level (≥1) or range (e.g., "1-5", "1,3,5")')
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
  .option('-h, --height <number>', 'Camera height in meters (default: 20)', (value) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error('Camera height must be a positive number');
    }
    return parsed;
  })
  .option('-i, --generate-image', 'Generate a demonstration image showing visible strips')
  .option(
    '-o, --output <path>',
    'Output path for the generated image (defaults to ./output/camera-strips-z{zoom}-g{gap}.png)',
  )
  .option('-t, --transparent', 'Create image with transparent background')
  .option('-c, --csv-output <path>', 'Export results to CSV file')
  .addHelpText(
    'after',
    `
Examples:
  $ camera-assessment analyze -z 5 -g 10
  $ camera-assessment analyze -z 5 -g 10 -h 15
  $ camera-assessment analyze -z "1-5" -g 10
  $ camera-assessment analyze -z "1,3,5,7" -g 10
  $ camera-assessment analyze -z "1-3,5,7-9" -g 10 --csv-output results.csv
  $ camera-assessment analyze-camera-view -z 5 -g 10 --generate-image
  $ camera-assessment analyze-camera-view -z 5 -g 10 --generate-image --output ./overlay.png
  $ camera-assessment analyze-camera-view -z 5 -g 10 --generate-image --transparent`,
  )
  .action(async (options: CLIOptions) => {
    try {
      // Parse zoom range
      const zoomResult = parseZoomRange(options.zoom);
      if (!zoomResult.success) {
        throw new Error(`Invalid zoom range: ${zoomResult.error}`);
      }

      // Validate all zoom values are at least 1
      for (const zoomValue of zoomResult.values) {
        if (zoomValue < 1) {
          throw new Error(`Zoom level ${zoomValue} is out of range. Must be at least 1.`);
        }
      }

      // If single zoom value, use existing behavior
      if (zoomResult.values.length === 1) {
        const zoom = new Zoom(zoomResult.values[0]);
        const analysis = analyzeCameraView(zoom, options.gap, options.height);

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
          const outputPath =
            options.output ||
            `./output/camera-strips-z${zoomResult.values[0]}-g${options.gap}${options.transparent ? '-transparent' : ''}.png`;

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
            options.height,
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
      } else {
        // Multiple zoom values - use batch processor
        // eslint-disable-next-line no-console
        console.log(chalk.bold('\nAnalyzing multiple zoom levels...'));
        // eslint-disable-next-line no-console
        console.log(chalk.gray('━'.repeat(80)));

        // Use batch processor
        const results = await processBatch(zoomResult.values, {
          gap: options.gap,
          height: options.height,
          generateImage: options.generateImage || false,
          outputBasePath: options.output || './output',
          transparent: options.transparent || false,
        });

        // Separate successful and failed results
        const successful = getSuccessfulResults(results);
        const failed = getFailedResults(results);

        // Display table if we have successful results
        if (successful.length > 0) {
          const tableRows: TableRow[] = successful.map((result) => ({
            zoom: result.zoomLevel,
            maxDistance: result.analysis.distanceInMeters,
            tiltAngle: result.analysis.tiltAngle.degrees,
            lineCount: result.analysis.lineCount,
            focalLength: result.analysis.focalLength,
          }));

          const formatter = new TableFormatter();
          // eslint-disable-next-line no-console
          console.log('\n' + formatter.formatMarkdown(tableRows));

          // Save to CSV if requested
          if (options.csvOutput) {
            const csvContent = formatter.formatCSV(tableRows);

            // Ensure output directory exists
            const csvDir = path.dirname(options.csvOutput);
            if (!fs.existsSync(csvDir)) {
              fs.mkdirSync(csvDir, { recursive: true });
            }

            fs.writeFileSync(options.csvOutput, csvContent);
            // eslint-disable-next-line no-console
            console.log(chalk.green('✓ CSV file saved to:'), chalk.yellow(options.csvOutput));
          }

          // Report generated images
          if (options.generateImage) {
            const imagesGenerated = successful.filter((r) => r.imagePath);
            if (imagesGenerated.length > 0) {
              // eslint-disable-next-line no-console
              console.log(chalk.green(`\n✓ Generated ${imagesGenerated.length} images:`));
              imagesGenerated.forEach((result) => {
                // eslint-disable-next-line no-console
                console.log(chalk.cyan('  📄'), chalk.yellow(result.imagePath));
              });
            }
          }
        }

        // Report failures
        if (failed.length > 0) {
          // eslint-disable-next-line no-console
          console.log(chalk.red('\n✗ Failed zoom levels:'));
          failed.forEach((result) => {
            // eslint-disable-next-line no-console
            console.log(chalk.red(`  Zoom ${result.zoomLevel}: ${result.error}`));
          });
        }

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
