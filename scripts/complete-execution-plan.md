# Complete Execution Plan: Camera Distance Calculator

## Overview

This is a comprehensive execution plan for implementing the `computeMaxDistance` function following TDD/BDD principles with NO MOCKS as per CLAUDE.md guidelines.

## Prerequisites

Ensure the following are set up:
- Node.js and pnpm installed
- TypeScript project configured
- Jest testing framework ready
- ESLint and Prettier configured

## Execution Steps

### Phase 1: Foundation (30 minutes)

#### 1.1 Create Directory Structure
```bash
# Create all necessary directories
mkdir -p src/{types,core,utils,__tests__/fixtures}

# Create initial files
touch src/utils/constants.ts
touch src/types/camera-types.ts
touch src/utils/math-helpers.ts
touch src/__tests__/compute-max-distance.test.ts
```

#### 1.2 Define Constants
```typescript
// src/utils/constants.ts
export const CAMERA_HEIGHT = 20; // meters
export const SENSOR_RES_X = 2560; // pixels
export const SENSOR_RES_Y = 1440; // pixels
export const LINE_SPACING = 2; // meters
export const F_MIN = 4.8; // mm at zoomLevel=1
export const F_MAX = 120; // mm at zoomLevel=25

// FOV at minimum focal length
export const FOV_HORIZONTAL = 55; // degrees
export const FOV_VERTICAL = 33; // degrees

// Calculated sensor dimensions
export const SENSOR_WIDTH = 2 * F_MIN * Math.tan((FOV_HORIZONTAL / 2) * Math.PI / 180);
export const SENSOR_HEIGHT = 2 * F_MIN * Math.tan((FOV_VERTICAL / 2) * Math.PI / 180);

// Numerical tolerances
export const ANGLE_TOLERANCE = 1e-6;
export const PIXEL_TOLERANCE = 0.01;
export const DISTANCE_TOLERANCE = 0.001;
```

#### 1.3 Define Types
```typescript
// src/types/camera-types.ts
export interface CameraConfig {
  height: number;
  sensorResolution: {
    x: number;
    y: number;
  };
  sensorDimensions: {
    width: number;
    height: number;
  };
}

export interface ProjectionParams {
  focalLength: number;
  tiltAngle: number; // radians
  cameraHeight: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}
```

### Phase 2: TDD - First Failing Test (15 minutes)

#### 2.1 Write First Test
```typescript
// src/__tests__/compute-max-distance.test.ts
import { computeMaxDistance } from '../compute-max-distance';

describe('computeMaxDistance', () => {
  describe('boundary conditions', () => {
    it('returns 0 when minPixelGap exceeds sensor height', () => {
      expect(computeMaxDistance(1, 2000)).toBe(0);
    });
  });
});
```

#### 2.2 Run Test (Should Fail)
```bash
pnpm test compute-max-distance.test.ts
# Expected: Error - computeMaxDistance is not defined
```

### Phase 3: Minimal Implementation (45 minutes)

#### 3.1 Create Main Function Stub
```typescript
// src/compute-max-distance.ts
import { SENSOR_RES_Y } from './utils/constants';

export function computeMaxDistance(
  zoomLevel: number,
  minPixelGap: number
): number {
  // Handle impossible constraint
  if (minPixelGap > SENSOR_RES_Y) {
    return 0;
  }
  
  // TODO: Implement actual calculation
  return 0;
}
```

#### 3.2 Verify Test Passes
```bash
pnpm test compute-max-distance.test.ts
# Should pass now
```

#### 3.3 Add More Boundary Tests
```typescript
// Add to test file
it('returns 2 when minPixelGap equals sensor height', () => {
  expect(computeMaxDistance(1, 1440)).toBe(2);
});

it('returns 0 for impossible gap at max zoom', () => {
  expect(computeMaxDistance(25, 2000)).toBe(0);
});

it('returns 2 for full height gap at max zoom', () => {
  expect(computeMaxDistance(25, 1440)).toBe(2);
});
```

