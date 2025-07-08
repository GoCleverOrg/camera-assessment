import { analyzeCameraView } from '../src/analyze-camera-view';
import { generateStripVisualizations } from '../src/rendering/strip-visualizer';
import { renderStripsToImage } from '../src/rendering/image-generator';
import { Zoom } from '../src/types/zoom';
import { ImageCompositionOptions } from '../src/types/rendering';
import { SENSOR_RES_X, SENSOR_RES_Y } from '../src/utils/constants';
import * as path from 'path';

/**
 * Example: Generate a transparent overlay image for compositing
 */
async function generateTransparentOverlay() {
  try {
    const zoomLevel = 10;
    const minPixelGap = 20;
    
    console.log(`Creating transparent overlay with zoom=${zoomLevel}x...`);
    
    // Analyze and generate strips
    const zoom = new Zoom(zoomLevel);
    const analysis = analyzeCameraView(zoom, minPixelGap);
    const strips = generateStripVisualizations(analysis);
    
    // Create transparent image
    const outputPath = path.join(process.cwd(), 'output', 'transparent-overlay.png');
    const options: ImageCompositionOptions = {
      width: SENSOR_RES_X,
      height: SENSOR_RES_Y,
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fully transparent
      layers: [
        {
          type: 'strip',
          data: { strips, outputPath },
        },
      ],
    };
    
    const result = await renderStripsToImage(options);
    
    console.log(`✅ Transparent overlay created: ${result.outputPath}`);
    console.log(`   ${result.stripCount} strips rendered`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateTransparentOverlay();