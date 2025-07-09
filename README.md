# Camera Assessment Tool

A TypeScript-based CLI tool for analyzing camera views and calculating optimal parameters for detecting ground markings from elevated camera positions.

## Overview

The `camera-assessment` tool helps determine the optimal camera configuration for monitoring ground markings (such as parking lines or road markings) from an elevated position. It calculates viewing distances, tilt angles, and ensures adequate pixel separation between markings for reliable computer vision detection.

## Features

- 📏 **Maximum viewing distance calculation** based on camera zoom level
- 📐 **Optimal tilt angle determination** for best coverage
- 📊 **Line visibility analysis** with minimum pixel separation requirements
- 🖼️ **Visual demonstration generation** showing what the camera sees
- 📈 **Batch analysis** for multiple zoom levels with table/CSV output
- 🔧 **Flexible CLI** with intuitive commands and options

## Installation

```bash
# Install globally
npm install -g camera-assessment

# Or use with npx
npx camera-assessment analyze -z 5 -g 10
```

## Quick Start

### Basic Analysis

Analyze camera view at zoom level 5 with minimum 10-pixel gap between lines:

```bash
camera-assessment analyze -z 5 -g 10
```

Output:
```
Camera Analysis Results:
━━━━━━━━━━━━━━━━━━━━━━━━
📏 Maximum Distance: 220.00 meters
📐 Optimal Tilt Angle: 7.91°
📊 Visible Line Count: 110 lines
🔍 Focal Length: 24.00 mm
```

### Generate Visualization

Create a demonstration image showing visible ground markings:

```bash
camera-assessment analyze -z 5 -g 10 --generate-image
```

This creates an image at `./output/camera-strips-z5-g10.png` showing:
- Visible ground markings as horizontal strips
- Highlighted strips at regular intervals
- Camera parameters and analysis results

## CLI Reference

### Command: `analyze` (alias: `analyze-camera-view`)

Analyzes camera view and calculates optimal parameters.

#### Options

| Option | Description | Example |
|--------|-------------|---------|
| `-z, --zoom <range>` | Camera zoom level(s) ≥1 | `5`, `1-5`, `1,3,5` |
| `-g, --gap <number>` | Minimum pixel separation between lines | `10` |
| `-i, --generate-image` | Generate demonstration image | |
| `-o, --output <path>` | Custom output path for image | `./demo.png` |
| `-t, --transparent` | Create image with transparent background | |
| `-c, --csv-output <path>` | Export results to CSV file | `results.csv` |

#### Zoom Range Formats

- **Single value**: `-z 5`
- **Range**: `-z 1-5` (analyzes zoom levels 1, 2, 3, 4, 5)
- **List**: `-z 1,3,5,7`
- **Combined**: `-z 1-3,5,7-9`

### Examples

#### Single Zoom Analysis
```bash
camera-assessment analyze -z 10 -g 20
```

#### Multiple Zoom Comparison
```bash
camera-assessment analyze -z "1-10" -g 15
```

Output as table:
```
| Zoom | Max Distance (m) | Tilt Angle (°) | Line Count | Focal Length (mm) |
|------|------------------|----------------|------------|-------------------|
| 1    | 40.00           | 7.13           | 20         | 4.80              |
| 2    | 80.00           | 7.13           | 40         | 9.60              |
| 3    | 120.00          | 7.13           | 60         | 14.40             |
...
```

#### Export Results to CSV
```bash
camera-assessment analyze -z "1,5,10,15,20" -g 10 --csv-output analysis.csv
```

#### Generate Custom Visualization
```bash
camera-assessment analyze -z 8 -g 25 \
  --generate-image \
  --output ./my-camera-view.png \
  --transparent
```

## Camera Configuration

The tool assumes the following fixed camera parameters:

| Parameter | Value |
|-----------|-------|
| Camera Height | 20 meters above ground |
| Sensor Resolution | 2560×1440 pixels |
| Ground Line Spacing | 2 meters between markings |
| Base Focal Length | 4.8mm (at zoom=1) |
| Max Focal Length | 120mm (at zoom=25) |
| Horizontal FOV | 55° (at minimum zoom) |
| Vertical FOV | 33° (at minimum zoom) |

## Understanding the Results

### Maximum Distance
The furthest point on the ground that the camera can see while maintaining the minimum pixel separation between consecutive lines.

### Optimal Tilt Angle
The downward angle from horizontal that the camera should be tilted for optimal coverage.

### Visible Line Count
The number of ground markings (spaced 2 meters apart) visible within the camera's field of view.

### Focal Length
The calculated focal length of the camera lens at the specified zoom level.

## Use Cases

### 1. Parking Lot Monitoring
Determine optimal camera placement for monitoring parking spaces:
```bash
# Find zoom level that covers 50 parking spaces (100m)
camera-assessment analyze -z "1-25" -g 15
```

### 2. Road Marking Detection
Configure cameras for lane detection systems:
```bash
# Ensure 20-pixel separation for reliable lane detection
camera-assessment analyze -z 12 -g 20 --generate-image
```

### 3. Camera Installation Planning
Compare multiple zoom levels to choose the best camera:
```bash
# Generate comparison table and visuals
camera-assessment analyze -z "5,10,15,20" -g 10 --csv-output comparison.csv
```

### 4. Visual Documentation
Create demonstration images for proposals:
```bash
# Generate transparent overlay for presentations
camera-assessment analyze -z 8 -g 25 --generate-image --transparent
```

## Programmatic Usage

The tool can also be used as a TypeScript/JavaScript library:

```typescript
import { analyzeCameraView, Zoom, generateStripDemoImage } from 'camera-assessment';

// Analyze camera view
const zoom = new Zoom(5);
const analysis = analyzeCameraView(zoom, 10);

console.log({
  maxDistance: analysis.distanceInMeters,
  tiltAngle: analysis.tiltAngle.degrees,
  visibleLines: analysis.lineCount,
  focalLength: analysis.focalLength
});

// Generate visualization
const imagePath = await generateStripDemoImage(
  new Zoom(10),
  50, // minimum pixel gap
  './output/demo.png',
  false // transparent background
);
```

## Error Handling

The tool provides clear error messages for common issues:

- **Invalid zoom level**: Zoom must be ≥1
- **Impossible constraints**: Minimum pixel gap exceeds sensor height
- **No visible strips**: Parameters result in no visible ground markings
- **Image generation errors**: Issues creating output directory or writing files

## Development

### Building from Source
```bash
git clone https://github.com/goclever/camera-assessment.git
cd camera-assessment
pnpm install
pnpm run build
```

### Running Tests
```bash
pnpm test
pnpm run test:coverage
```

### Development Mode
```bash
pnpm run build:watch
pnpm run test:watch
```

## Technical Details

### Algorithm

1. **Focal Length Calculation**: Based on zoom level and base focal length
2. **Field of View**: Calculated from focal length and sensor dimensions
3. **Maximum Distance**: Derived from camera height, tilt angle, and FOV
4. **Line Visibility**: Computed based on pixel separation requirements
5. **Tilt Optimization**: Ensures maximum coverage while maintaining constraints

### Image Generation

Generated images include:
- Visual representation of ground markings
- Highlighted strips at regular intervals
- Camera parameter annotations
- Scale and distance indicators

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`pnpm run validate`)
- Code follows project conventions (see CLAUDE.md)
- No mocking in tests (real implementations only)
- 80%+ test coverage maintained

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
- GitHub Issues: [camera-assessment/issues](https://github.com/goclever/camera-assessment/issues)
- Documentation: See this README and inline JSDoc comments

---

Built with TypeScript, Commander.js, and Sharp for high-performance image processing.