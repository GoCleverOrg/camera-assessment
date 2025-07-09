# Zoom Range CLI Feature - Implementation Plan

## Executive Summary
This plan details the implementation of an enhanced CLI zoom flag that supports range notation (e.g., `1-5`), comma-separated values (e.g., `1,3,5`), and mixed formats (e.g., `1-3,5,7-9`). When multiple zoom levels are specified, the analysis results will be displayed in a markdown table format on stdout, with an optional CSV export. If image generation is requested, multiple images will be created with appropriate naming to avoid conflicts.

## Requirements Clarification

### Original Request
"Improve the existing cli flag to support receiving the zooms as a range, e.g. 1-5 (meaning zoom 1, 2, 3, 4, 5). For those cases, data should be presented in a table format and if the image flag is provided, multiple images should be generated (suffixing the zoom level to the name of the image)."

### Clarified Requirements
1. **Range Parsing**:
   - Support simple ranges: `1-5` → [1, 2, 3, 4, 5]
   - Support comma-separated: `1,3,5` → [1, 3, 5]
   - Support mixed format: `1-3,5,7-9` → [1, 2, 3, 5, 7, 8, 9]
   - Support single values: `3` → [3] (backwards compatible)
   - Minimum zoom level: 1
   - No maximum zoom level (remove current cap of 25)
   - Invalid ranges should error appropriately

2. **Table Output**:
   - Display results as markdown table on stdout
   - Include all analysis columns from the current output
   - Optional CSV export via additional flag (e.g., `--csv-output <path>`)
   - CSV format for file output, markdown for console

3. **Image Generation**:
   - Use existing naming convention with zoom suffix
   - Pattern: `camera-strips-z1-g45.png`, `camera-strips-z2-g45.png`, etc.
   - Generate all images in the same directory
   - Maintain transparent background option for all images

### Assumptions Made
- Zoom levels should be deduplicated and sorted
- Partial failures should be reported but not stop other zoom levels
- Table should show one row per zoom level
- CSV export is an additional flag, not a modification of existing output flag

## Technical Specification

### Architecture Overview
```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ CLI Parser  │────▶│ Range Parser │────▶│ Zoom Processor  │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
                    ┌──────────────┐     ┌─────────────────┐
                    │ Table Output │◀────│ Analysis Engine │
                    └──────────────┘     └─────────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌─────────────────┐
                    │ CSV Exporter │     │ Image Generator │
                    └──────────────┘     └─────────────────┘
```

### Detailed Design

#### 1. Range Parser Module
```typescript
interface RangeParserResult {
  zoomLevels: number[];
  errors: string[];
}

function parseZoomRange(input: string): RangeParserResult {
  // Parse formats: "1-5", "1,3,5", "1-3,5,7-9"
  // Validate each zoom >= 1
  // Deduplicate and sort results
}
```

#### 2. Enhanced CLI Parser
```typescript
// Modified zoom option to accept string
.option('-z, --zoom <range>', 'Zoom level(s): single value (3), range (1-5), or mixed (1-3,5,7-9)', '5')
.option('--csv-output <path>', 'Export results as CSV to specified file')

// Custom parser will use parseZoomRange
function parseZoomOption(value: string): number[] {
  const result = parseZoomRange(value);
  if (result.errors.length > 0) {
    throw new InvalidArgumentError(result.errors.join(', '));
  }
  return result.zoomLevels;
}
```

#### 3. Table Formatter
```typescript
interface TableRow {
  zoom: number;
  maxDistance: number;
  minGap: number;
  aspectRatio: string;
  resolution: string;
  // ... other analysis fields
}

class TableFormatter {
  formatMarkdown(rows: TableRow[]): string;
  formatCSV(rows: TableRow[]): string;
}
```

#### 4. Batch Processing Engine
```typescript
interface BatchResult {
  zoom: number;
  analysis: AnalysisResult;
  imageGenerated?: boolean;
  imagePath?: string;
  error?: Error;
}

async function processBatch(
  zoomLevels: number[],
  options: CLIOptions
): Promise<BatchResult[]> {
  // Process each zoom level
  // Collect results
  // Handle partial failures
}
```

### Integration Points
1. **CLI Module**: Modify commander options and parsing
2. **Zoom Class**: Remove maximum validation constraint
3. **Analysis Engine**: No changes needed (works with single zoom)
4. **Image Generator**: Enhance naming logic for multiple files
5. **Output Formatting**: Add table formatting capabilities

## Implementation Strategy

### Parallel Task Breakdown

#### Task 1: Range Parser Implementation (Independent)
- Implement `parseZoomRange` function with full format support
- Create comprehensive unit tests for all formats
- Handle edge cases (empty, invalid, duplicates)
- No dependencies on other tasks

#### Task 2: Table Formatter Implementation (Independent)
- Create `TableFormatter` class
- Implement markdown table generation
- Implement CSV export functionality
- Unit test with mock data
- No dependencies on other tasks

#### Task 3: CLI Enhancement (Depends on Task 1)
- Modify zoom option to accept string
- Add CSV output option
- Integrate range parser
- Update help text and examples
- Depends on Task 1 completion

#### Task 4: Batch Processing Logic (Depends on Tasks 1 & 2)
- Create batch processing function
- Implement result aggregation
- Handle partial failures gracefully
- Integrate with table formatter
- Depends on Tasks 1 and 2

