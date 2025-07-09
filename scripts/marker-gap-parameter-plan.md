# Marker Gap Parameter - Implementation Plan

## Executive Summary
This plan details the implementation of making the marker gap (currently `LINE_SPACING` constant of 2 meters) configurable throughout the camera-assessment library. Additionally, the existing `--gap` parameter will be renamed to `--pixel-gap` for clarity. This implementation will allow users to specify custom marker spacing while maintaining the current default value.

## Requirements Clarification
### Original Request
Make the markers distance (currently a constant every 2m) an optional CLI parameter (default 2m), just like we did with the camera height parameter. Also rename the current `--gap` parameter to `--pixel-gap`.

### Clarified Requirements
1. **New parameter name**: `--marker-gap` (measured in meters, allows decimals)
2. **Existing parameter rename**: `--gap` → `--pixel-gap`
3. **Default constant name**: `DEFAULT_MARKER_GAP` (renamed from `LINE_SPACING`)
4. **Value constraints**: Must be > 0
5. **Decimal support**: Yes (e.g., 1.5m, 2.75m)
6. **Backward compatibility**: Default behavior unchanged (2m)
7. **Error handling**: Consistent with existing patterns
8. **Documentation**: Update all references including README.md

### Assumptions Made
- The marker gap parameter should follow the same pattern as height parameter
- Marker gap is measured in meters (same unit as current constant)
- All calculations using LINE_SPACING need to be updated
- Batch processing should support the new parameter

## Technical Specification
### Architecture Overview
The implementation involves:
1. Renaming `LINE_SPACING` to `DEFAULT_MARKER_GAP` in constants
2. Renaming CLI `--gap` to `--pixel-gap` everywhere
3. Adding `--marker-gap` parameter to CLI
4. Adding `markerGap` parameter to all relevant functions
5. Threading the parameter through the calculation chain
6. Updating all visualizations and outputs
7. Comprehensive documentation updates

### Detailed Design
#### 1. Constant Rename
- File: `src/utils/constants.ts`
- Change: `LINE_SPACING` → `DEFAULT_MARKER_GAP`
- Value remains: `2` (meters)

#### 2. CLI Parameter Changes
- Rename existing: `-g, --gap` → `-p, --pixel-gap`
- Add new: `-m, --marker-gap <number>` with parseFloat
- Update all help text and examples

#### 3. Public API Updates
Add optional `markerGap` parameter to:
- `analyzeCameraView(zoom: Zoom, minPixelGap: number, markerGap?: number): CameraViewAnalysis`
- `generateStripDemoImage(zoom: Zoom, minPixelGap: number, outputPath: string, transparentBackground?: boolean, markerGap?: number): Promise<StripRenderResult>`
- `generateStripVisualizations(focalLength: number, tiltAngleDegrees: number, distanceMeters: number, imageWidth?: number, imageHeight?: number, markerGap?: number): StripVisualization[]`

#### 4. Internal Function Updates
Add `markerGap` parameter to:
- `findMaximumDistance(focalLength: number, minPixelGap: number, cameraHeight: number, markerGap: number): number`
- `findMaximumDistanceWithDetails(focalLength: number, minPixelGap: number, cameraHeight: number, markerGap: number): MaximumDistanceResult`
- All functions in optimization.ts that use LINE_SPACING

#### 5. Calculation Updates
Replace all instances of:
- `lineCount: finalDistance / LINE_SPACING` → `lineCount: finalDistance / markerGap`
- `Math.floor(distance / LINE_SPACING) * LINE_SPACING` → `Math.floor(distance / markerGap) * markerGap`
- `lineIndex * LINE_SPACING` → `lineIndex * markerGap`
- `distance - LINE_SPACING` → `distance - markerGap`

### Integration Points
1. **Import statements**: All files importing `LINE_SPACING` need updating
2. **CLI commands**: Update all examples and help text
3. **Test files**: Update test helpers and fixtures
4. **Batch processor**: Ensure marker gap parameter is passed through
5. **Visualizations**: Update strip visualizer to use custom spacing
6. **Documentation**: README.md, JSDoc comments, examples

## Implementation Strategy
### Parallel Task Breakdown
1. **Task 1: Constant and CLI Rename** (Independent)
   - Rename LINE_SPACING to DEFAULT_MARKER_GAP
   - Rename --gap to --pixel-gap in CLI
   - Update all imports and references
   - Verify no build errors

2. **Task 2: Internal Function Updates** (Independent)
   - Update optimization.ts functions to accept markerGap parameter
   - Replace all LINE_SPACING usage with parameter
   - Update all distance calculations

3. **Task 3: Public API Updates** (Depends on Task 2)
   - Add markerGap parameter to public functions
   - Default to DEFAULT_MARKER_GAP when not provided
   - Thread parameter to internal functions

4. **Task 4: CLI Integration** (Depends on Task 3)
   - Add --marker-gap option to CLI
   - Add validation for > 0
   - Pass to API functions
   - Update help text

5. **Task 5: Test Updates** (Can start with Task 1)
   - Update all test imports
   - Add test cases for various marker gaps
   - Test edge cases (0.1m, 100m)
   - Ensure coverage remains above 80%

6. **Task 6: Documentation Updates** (Can start immediately)
   - Update README.md
   - Update all JSDoc comments
   - Update CLI examples
   - Fix all references to --gap

7. **Task 7: Visualization Updates** (Depends on Task 2)
   - Update strip-visualizer.ts
   - Ensure images reflect custom spacing
   - Update any annotations

### Task Dependencies
```
Task 1 ──┬──> Task 2 ──┬──> Task 3 ──> Task 4
         │             │
         └──> Task 5   └──> Task 7
         
Task 6 (Independent)
```

