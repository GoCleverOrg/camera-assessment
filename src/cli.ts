#!/usr/bin/env node

import { Command } from 'commander';
import { computeMaxDistance } from './compute-max-distance';

const program = new Command();

program
  .name('camera-assessment')
  .description('CLI tool for camera assessment calculations')
  .version('1.0.0');

program
  .command('compute-max-distance')
  .description(
    'Compute the maximum horizontal ground distance from camera to furthest visible line',
  )
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
      const maxDistance = computeMaxDistance(options.zoom, options.gap);
      // eslint-disable-next-line no-console
      console.log(`Maximum distance: ${maxDistance} meters`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Only parse arguments if this is the main module
if (require.main === module) {
  program.parse(process.argv);
}

export { program };
