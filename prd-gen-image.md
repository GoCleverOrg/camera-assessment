You are given an existing TypeScript module that correctly implements and thoroughly tests:

```typescript
function computeMaxDistance(
  zoomLevel: number,    // 1–25
  minPixelGap: number   // e.g. 10 px
): number                // returns D in meters
```

Your task is to extend this module by adding a new function:
```typescript
async function generateStripDemoImage(options: {
  zoomLevel: number,      // 1–25
  minPixelGap: number,    // e.g. 10 px
  imageWidth: number,     // px, e.g. 2560
  imageHeight: number,    // px, e.g. 1440
  outputPath: string      // e.g. "./demo.png"
}): Promise<void>;
```


which will:

1. Call computeMaxDistance(zoomLevel, minPixelGap) to compute D (in meters) and thus the number of visible strips N = ⌊D / LINE_SPACING⌋.
2. Simulate a perspective (pinhole) view of the camera—height 20 m, focal length = F_MIN × zoomLevel (clamped to F_MAX), sensor size inferred—tilted optimally so strip N sits on the bottom edge.
3. Render the first N infinitely thin, parallel ground strips (spaced 2 m apart) into a 2D image of size imageWidth × imageHeight px:
  * Draw strips in alternating fill colors (you choose a simple white/light-gray palette).
  * Overlay only the two furthest strips (N–1 and N) in a highlight color, and annotate the vertical pixel gap between them as text.
4. Throw an error if N < 1 (“No visible strips for given parameters”).
5. Save the image (PNG or JPEG) to outputPath.

Implementation guidance
* Target a Node.js environment. You may choose any existing TypeScript-friendly graphics library (e.g. canvas, @napi-rs/canvas, sharp, etc.). If you need a library not already installed, briefly comment how you’d install it and why it’s the best choice.
* Reuse the same constants and intrinsics from computeMaxDistance:
```
const CAMERA_HEIGHT = 20;      // m
const SENSOR_RES_X  = 2560;    // px
const SENSOR_RES_Y  = 1440;    // px
const LINE_SPACING  = 2;       // m
const F_MIN         = 4.8;     // mm at zoomLevel=1
const F_MAX         = 120;     // mm at zoomLevel=25
// sensor width/height in mm inferred from FOV at F_MIN
```
* Include clear inline comments for your projection math and rendering steps.
* Provide a brief usage example in comments at the bottom of the file:
```
// Example:
// await generateStripDemoImage({
//   zoomLevel: 5,
//   minPixelGap: 10,
//   imageWidth: SENSOR_RES_X,
//   imageHeight: SENSOR_RES_Y,
//   outputPath: "./demo.png"
// });
```
* Ensure the final image accurately reflects the optimized tilt and pixel-gap constraint.
