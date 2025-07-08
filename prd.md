You are to write a TypeScript function

```typescript
function computeMaxDistance(
  zoomLevel: number,    // 1–25
  minPixelGap: number   // e.g. 10 px
): number                // returns D in meters
```

that returns D, the maximum horizontal ground distance (in meters) from the camera’s mounting point (line 0) to the furthest painted line such that—after choosing the optimal tilt (pitch) angle—the vertical pixel separation between that line and the one immediately before it is at least `minPixelGap`.



## Constants (hard-coded)

```typescript
const CAMERA_HEIGHT    = 20;      // m
const SENSOR_RES_X     = 2560;    // px
const SENSOR_RES_Y     = 1440;    // px
const LINE_SPACING     = 2;       // m
const F_MIN            = 4.8;     // mm at zoomLevel=1
const F_MAX            = 120;     // mm at zoomLevel=25
// linear mapping: f = F_MIN * zoomLevel (clamped ≤F_MAX)
```

## Sensor physical size (in mm), inferred at f = F_MIN from given FOV:

```typescript
// Horizontal FOV at f=4.8 mm is 55°
const SENSOR_WIDTH  = 2 * F_MIN * Math.tan(degToRad(55  / 2));
// Vertical   FOV at f=4.8 mm is 33°
const SENSOR_HEIGHT = 2 * F_MIN * Math.tan(degToRad(33  / 2));
```

## Assumptions

* Ideal pinhole projection, square pixels, principal point at image center.
* Lines on the ground (Z=0) are infinitely thin, parallel, spaced 2 m apart, perpendicular to the optical axis; line 0 is directly beneath the camera.
* Camera may pitch freely (no limits), no roll/yaw.
* Pixel separation vertically between projected lines N and N–1 must be ≥ minPixelGap.

----

## Implementation Requirements

1. Analytic derivation (in comments or accompanying doc):
  * Express the projection of a ground point at distance D and camera pitch θ into image‐plane y-coordinate.
  * Derive Δy (pixels) between line N and N–1 as a function of D, f, θ.
  * Solve for θ that maximizes D subject to Δy ≥ minPixelGap.

2. Algorithm:
  * Given `zoomLevel`, compute `f = Math.min(F_MIN * zoomLevel, F_MAX)`.
  * Search or solve directly for the tilt θ that yields the largest D with Δy ≥ `minPixelGap`.
  * Return that D (in meters).

3. Test/example:
  * computeMaxDistance(1, 10);   // wide-angle, 10 px
  * computeMaxDistance(25, 10);  // telephoto, 10 px

Use clear variable names, comments to explain each step, and ensure the result D = (# of strips) × LINE_SPACING.

## Tests

Why this proves correctness
  1. Corner‐case coverage (boundary tests) nails down behavior at extremes.
  2. Property‐based tests (small‐N consistency, monotonicity) systematically sweep the valid input region, catching off‐by‐one or formula‐errors.
  3. Round‐trip projection ensures the tilt‐and‐zoom solution your code picks actually meets the Δy constraint exactly where it should—and fails immediately beyond.

### 1. Boundary tests

| Test # | zoomLevel | minPixelGap (px) | Reasoning                                                                        | Expected D (m) |
| :----: | :-------: | :--------------: | :------------------------------------------------------------------------------- | :------------: |
|    1   |     1     |       2000       | larger than total vertical resolution → no two lines can ever be ≥ 2000 px apart |        0       |
|    2   |     1     |       1440       | exactly full sensor height → only line 1 vs line 0 can just span top→bottom      |        2       |
|    3   |     25    |       2000       | same as #1 but at max tele → still impossible                                    |        0       |
|    4   |     25    |       1440       | full‐height pixel gap still only spans first interval                            |        2       |


### 2. Small‐N consistency checks

For N = 1, 2, 5, 10:

1. Compute the “golden” pixel gap Δyₙ by plugging `𝑑 = 𝑁 × 2m` into your analytic projection formula and choosing the optimal tilt θ that places line N at the bottom of the frame.

2. Assert
```typescript
// using a tiny tolerance ε, e.g. 1e–6
const goldenGap = computeTheoreticalGap(zoomLevel, N);
expect(computeMaxDistance(zoomLevel, Math.floor(goldenGap)))
  .toBeGreaterThanOrEqual(N * LINE_SPACING);
expect(computeMaxDistance(zoomLevel, Math.ceil (goldenGap) + 1))
  .toBeLessThan(       N * LINE_SPACING);
```

Run that loop for `zoomLevel = 1` and `zoomLevel = 25`.
This property‐based check covers a broad swath of the space without hard‐coding every D.

### 3. Monotonicity & sanity
  * Monotonic in zoom: For a fixed `minPixelGap`, increasing `zoomLevel` should never decrease D.
```typescript
expect(computeMaxDistance(z, g))
  .toBeLessThanOrEqual(computeMaxDistance(z+1, g));
```
  * Monotonic in gap: For a fixed zoomLevel, increasing minPixelGap should never increase D.

```typescript 
expect(computeMaxDistance(z, g))
  .toBeGreaterThanOrEqual(computeMaxDistance(z, g+1));

```

### 4. Round‐trip check
Pick a random `(zoomLevel, D)` pair within the camera’s coverage, project lines N = D/2 and N–1 back into pixel coordinates at the tilt your solver chose, and verify Δy ≥ minPixelGap (and that for N+1 it would violate the requirement).