### Phase 4: Mathematical Helpers (1 hour)

#### 4.1 Math Helper Tests First
```typescript
// src/__tests__/math-helpers.test.ts
import { degToRad, getFocalLength, computeSensorDimensions } from '../utils/math-helpers';

describe('math helpers', () => {
  describe('degToRad', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(degToRad(0)).toBe(0);
    });
    
    it('converts 180 degrees to π radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
    });
    
    it('converts 90 degrees to π/2 radians', () => {
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2, 10);
    });
  });
  
  describe('getFocalLength', () => {
    it('returns 4.8mm for zoom level 1', () => {
      expect(getFocalLength(1)).toBe(4.8);
    });
    
    it('returns 120mm for zoom level 25', () => {
      expect(getFocalLength(25)).toBe(120);
    });
    
    it('returns 48mm for zoom level 10', () => {
      expect(getFocalLength(10)).toBe(48);
    });
    
    it('clamps at 120mm for zoom > 25', () => {
      expect(getFocalLength(30)).toBe(120);
    });
  });
});
```

#### 4.2 Implement Math Helpers
```typescript
// src/utils/math-helpers.ts
import { F_MIN, F_MAX } from './constants';

export function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

export function radToDeg(radians: number): number {
  return radians * 180 / Math.PI;
}

export function getFocalLength(zoomLevel: number): number {
  return Math.min(F_MIN * zoomLevel, F_MAX);
}

export function computeSensorDimensions() {
  const width = 2 * F_MIN * Math.tan(degToRad(55 / 2));
  const height = 2 * F_MIN * Math.tan(degToRad(33 / 2));
  return { width, height };
}
```

### Phase 5: Projection System (2 hours)

#### 5.1 Projection Tests
```typescript
// src/__tests__/projection.test.ts
import { projectGroundPoint, computePixelGap } from '../core/projection';
import { degToRad } from '../utils/math-helpers';

describe('projection system', () => {
  describe('projectGroundPoint', () => {
    it('projects point directly below camera to center when looking down', () => {
      const params = {
        focalLength: 4.8,
        tiltAngle: -Math.PI / 2, // Looking straight down
        cameraHeight: 20
      };
      
      const result = projectGroundPoint(0, params);
      expect(result.y).toBeCloseTo(720, 1); // Center of 1440px sensor
    });
    
    it('projects distant point correctly with forward tilt', () => {
      const params = {
        focalLength: 4.8,
        tiltAngle: degToRad(30),
        cameraHeight: 20
      };
      
      const result = projectGroundPoint(20, params);
      expect(result.y).toBeLessThan(720); // Above center
    });
  });
});
```

#### 5.2 Implement Projection
```typescript
// src/core/projection.ts
import { ProjectionParams, Point2D } from '../types/camera-types';
import { SENSOR_HEIGHT, SENSOR_RES_Y } from '../utils/constants';

export function projectGroundPoint(
  distance: number,
  params: ProjectionParams
): Point2D {
  const { focalLength, tiltAngle, cameraHeight } = params;
  
  // Camera coordinates after rotation
  const yCam = -cameraHeight * Math.cos(tiltAngle) + distance * Math.sin(tiltAngle);
  const zCam = cameraHeight * Math.sin(tiltAngle) + distance * Math.cos(tiltAngle);
  
  // Avoid division by zero
  if (Math.abs(zCam) < 1e-10) {
    return { x: SENSOR_RES_X / 2, y: SENSOR_RES_Y / 2 };
  }
  
  // Project to image plane
  const yImage = focalLength * (yCam / zCam);
  
  // Convert to pixel coordinates
  const yPixel = (yImage / SENSOR_HEIGHT + 0.5) * SENSOR_RES_Y;
  
  return {
    x: SENSOR_RES_X / 2, // Always centered horizontally
    y: yPixel
  };
}

export function computePixelGap(
  lineDistance: number,
  prevLineDistance: number,
  params: ProjectionParams
): number {
  const currentProjection = projectGroundPoint(lineDistance, params);
  const prevProjection = projectGroundPoint(prevLineDistance, params);
  
  return Math.abs(currentProjection.y - prevProjection.y);
}
```