### Synchronization Points
1. After Task 1 & 2: Verify all calculations work with parameter
2. After Task 3: Ensure public API maintains backward compatibility
3. After Task 5: Confirm test coverage meets requirements
4. Final: Integration testing with all components

## Testing Strategy
### Test Scenarios
1. **Default behavior**: Verify functions work with default marker gap (2m)
2. **Custom gaps**: Test with various gaps (0.5m, 1m, 3m, 10m)
3. **Edge cases**: Test boundaries (0.1m, 100m)
4. **Invalid values**: Test error handling (0, negative numbers)
5. **CLI integration**: Test both --pixel-gap and --marker-gap
6. **Batch processing**: Ensure marker gap works with multiple zoom levels
7. **Visualization**: Verify images show correct spacing

### Coverage Requirements
- Maintain minimum 80% coverage globally
- Add specific test cases for marker gap parameter variations
- Test both with and without marker gap parameter
- Test renamed --pixel-gap parameter

## Validation Criteria
### Success Metrics
1. All tests pass with > 80% coverage
2. TypeScript compilation succeeds without errors
3. ESLint and Prettier checks pass
4. CLI works with both --pixel-gap and --marker-gap
5. Default behavior unchanged when marker gap not specified
6. All documentation updated correctly

### Acceptance Tests
1. `analyzeCameraView(zoom, pixelGap)` works identically to before
2. `analyzeCameraView(zoom, pixelGap, 2)` produces same results as default
3. `analyzeCameraView(zoom, pixelGap, 3)` produces different line counts
4. CLI `analyze -z 5 -p 10` works (renamed from -g)
5. CLI `analyze -z 5 -p 10 -m 3` uses custom marker gap
6. Error thrown for `analyze -z 5 -p 10 -m 0`
7. Generated images show correct marker spacing

## Risk Analysis
### Potential Issues
1. **Breaking changes**: Renaming --gap to --pixel-gap breaks existing scripts
2. **Calculation errors**: Distance calculations might not handle all edge cases
3. **Test failures**: Many tests reference LINE_SPACING
4. **Documentation inconsistency**: Missing updates in some files
5. **Visualization issues**: Images might not scale properly

### Mitigation Strategies
1. **Clear migration notes**: Document the --gap to --pixel-gap change prominently
2. **Thorough testing**: Test all distance calculation edge cases
3. **Incremental updates**: Update tests alongside implementation
4. **Comprehensive search**: Use grep to find all references
5. **Visual verification**: Generate test images with various gaps

## Timeline Estimate
With parallel execution:
- Task 1 (Constant/CLI Rename): 25 minutes
- Task 2 (Internal Functions): 35 minutes
- Task 3 (Public API): 20 minutes
- Task 4 (CLI Integration): 25 minutes
- Task 5 (Tests): 50 minutes
- Task 6 (Documentation): 30 minutes
- Task 7 (Visualization): 20 minutes

**Total time with parallelization**: ~100 minutes
**Total time sequential**: ~205 minutes

## Documentation Locations
Based on the codebase analysis, documentation must be updated in:

1. **README.md**:
   - Line 72: Change `-g, --gap` to `-p, --pixel-gap`
   - Line 124: Update "Ground Line Spacing | 2 meters between markings"
   - Add new `--marker-gap` parameter documentation
   - Update all examples using --gap
   - Add examples showing custom marker gap

2. **JSDoc Comments**:
   - `src/analyze-camera-view.ts` - Main API function
   - `src/core/optimization.ts` - All optimization functions
   - `src/rendering/strip-demo-generator.ts` - Image generation
   - `src/rendering/strip-visualizer.ts` - Visualization function
   - `src/cli.ts` - CLI help text and descriptions

3. **Test Files**:
   - Update all test descriptions mentioning "gap"
   - Add comments explaining marker gap testing
   - Update test helper documentation

4. **Error Messages**:
   - Ensure error messages use correct parameter names
   - Add specific error for invalid marker gap values

## Implementation Checklist
- [ ] Rename LINE_SPACING to DEFAULT_MARKER_GAP
- [ ] Update all imports of the constant
- [ ] Rename --gap to --pixel-gap in CLI
- [ ] Update all CLI documentation and examples
- [ ] Add markerGap parameter to internal optimization functions
- [ ] Update all distance calculations to use markerGap
- [ ] Add markerGap parameter to public API functions
- [ ] Add --marker-gap option to CLI with validation
- [ ] Update strip visualizer to use custom spacing
- [ ] Update all test files and add new test cases
- [ ] Update README.md comprehensively
- [ ] Update all JSDoc comments
- [ ] Run full validation suite
- [ ] Verify backward compatibility
- [ ] Test various marker gap values visually

## Code Examples

### CLI Update Example
```typescript
// Before
.option('-g, --gap <number>', 'Minimum pixel gap between lines', parseFloat)

// After
.option('-p, --pixel-gap <number>', 'Minimum pixel gap between lines', parseFloat)
.option('-m, --marker-gap <number>', 'Distance between ground markers in meters (default: 2)', parseFloat)
```

### Function Signature Example
```typescript
// Before
export function analyzeCameraView(zoom: Zoom, minPixelGap: number): CameraViewAnalysis

// After
export function analyzeCameraView(zoom: Zoom, minPixelGap: number, markerGap: number = DEFAULT_MARKER_GAP): CameraViewAnalysis
```

### Calculation Update Example
```typescript
// Before
const lineCount = finalDistance / LINE_SPACING;

// After
const lineCount = finalDistance / markerGap;
```

## Notes
- This change is more extensive than the height parameter due to the CLI parameter rename
- Special attention needed for documentation updates
- Visual verification important for generated images
- Consider adding migration notes for users upgrading