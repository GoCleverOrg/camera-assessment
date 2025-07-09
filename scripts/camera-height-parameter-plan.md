# Camera Height Parameter - Implementation Plan

## Executive Summary
This plan details the implementation of making camera height configurable throughout the camera-assessment library. Currently, the camera height is hardcoded as a constant (20 meters). This implementation will allow users to specify a custom camera height while maintaining the current default value.

## Requirements Clarification
### Original Request
Make the height of the camera (currently a constant) a value that you can specify, just like you can specify the zoom. If no value is provided for this new parameter the existing "default" (20) should be provided. The default value should remain as a constant (but needs to properly be renamed so that we clear understand that that is a default value).

### Clarified Requirements
1. **Parameter name**: `height` (simple number parameter)
2. **Scope**: All functions that currently use the height constant
3. **Default constant name**: `DEFAULT_CAMERA_HEIGHT`
4. **Backward compatibility**: Not required
5. **Value constraints**: To be determined during implementation
6. **Test updates**: Required for all affected functions
7. **Documentation**: To be added in all public APIs and relevant places

### Assumptions Made
- The height parameter should follow the same pattern as the zoom parameter
- No minimum/maximum constraints will be enforced initially (can be added later if needed)
- Height is measured in meters (same unit as current constant)

## Technical Specification
### Architecture Overview
The implementation involves:
1. Renaming the existing constant from `CAMERA_HEIGHT` to `DEFAULT_CAMERA_HEIGHT`
2. Adding `height` parameter to all public API functions
3. Threading the height parameter through internal functions
4. Updating all locations where `CAMERA_HEIGHT` is directly used
5. Maintaining optional parameter pattern with default value

### Detailed Design
#### 1. Constant Rename
- File: `src/utils/constants.ts`
- Change: `CAMERA_HEIGHT` → `DEFAULT_CAMERA_HEIGHT`

#### 2. Public API Updates
Add optional `height` parameter to:
- `analyzeCameraView(zoom: Zoom, minPixelGap: number, height?: number): CameraViewAnalysis`
- `generateStripDemoImage(zoom: Zoom, minPixelGap: number, outputPath: string, transparentBackground?: boolean, height?: number): Promise<StripRenderResult>`
- `generateStripVisualizations(focalLength: number, tiltAngleDegrees: number, distanceMeters: number, imageWidth?: number, imageHeight?: number, height?: number): StripVisualization[]`

#### 3. Internal Function Updates
Add `cameraHeight` parameter to:
- `findOptimalTilt(targetDistance: number, focalLength: number, cameraHeight: number): number`
- `findMaximumDistance(focalLength: number, minPixelGap: number, cameraHeight: number): number`
- `findOptimalTiltWithAngle(targetDistance: number, focalLength: number, cameraHeight: number): OptimalTiltResult`
- `findMaximumDistanceWithDetails(focalLength: number, minPixelGap: number, cameraHeight: number): MaximumDistanceResult`

#### 4. CLI Updates
Add new option to CLI:
```typescript
.option('-h, --height <number>', 'Camera height in meters (default: 20)', parseFloat)
```

### Integration Points
1. **Import statements**: All files importing `CAMERA_HEIGHT` need updating
2. **ProjectionParams creation**: Update all instantiations to use provided height
3. **Test files**: Update test helpers and fixtures
4. **Batch processor**: Ensure height parameter is passed through batch operations

## Implementation Strategy
### Parallel Task Breakdown
1. **Task 1: Constant Rename** (Independent)
   - Rename constant in constants.ts
   - Update all imports across the codebase
   - Verify no build errors

2. **Task 2: Internal Function Updates** (Independent)
   - Update optimization.ts functions to accept cameraHeight parameter
   - Use parameter instead of constant
   - Ensure all ProjectionParams use provided height

3. **Task 3: Public API Updates** (Depends on Task 2)
   - Add height parameter to public functions
   - Default to DEFAULT_CAMERA_HEIGHT when not provided
   - Thread parameter to internal functions

4. **Task 4: CLI Integration** (Depends on Task 3)
   - Add height option to CLI
   - Pass height to API functions
   - Update help text and examples

