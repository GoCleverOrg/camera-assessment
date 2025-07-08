#!/usr/bin/env node

import { analyzeCameraView } from '../src/analyze-camera-view';
import { generateStripVisualizations } from '../src/rendering/strip-visualizer';
import { renderStripsToImage } from '../src/rendering/image-generator';
import { Zoom } from '../src/types/zoom';
import { ImageCompositionOptions, StripStyle, TextOverlayConfig } from '../src/types/rendering';
import { SENSOR_RES_X, SENSOR_RES_Y } from '../src/utils/constants';
import * as path from 'path';

/**
 * Example: Generate a strip visualization image from camera analysis
 */
async function generateStripDemoImage() {
  try {
    // Camera parameters
    const zoomLevel = 5;
    const minPixelGap = 45;
    
    console.log(`Analyzing camera with zoom=${zoomLevel}x and minPixelGap=${minPixelGap}px...`);
    
    // Step 1: Analyze camera view
    const zoom = new Zoom(zoomLevel);
    const analysis = analyzeCameraView(zoom, minPixelGap);
    
    console.log(`Analysis results:`);
    console.log(`- Distance: ${analysis.distanceInMeters.toFixed(1)}m`);
    console.log(`- Tilt angle: ${analysis.tiltAngle.degrees.toFixed(1)}°`);
    console.log(`- Line count: ${analysis.lineCount}`);
    console.log(`- Focal length: ${analysis.focalLength}mm`);
    
    // Step 2: Generate strip visualizations
    const strips = generateStripVisualizations(analysis);
    console.log(`\nGenerated ${strips.length} visible strips`);
    
    // Step 3: Define custom style
    const customStyle: StripStyle = {
      thickness: 3,
      opaqueColor: '#00FF00',
      transparentColor: '#00FF00', 
      highlightColor: '#FF00FF',
      opacity: 1.0,
    };
    
    // Step 4: Create text annotations
    const annotations: TextOverlayConfig[] = [
      {
        text: 'Camera Strip Visualization Demo',
        x: SENSOR_RES_X / 2,
        y: 40,
        fontSize: 28,
        color: '#FFFFFF',
        align: 'center',
      },
      {
        text: `Camera Settings: Zoom ${zoomLevel}x, Min Gap ${minPixelGap}px`,
        x: 50,
        y: 100,
        fontSize: 20,
        color: '#CCCCCC',
      },
      {
        text: `Analysis: ${analysis.distanceInMeters.toFixed(1)}m range, ${analysis.tiltAngle.degrees.toFixed(1)}° tilt`,
        x: 50,
        y: 130,
        fontSize: 20,
        color: '#CCCCCC',
      },
      {
        text: `Detected ${strips.length} of ${analysis.lineCount} total strips`,
        x: 50,
        y: 160,
        fontSize: 20,
        color: '#CCCCCC',
      },
    ];
    
    // Step 5: Define image composition options
    const outputPath = path.join(process.cwd(), 'output', `demo-strips-zoom${zoomLevel}-gap${minPixelGap}.png`);
    const options: ImageCompositionOptions = {
      width: SENSOR_RES_X,
      height: SENSOR_RES_Y,
      background: { r: 32, g: 32, b: 64, alpha: 1 }, // Dark blue background
      layers: [
        {
          type: 'strip',
          data: { strips, style: customStyle, outputPath },
        },
        ...annotations.map(annotation => ({
          type: 'text' as const,
          data: annotation,
        })),
      ],
    };
    
    // Step 6: Render the image
    console.log(`\nRendering image...`);
    const result = await renderStripsToImage(options);
    
    console.log(`\n✅ Image generated successfully!`);
    console.log(`- Output: ${result.outputPath}`);
    console.log(`- Size: ${result.dimensions.width}x${result.dimensions.height}`);
    console.log(`- Strips rendered: ${result.stripCount}`);
    console.log(`- File size: ${(result.metadata.fileSize / 1024).toFixed(1)}KB`);
    console.log(`- Render time: ${result.metadata.renderTime}ms`);
    
  } catch (error) {
    console.error('❌ Error generating image:', error);
    process.exit(1);
  }
}

// Run the example
generateStripDemoImage();