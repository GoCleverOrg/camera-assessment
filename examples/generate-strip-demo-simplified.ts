#!/usr/bin/env node

import { generateStripDemoImage } from '../src/rendering/strip-demo-generator';
import { Zoom } from '../src/types/zoom';
import * as path from 'path';

/**
 * Example: Generate a strip visualization image using the simplified API
 * 
 * This example demonstrates the new integrated generateStripDemoImage function
 * that combines camera analysis, strip visualization, and image rendering
 * into a single convenient API.
 */
async function runExample() {
  try {
    console.log('=== Strip Demo Image Generator - Simplified API ===\n');

    // Example 1: Basic usage with opaque background
    console.log('Example 1: Basic strip visualization');
    const zoom1 = new Zoom(10);
    const outputPath1 = path.join(process.cwd(), 'output', 'simple-demo-zoom10.png');
    
    const result1 = await generateStripDemoImage(
      zoom1,
      50, // minimum 50 pixels between strips
      outputPath1,
      false // opaque background
    );
    
    console.log(`✓ Generated ${result1.outputPath}`);
    console.log(`  - ${result1.stripCount} strips rendered`);
    console.log(`  - Image size: ${result1.dimensions.width}x${result1.dimensions.height}`);
    console.log(`  - File size: ${(result1.metadata.fileSize / 1024).toFixed(1)}KB\n`);

    // Example 2: Transparent background for overlays
    console.log('Example 2: Transparent background for overlay');
    const zoom2 = new Zoom(15);
    const outputPath2 = path.join(process.cwd(), 'output', 'overlay-demo-zoom15.png');
    
    const result2 = await generateStripDemoImage(
      zoom2,
      75, // minimum 75 pixels between strips
      outputPath2,
      true // transparent background
    );
    
    console.log(`✓ Generated ${result2.outputPath}`);
    console.log(`  - ${result2.stripCount} strips rendered`);
    console.log(`  - Render time: ${result2.metadata.renderTime}ms\n`);

    // Example 3: Different zoom levels comparison
    console.log('Example 3: Comparing different zoom levels');
    const zoomLevels = [1, 5, 10, 15, 20, 25];
    
    for (const level of zoomLevels) {
      const zoom = new Zoom(level);
      const outputPath = path.join(process.cwd(), 'output', `comparison-zoom${level}.png`);
      
      try {
        const result = await generateStripDemoImage(
          zoom,
          100, // consistent gap for comparison
          outputPath
        );
        
        console.log(`  Zoom ${level.toString().padStart(2)}x: ${result.stripCount} strips`);
      } catch (error) {
        console.log(`  Zoom ${level.toString().padStart(2)}x: No visible strips`);
      }
    }

    console.log('\n✅ All examples completed successfully!');
    console.log('Check the output/ directory for generated images.');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the example
runExample();