### Phase 6: Optimization Algorithm (2 hours)

#### 6.1 Optimization Tests
```typescript
// src/__tests__/optimization.test.ts
import { findOptimalTilt, findMaximumDistance } from '../core/optimization';

describe('optimization', () => {
  describe('findOptimalTilt', () => {
    it('finds tilt that places target line near bottom of frame', () => {
      const tilt = findOptimalTilt(20, 4.8);
      // Should place line at ~20m near bottom of sensor
      expect(tilt).toBeGreaterThan(0);
      expect(tilt).toBeLessThan(Math.PI / 2);
    });
  });
  
  describe('findMaximumDistance', () => {
    it('finds maximum distance respecting pixel gap constraint', () => {
      const result = findMaximumDistance(4.8, 10);
      expect(result).toBeGreaterThan(0);
      expect(result % 2).toBe(0); // Should be multiple of LINE_SPACING
    });
  });
});
```

#### 6.2 Implement Optimization
```typescript
// src/core/optimization.ts
import { ProjectionParams } from '../types/camera-types';
import { CAMERA_HEIGHT, LINE_SPACING, SENSOR_RES_Y, DISTANCE_TOLERANCE } from '../utils/constants';
import { projectGroundPoint, computePixelGap } from './projection';

export function findOptimalTilt(targetDistance: number, focalLength: number): number {
  // Initial estimate: angle to look at target point
  let tilt = Math.atan2(targetDistance, CAMERA_HEIGHT);
  
  // Refine to place line near bottom of sensor
  const targetPixel = SENSOR_RES_Y * 0.9; // 90% down the sensor
  
  // Newton's method for refinement
  for (let i = 0; i < 20; i++) {
    const params: ProjectionParams = {
      focalLength,
      tiltAngle: tilt,
      cameraHeight: CAMERA_HEIGHT
    };
    
    const projection = projectGroundPoint(targetDistance, params);
    const error = projection.y - targetPixel;
    
    if (Math.abs(error) < 1) break;
    
    // Adjust tilt based on error
    const delta = 0.0001;
    const paramsDelta = { ...params, tiltAngle: tilt + delta };
    const projectionDelta = projectGroundPoint(targetDistance, paramsDelta);
    const derivative = (projectionDelta.y - projection.y) / delta;
    
    if (Math.abs(derivative) > 1e-6) {
      tilt -= error / derivative * 0.5; // Damped update
    }
  }
  
  return tilt;
}

export function findMaximumDistance(
  focalLength: number,
  minPixelGap: number
): number {
  let left = 0;
  let right = 200; // Maximum reasonable distance
  
  while (right - left > DISTANCE_TOLERANCE) {
    const mid = (left + right) / 2;
    const distance = Math.floor(mid / LINE_SPACING) * LINE_SPACING;
    
    if (distance <= 0) {
      left = mid;
      continue;
    }
    
    const optimalTilt = findOptimalTilt(distance, focalLength);
    const params: ProjectionParams = {
      focalLength,
      tiltAngle: optimalTilt,
      cameraHeight: CAMERA_HEIGHT
    };
    
    const gap = computePixelGap(distance, distance - LINE_SPACING, params);
    
    if (gap >= minPixelGap) {
      left = mid;
    } else {
      right = mid;
    }
  }
  
  return Math.floor(left / LINE_SPACING) * LINE_SPACING;
}
```

### Phase 7: Complete Main Function (1 hour)