5. **Task 5: Test Updates** (Can start with Task 1)
   - Update test helpers to accept height
   - Add test cases for various heights
   - Ensure coverage remains above 80%

6. **Task 6: Documentation Updates** (Can start immediately)
   - Update JSDoc comments
   - Add parameter descriptions
   - Update README if needed

### Task Dependencies
```
Task 1 ──┬──> Task 2 ──> Task 3 ──> Task 4
         │
         └──> Task 5
         
Task 6 (Independent)
```

### Synchronization Points
1. After Task 1 & 2: Verify all internal functions work with height parameter
2. After Task 3: Ensure public API maintains backward compatibility
3. After Task 5: Confirm test coverage meets requirements
4. Final: Integration testing with all components

## Testing Strategy
### Test Scenarios
1. **Default behavior**: Verify functions work with default height (20m)
2. **Custom heights**: Test with various heights (5m, 10m, 50m, 100m)
3. **Edge cases**: Test with extreme values (0.1m, 1000m)
4. **CLI integration**: Test CLI with and without height parameter
5. **Batch processing**: Ensure height works with multiple zoom levels

### Coverage Requirements
- Maintain minimum 80% coverage globally
- Add specific test cases for height parameter variations
- Test both with and without height parameter to ensure defaults work

## Validation Criteria
### Success Metrics
1. All tests pass with > 80% coverage
2. TypeScript compilation succeeds without errors
3. ESLint and Prettier checks pass
4. CLI works with new height parameter
5. Default behavior unchanged when height not specified

### Acceptance Tests
1. `analyzeCameraView(zoom, gap)` works identically to before
2. `analyzeCameraView(zoom, gap, 20)` produces same results as default
3. `analyzeCameraView(zoom, gap, 10)` produces different results
4. CLI command `analyze -z 5 -g 10` works as before
5. CLI command `analyze -z 5 -g 10 -h 30` uses custom height
6. All existing tests pass without modification

## Risk Analysis
### Potential Issues
1. **Breaking changes**: If height parameter position affects existing code
2. **Test failures**: Existing tests may need updates for new parameter
3. **Documentation gaps**: Missing updates in some files
4. **Performance**: Additional parameter passing overhead (minimal)

### Mitigation Strategies
1. **Use optional parameters**: Add height as last parameter to maintain compatibility
2. **Incremental testing**: Run tests after each task completion
3. **Comprehensive search**: Use grep/search tools to find all usages
4. **Code review**: Careful review of all changes before finalizing

## Timeline Estimate
With parallel execution:
- Task 1 (Constant Rename): 15 minutes
- Task 2 (Internal Functions): 30 minutes
- Task 3 (Public API): 20 minutes
- Task 4 (CLI): 20 minutes
- Task 5 (Tests): 45 minutes
- Task 6 (Documentation): 20 minutes

**Total time with parallelization**: ~90 minutes
**Total time sequential**: ~150 minutes

## Documentation Locations
Based on the codebase analysis, documentation should be updated in:

1. **JSDoc Comments** (all modified functions):
   - `src/analyze-camera-view.ts` - Main API function
   - `src/core/optimization.ts` - All optimization functions
   - `src/rendering/strip-demo-generator.ts` - Image generation function
   - `src/rendering/strip-visualizer.ts` - Visualization function

2. **CLI Help Text**:
   - `src/cli.ts` - Add height option description
   - Update examples to show height usage

3. **Type Definitions**:
   - Consider adding height to relevant interfaces if needed

4. **README.md** (if exists):
   - Update usage examples
   - Document new parameter

5. **Test Files**:
   - Add comments explaining height parameter testing

## Implementation Checklist
- [ ] Rename CAMERA_HEIGHT to DEFAULT_CAMERA_HEIGHT
- [ ] Update all imports of the constant
- [ ] Add cameraHeight parameter to internal optimization functions
- [ ] Add height parameter to public API functions
- [ ] Update CLI with height option
- [ ] Update all ProjectionParams instantiations
- [ ] Add test cases for various heights
- [ ] Update JSDoc comments
- [ ] Run full validation suite
- [ ] Verify backward compatibility