#### Task 5: Image Generation Enhancement (Independent)
- Modify naming logic for multiple zooms
- Ensure no naming conflicts
- Maintain existing conventions
- Test with various scenarios

#### Task 6: Integration Testing (Depends on all tasks)
- End-to-end CLI tests
- Test all range formats
- Verify table output
- Test CSV export
- Verify image generation

### Task Dependencies
```
Task 1 ──┐
         ├──▶ Task 3 ──┐
Task 2 ──┤              ├──▶ Task 6
         └──▶ Task 4 ──┘
Task 5 ─────────────────┘
```

### Synchronization Points
1. After Tasks 1 & 2: Review parser and formatter implementations
2. After Tasks 3, 4, 5: Integration checkpoint
3. After Task 6: Final validation

## Testing Strategy

### Test Scenarios

#### Range Parser Tests
```typescript
describe('parseZoomRange', () => {
  it('should parse single value: "5" → [5]');
  it('should parse simple range: "1-5" → [1,2,3,4,5]');
  it('should parse comma-separated: "1,3,5" → [1,3,5]');
  it('should parse mixed format: "1-3,5,7-9" → [1,2,3,5,7,8,9]');
  it('should handle spaces: "1 - 3, 5" → [1,2,3,5]');
  it('should deduplicate: "1-3,2-4" → [1,2,3,4]');
  it('should sort results: "5,1,3" → [1,3,5]');
  it('should reject invalid ranges: "5-1" → error');
  it('should reject zero/negative: "0-5" → error');
  it('should handle empty input: "" → error');
  it('should handle malformed input: "1-2-3" → error');
});
```

#### Table Formatter Tests
```typescript
describe('TableFormatter', () => {
  describe('markdown formatting', () => {
    it('should create valid markdown table');
    it('should align columns properly');
    it('should escape special characters');
    it('should handle empty data');
  });
  
  describe('CSV formatting', () => {
    it('should create valid CSV with headers');
    it('should quote fields with commas');
    it('should handle special characters');
    it('should be parseable by CSV libraries');
  });
});
```

#### CLI Integration Tests
```typescript
describe('CLI zoom range support', () => {
  it('should process single zoom (backwards compatible)');
  it('should process zoom range and display table');
  it('should generate multiple images with correct names');
  it('should export CSV when flag provided');
  it('should handle partial failures gracefully');
  it('should show appropriate error messages');
});
```

### Coverage Requirements
- Range parser: 100% coverage (critical path)
- Table formatter: 100% coverage (critical path)
- CLI modifications: ≥90% coverage
- Batch processing: ≥90% coverage
- Integration tests: All user scenarios covered

## Validation Criteria

### Success Metrics
1. All range formats parse correctly
2. Table output is properly formatted and readable
3. CSV export is valid and importable
4. Multiple images generated without conflicts
5. Backwards compatibility maintained
6. No performance regression for single zoom
7. Clear error messages for invalid input

### Acceptance Tests
```bash
# Single value (backwards compatible)
camera-assessment analyze -z 5 -g 45

# Simple range
camera-assessment analyze -z 1-5 -g 45

# Complex range with table output
camera-assessment analyze -z "1-3,5,7-9" -g 45

# With CSV export
camera-assessment analyze -z 1-5 -g 45 --csv-output results.csv

# With image generation
camera-assessment analyze -z 1-3 -g 45 -i

# Error handling
camera-assessment analyze -z "0-5" -g 45  # Should error
camera-assessment analyze -z "5-1" -g 45  # Should error
```

## Risk Analysis

### Potential Issues
1. **Memory usage**: Processing many zoom levels could consume significant memory
   - **Mitigation**: Process in batches, limit maximum range size (e.g., 50 zooms)

2. **Performance**: Table formatting for large datasets
   - **Mitigation**: Stream output for very large tables

3. **File conflicts**: Multiple runs could overwrite images
   - **Mitigation**: Add timestamp option or check existing files

4. **Parser complexity**: Edge cases in range parsing
   - **Mitigation**: Extensive unit testing, use proven parsing approach

5. **CSV compatibility**: Different tools expect different CSV formats
   - **Mitigation**: Follow RFC 4180, test with common tools

### Mitigation Strategies
1. Implement progress indicators for long operations
2. Add `--dry-run` option to preview what will be processed
3. Validate range before processing (warn if >20 zoom levels)
4. Clear documentation with examples
5. Comprehensive error messages with suggestions

## Timeline Estimate

### Parallel Execution Timeline
- **Day 1**: 
  - Tasks 1, 2, 5 start in parallel (3 agents)
  - Complete range parser, table formatter, image naming
  
- **Day 2**: 
  - Tasks 3, 4 start (2 agents)
  - Complete CLI integration and batch processing
  - Begin integration testing
  
- **Day 3**: 
  - Task 6 (integration testing)
  - Documentation updates
  - Final validation

**Total estimate**: 2-3 days with parallel execution (vs 5-6 days sequential)

## Context Management Points
- Use `/clear` after completing Tasks 1 & 2
- Create checkpoint after Task 4 completion
- Use `/compact` before final integration testing
- Document key decisions in code comments for future agents