#### 7.1 Integration Tests
```typescript
// Add to compute-max-distance.test.ts
describe('integration tests', () => {
  describe('monotonicity properties', () => {
    it('never decreases with increasing zoom', () => {
      const gap = 50;
      for (let z = 1; z < 24; z++) {
        const d1 = computeMaxDistance(z, gap);
        const d2 = computeMaxDistance(z + 1, gap);
        expect(d2).toBeGreaterThanOrEqual(d1);
      }
    });
    
    it('never increases with increasing gap', () => {
      const zoom = 10;
      for (let g = 10; g < 100; g += 10) {
        const d1 = computeMaxDistance(zoom, g);
        const d2 = computeMaxDistance(zoom, g + 10);
        expect(d2).toBeLessThanOrEqual(d1);
      }
    });
  });
});
```

#### 7.2 Complete Implementation
```typescript
// src/compute-max-distance.ts
import { SENSOR_RES_Y } from './utils/constants';
import { getFocalLength } from './utils/math-helpers';
import { findMaximumDistance } from './core/optimization';

/**
 * Computes the maximum horizontal ground distance from the camera to the furthest
 * visible line while maintaining minimum pixel separation between consecutive lines.
 * 
 * @param zoomLevel - Camera zoom level (1-25)
 * @param minPixelGap - Minimum vertical pixel separation between consecutive lines
 * @returns Maximum distance in meters (multiple of 2m line spacing)
 */
export function computeMaxDistance(
  zoomLevel: number,
  minPixelGap: number
): number {
  // Validate inputs
  if (minPixelGap > SENSOR_RES_Y) {
    return 0; // Impossible constraint
  }
  
  if (minPixelGap === SENSOR_RES_Y) {
    return 2; // Only one line pair can fit
  }
  
  // Calculate focal length for given zoom
  const focalLength = getFocalLength(zoomLevel);
  
  // Find maximum distance using optimization
  return findMaximumDistance(focalLength, minPixelGap);
}
```

### Phase 8: Property-Based Tests (1 hour)

#### 8.1 Small-N Consistency Tests
```typescript
// src/__tests__/fixtures/test-helpers.ts
import { computeMaxDistance } from '../../compute-max-distance';
import { getFocalLength } from '../../utils/math-helpers';
import { findOptimalTilt } from '../../core/optimization';
import { computePixelGap } from '../../core/projection';
import { CAMERA_HEIGHT, LINE_SPACING } from '../../utils/constants';

export function computeTheoreticalGap(zoomLevel: number, numLines: number): number {
  const distance = numLines * LINE_SPACING;
  const focalLength = getFocalLength(zoomLevel);
  const optimalTilt = findOptimalTilt(distance, focalLength);
  
  const params = {
    focalLength,
    tiltAngle: optimalTilt,
    cameraHeight: CAMERA_HEIGHT
  };
  
  return computePixelGap(distance, distance - LINE_SPACING, params);
}

// Add to main test file
describe('small-N consistency', () => {
  const testCases = [1, 2, 5, 10];
  const zoomLevels = [1, 25];
  
  zoomLevels.forEach(zoom => {
    describe(`zoom level ${zoom}`, () => {
      testCases.forEach(n => {
        it(`correctly handles ${n} lines`, () => {
          const theoreticalGap = computeTheoreticalGap(zoom, n);
          const distance = n * LINE_SPACING;
          
          // Should achieve at least this distance with floor(gap)
          expect(computeMaxDistance(zoom, Math.floor(theoreticalGap)))
            .toBeGreaterThanOrEqual(distance);
          
          // Should not achieve this distance with ceil(gap) + 1
          expect(computeMaxDistance(zoom, Math.ceil(theoreticalGap) + 1))
            .toBeLessThan(distance);
        });
      });
    });
  });
});
```

#### 8.2 Round-Trip Validation
```typescript
// Add round-trip tests
describe('round-trip validation', () => {
  it('verifies computed distance satisfies pixel gap constraint', () => {
    const testCases = [
      { zoom: 1, gap: 10 },
      { zoom: 10, gap: 50 },
      { zoom: 25, gap: 100 }
    ];
    
    testCases.forEach(({ zoom, gap }) => {
      const distance = computeMaxDistance(zoom, gap);
      if (distance === 0) return;
      
      const focalLength = getFocalLength(zoom);
      const optimalTilt = findOptimalTilt(distance, focalLength);
      const params = {
        focalLength,
        tiltAngle: optimalTilt,
        cameraHeight: CAMERA_HEIGHT
      };
      
      // Verify constraint is satisfied
      const actualGap = computePixelGap(distance, distance - LINE_SPACING, params);
      expect(actualGap).toBeGreaterThanOrEqual(gap - 0.01);
      
      // Verify next line would violate constraint
      if (distance < 100) {
        const nextGap = computePixelGap(
          distance + LINE_SPACING, 
          distance, 
          params
        );
        expect(nextGap).toBeLessThan(gap + 0.01);
      }
    });
  });
});
```

### Phase 9: Performance & Polish (30 minutes)

#### 9.1 Performance Tests
```typescript
// Add performance tests
describe('performance', () => {
  it('completes in under 10ms', () => {
    const start = performance.now();
    computeMaxDistance(10, 50);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });
  
  it('handles 100 random inputs efficiently', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const zoom = Math.random() * 24 + 1;
      const gap = Math.random() * 100 + 1;
      computeMaxDistance(zoom, gap);
    }
    const avgTime = (performance.now() - start) / 100;
    expect(avgTime).toBeLessThan(5);
  });
});
```

#### 9.2 Create Index Export
```typescript
// src/index.ts
export { computeMaxDistance } from './compute-max-distance';
export type { CameraConfig, ProjectionParams } from './types/camera-types';
```

### Phase 10: Final Validation (15 minutes)

#### 10.1 Run Full Test Suite
```bash
# Run all tests with coverage
pnpm run test:coverage

# Ensure coverage > 80%
# If not, add tests for uncovered lines
```

#### 10.2 Run Full Validation
```bash
# TypeScript, linting, formatting, and tests
pnpm run validate

# Fix any issues
pnpm run lint:fix
pnpm run format
```

#### 10.3 Final Commit
```bash
# If all validation passes
git add .
git commit -m "feat: implement camera distance calculator with full test coverage"
```

## Execution Timeline

- **Phase 1-3**: 1.5 hours (Foundation & initial TDD)
- **Phase 4-5**: 3 hours (Math & Projection)
- **Phase 6-7**: 3 hours (Optimization & Integration)
- **Phase 8-9**: 1.5 hours (Property tests & Performance)
- **Phase 10**: 0.5 hours (Final validation)

**Total**: ~9.5 hours of focused development

## Success Criteria Checklist

- [ ] All boundary tests pass (4 tests)
- [ ] Small-N consistency verified (8 tests)
- [ ] Monotonicity properties hold
- [ ] Round-trip validation passes
- [ ] Coverage exceeds 80%
- [ ] Performance under 10ms
- [ ] No TypeScript errors
- [ ] No ESLint violations
- [ ] Code properly formatted
- [ ] NO MOCKS used anywhere
- [ ] All mathematical derivations documented
- [ ] Clear variable naming throughout

## Troubleshooting Guide

### If tests fail:
1. Check mathematical formulas
2. Verify projection calculations
3. Debug with console.log in tests
4. Verify numerical tolerances

### If coverage is low:
1. Add edge case tests
2. Test error paths
3. Test boundary conditions
4. Test helper functions

### If performance is slow:
1. Profile the optimization loop
2. Reduce iteration counts
3. Cache repeated calculations
4. Use coarser initial search

## Final Notes

Remember:
- NO MOCKS allowed - use real calculations
- Commit after EVERY passing test
- Run validation before final commit
- Follow TDD strictly: Red → Green → Refactor
- Keep tests focused and clear

This plan provides a complete roadmap from empty project to fully implemented and tested solution.