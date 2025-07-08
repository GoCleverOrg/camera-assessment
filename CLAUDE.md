# CLAUDE.md

Guidelines for Claude Code when working with the camera-assessment TypeScript library.

## 🚀 CRITICAL: Parallel Work & Subagent Strategy

### Always Use Parallel Execution When Possible

1. **Launch Multiple Subagents**: Use the Task tool to run 4-10 parallel tasks
   - Example: "Explore the codebase using 5 tasks in parallel"
   - Each subagent gets its own context window (maximize efficiency)
   - Queue tasks if needed (system handles up to 100+ tasks)

2. **Subagent Task Distribution**:
   - Assign tasks based on independence and parallelizability
   - Let task requirements determine specializations
   - Focus on maximizing concurrent execution
   - Avoid artificial role assignments

3. **Extended Thinking Mode**:
   - Use "think" for standard problems
   - Use "think hard" for complex derivations
   - Use "think harder" for architectural decisions
   - Use "ultrathink" for critical optimization problems

4. **Context Management**:
   - Use `/clear` between major phases
   - Use `/compact` when context > 70% full
   - Create checkpoints after each subagent completes

### Implementation Planning Requirements

**NEVER execute a plan directly!** Instead:
1. First create a detailed implementation plan document
2. Break down into parallel subtasks with clear boundaries
3. Assign specialized subagents to each task
4. Define synchronization points
5. Include verification steps for each deliverable

## Quick TDD/BDD Reference

### 🔴 Red → 🟢 Green → 🔵 Refactor → ✅ Validate

#### Sequential Workflow (Single Agent)
```bash
# 1. Create test file first
touch src/__tests__/feature.test.ts

# 2. Write failing test (RED)
pnpm test feature.test.ts

# 3. Implement minimal code (GREEN)
pnpm test feature.test.ts

# 4. Refactor and verify
pnpm run typecheck && pnpm test

# 5. Run FULL validation before commit
pnpm run validate  # Must pass ALL checks!

# 6. Commit only when validation passes
git add . && git commit -m "test: add feature test"
```

#### 🚀 Parallel Workflow (Multiple Subagents) - PREFERRED
```bash
# Identify independent tasks that can run in parallel
# Launch appropriate number of subagents (3-10 based on task complexity)
# Each subagent works on independent aspects simultaneously
# Synchronize at natural convergence points
# Combine results and proceed to next phase

# Benefits:
# - 2-3x faster execution
# - Better context management
# - Reduced cognitive load per agent
# - Natural task boundaries
```

### Validation Checklist ✓
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no violations
- [ ] Prettier formatting is correct
- [ ] All tests pass
- [ ] Code coverage ≥ 80%

**Remember: NO MOCKS, EVER!**

## Project Overview

Camera assessment TypeScript library with Jest testing (ABSOLUTELY NO MOCKS), ESLint/Prettier, CommonJS output, and pnpm package management.

### ⚠️ CRITICAL: No Mocking Policy

**This project has a STRICT NO-MOCKING policy. This is non-negotiable.**

- ❌ **NEVER** use Jest mocks (`jest.fn()`, `jest.mock()`, `jest.spyOn()`)
- ❌ **NEVER** use mocking libraries (Sinon, TestDouble, etc.)
- ❌ **NEVER** create mock implementations or stubs
- ❌ **NEVER** mock external dependencies - use real ones
- ✅ **ALWAYS** test with real implementations
- ✅ **ALWAYS** use actual instances and real data
- ✅ **ALWAYS** prefer integration tests over isolated units

If you cannot test something without mocks, redesign the code to be testable with real implementations.

## Development Workflow

### TDD/BDD Development Process

1. **Start with test scenarios**: Define behavior before any implementation
   ```bash
   # Create test file first
   touch src/__tests__/camera-assessment.test.ts
   # Run in watch mode during development
   pnpm run test:watch camera-assessment
   ```

2. **Follow Red-Green-Refactor cycle**:
   - 🔴 **Red**: Write failing test expressing desired behavior
   - 🟢 **Green**: Write minimal code to make test pass
   - 🔵 **Refactor**: Improve code quality while keeping tests green

3. **Incremental development**:
   - One test case at a time
   - Small, focused commits after each green test
   - Never skip the refactor step

4. **Continuous validation**:
   ```bash
   # After each implementation step
   pnpm run typecheck && pnpm test
   # Before committing
   pnpm run validate
   ```

5. **Handle test failures properly**:
   - Read error messages carefully
   - Fix the implementation, not the test
   - If test needs fixing, question if requirement changed

### BDD Feature Development Example

```typescript
// Step 1: Define feature in BDD style
describe('Feature: Camera Auto-Configuration', () => {
  // Step 2: Write scenario
  describe('Scenario: Auto-detect optimal settings', () => {
    describe('GIVEN a camera with unknown capabilities', () => {
      describe('WHEN auto-configuration is triggered', () => {
        it('THEN should detect supported resolutions', async () => {
          // Test implementation
        });
        
        it('THEN should select highest stable framerate', async () => {
          // Test implementation
        });
        
        it('THEN should return confidence score', async () => {
          // Test implementation
        });
      });
    });
  });
});

// Step 3: Implement feature incrementally
// Step 4: Refactor for clarity and performance
```

## TypeScript Guidelines

### Strict Type Checking
- Enable all strict flags in tsconfig.json
- Never use `any` without explicit justification
- Prefer `unknown` over `any` when type is truly unknown
- Use type guards and assertions with runtime validation

### Conventions
- **Interfaces** for object shapes and contracts: `interface CameraConfig {}`
- **Type aliases** for unions, intersections, and primitives: `type CameraId = string`
- **Const assertions** for literal types: `const MODES = ['auto', 'manual'] as const`
- **Generics** with meaningful names: `<TFrame extends VideoFrame>`

### Import/Export Patterns
- ES modules only: `import { assess } from './camera'`
- Named exports for multiple items: `export { Camera, CameraError }`
- Default export only for main entry: `export default assessCamera`
- Group imports by: external → internal → types

### Error Handling
```typescript
// Custom error classes
export class CameraAssessmentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CameraAssessmentError';
  }
}

// Result types for operations
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

## Testing Strategy

### Test-Driven Development (TDD)

#### Core TDD Rules
1. **No production code without failing test**: Only write production code to make a failing test pass
2. **Minimal test code**: Write just enough test code to fail (compilation failures count)
3. **Minimal production code**: Write just enough production code to pass the failing test

#### TDD Cycle (Red-Green-Refactor)
```typescript
// 1. RED: Write failing test first
it('should calculate camera quality score', () => {
  const result = calculateQualityScore({ resolution: '1080p' });
  expect(result).toBe(0.8);
}); // ❌ Fails: calculateQualityScore doesn't exist

// 2. GREEN: Minimal code to pass
export function calculateQualityScore(config: CameraConfig): number {
  return 0.8; // Simplest implementation
}

// 3. REFACTOR: Improve without changing behavior
export function calculateQualityScore(config: CameraConfig): number {
  const resolutionScores = { '720p': 0.6, '1080p': 0.8, '4k': 1.0 };
  return resolutionScores[config.resolution] || 0.5;
}
```

### Behavior-Driven Development (BDD)

#### BDD Test Structure
```typescript
describe('Camera Assessment Feature', () => {
  describe('GIVEN a camera with valid configuration', () => {
    const camera = new Camera({ resolution: '1080p', fps: 30 });
    
    describe('WHEN assessing quality', () => {
      let result: AssessmentResult;
      
      beforeEach(async () => {
        result = await camera.assess();
      });
      
      it('THEN should return quality score above threshold', () => {
        expect(result.qualityScore).toBeGreaterThan(0.7);
      });
      
      it('THEN should include detailed metrics', () => {
        expect(result.metrics).toHaveProperty('resolution');
        expect(result.metrics).toHaveProperty('frameRate');
      });
    });
  });
});
```

#### BDD Scenarios Template
```typescript
// Feature: Camera Quality Assessment
// As a developer
// I want to assess camera quality
// So that I can ensure video capture meets requirements

describe('Feature: Camera Quality Assessment', () => {
  it('Scenario: Assess high-quality camera', () => {
    // GIVEN a camera with 4K resolution
    // WHEN quality assessment is performed
    // THEN quality score should be excellent (>0.9)
    // AND confidence level should be high
    // AND no warnings should be present
  });
});
```

### Test-First Development Workflow

1. **Understand requirement**: Break down feature into testable behaviors
2. **Write failing test**: Express expected behavior in test
3. **Run test**: Verify it fails for the right reason
4. **Implement**: Write minimal code to pass
5. **Verify**: Run test to confirm it passes
6. **Refactor**: Improve code while keeping tests green
7. **Repeat**: Move to next test case

### Testing Philosophy

#### Absolute No-Mocking Requirement
- **NO MOCKS EVER**: This is the #1 rule - no exceptions
- **Real implementations only**: Always use actual objects
- **No test doubles**: No stubs, spies, fakes, or mocks
- **Dependency injection**: Use real dependencies, not mocked ones
- **Test the real thing**: If it talks to a database, use a real database
- **No mocking frameworks**: Don't even install mocking libraries

#### Testing Without Mocks - Practical Strategies
```typescript
// ❌ WRONG - Using mocks
const mockCamera = jest.fn();
mockCamera.mockReturnValue({ resolution: '1080p' });

// ✅ CORRECT - Using real implementation
const camera = new Camera({ resolution: '1080p' });
const result = await camera.getInfo();

// ❌ WRONG - Mocking external service
jest.mock('./api-client');

// ✅ CORRECT - Use real service with test environment
const testApiClient = new ApiClient({ 
  endpoint: process.env.TEST_API_URL 
});

// ❌ WRONG - Spy on method
const spy = jest.spyOn(camera, 'connect');

// ✅ CORRECT - Test actual behavior
const result = await camera.connect();
expect(result.connected).toBe(true);
```

#### Core Testing Principles
- **Test behavior, not implementation**: Focus on what, not how
- **One assertion per test**: Keep tests focused and clear
- **Descriptive test names**: Tests are living documentation
- **Arrange-Act-Assert pattern**: Structure tests consistently
- **Test edge cases**: Empty inputs, nulls, boundaries
- **Integration over unit tests**: Test real interactions

### Advanced Testing Patterns

#### Test Data Builders
```typescript
// Builder pattern for complex test data
class CameraConfigBuilder {
  private config: Partial<CameraConfig> = {};
  
  withResolution(resolution: string): this {
    this.config.resolution = resolution;
    return this;
  }
  
  withDefaults(): this {
    this.config = { resolution: '1080p', fps: 30, codec: 'h264' };
    return this;
  }
  
  build(): CameraConfig {
    return this.config as CameraConfig;
  }
}

// Usage in tests
const camera = new CameraConfigBuilder()
  .withDefaults()
  .withResolution('4k')
  .build();
```

#### Parameterized Tests
```typescript
describe.each([
  ['720p', 0.6],
  ['1080p', 0.8],
  ['4k', 1.0],
])('resolution %s', (resolution, expectedScore) => {
  it(`should score ${expectedScore}`, () => {
    const result = assessResolution(resolution);
    expect(result.score).toBe(expectedScore);
  });
});
```

### Coverage Requirements

#### Enforced Coverage Thresholds
The project enforces strict coverage requirements via Jest configuration:
- **Global threshold**: 80% minimum for all metrics (branches, functions, lines, statements)
- **Critical paths**: 100% coverage for `src/core/` when it exists
- **Coverage failure**: Tests fail if thresholds are not met
- **No commits allowed**: Cannot commit code below coverage thresholds

#### Coverage Configuration
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  // Uncomment when src/core/ exists
  // './src/core/': {
  //   branches: 100,
  //   functions: 100,
  //   lines: 100,
  //   statements: 100,
  // },
}
```

#### Coverage Best Practices
- **Test critical paths first**: Ensure 100% coverage on essential functionality
- **Branch coverage focus**: Test all conditional paths
- **Meaningful tests**: Coverage without quality is meaningless
- **Document exceptions**: If code cannot be tested, document why
- **Regular coverage checks**: Run `pnpm run test:coverage` frequently

## Code Style

### Naming Conventions
- **Files**: kebab-case (`camera-assessor.ts`)
- **Classes/Interfaces**: PascalCase (`CameraAssessor`)
- **Functions/Variables**: camelCase (`assessCamera`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- **Private**: prefix with underscore (`_internalMethod`)

### File Organization
```
src/
├── index.ts              # Public API exports
├── types/               # Shared type definitions
├── core/                # Core business logic
├── utils/               # Helper functions
└── __tests__/           # Test files and fixtures
```

### Code Patterns
- Early returns over nested conditions
- Destructuring for cleaner code
- Functional approach where sensible
- Immutability by default

## Project Conventions

### Camera Assessment Patterns
- Assessments return structured results with confidence scores
- All camera operations are async
- Support cancellation via AbortController
- Emit progress events for long operations

### API Design
```typescript
// Clear, predictable APIs
export async function assessCamera(
  input: CameraInput,
  options?: AssessmentOptions
): Promise<AssessmentResult> {}

// Options pattern for extensibility
interface AssessmentOptions {
  timeout?: number;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}
```

### Documentation Requirements
- JSDoc for all public APIs
- Include examples in documentation
- Document error conditions
- Type parameters need descriptions

## Commands Reference

### Development
- `pnpm run build` - Compile to JS
- `pnpm run build:watch` - Watch mode
- `pnpm run typecheck` - Type validation

### Testing
- `pnpm test` - Run all tests
- `pnpm run test:watch` - Watch mode
- `pnpm run test:coverage` - Coverage report

### Quality
- `pnpm run lint` - Check code
- `pnpm run lint:fix` - Auto-fix issues
- `pnpm run format` - Format code
- `pnpm run clean` - Remove artifacts

### Validation
- `pnpm run validate` - Run all checks (typecheck, lint, format:check, test:coverage)

## Complete Validation Process

### Pre-Commit Validation Workflow

The `pnpm run validate` command runs a comprehensive validation pipeline that MUST pass before any commit:

1. **Type Checking** (`pnpm run typecheck`)
   - Ensures all TypeScript code is type-safe
   - No implicit `any` types allowed
   - Strict mode compliance required

2. **Linting** (`pnpm run lint`)
   - ESLint rules enforcement
   - TypeScript-specific rules
   - Code quality standards

3. **Format Checking** (`pnpm run format:check`)
   - Prettier formatting compliance
   - Consistent code style
   - No formatting deviations

4. **Test Coverage** (`pnpm run test:coverage`)
   - All tests must pass
   - 80% minimum coverage threshold
   - Coverage report generated

### Validation Requirements

```bash
# Before ANY commit, run:
pnpm run validate

# If validation fails at ANY step:
# 1. Fix the issue
# 2. Re-run validation
# 3. Only commit when ALL checks pass
```

### Common Validation Failures and Solutions

| Failure Type | Error Message | Solution |
|--------------|---------------|----------|
| TypeScript | `error TS2322` | Fix type errors, avoid `any` |
| ESLint | `✖ X problems` | Run `pnpm run lint:fix` |
| Prettier | `Code style issues` | Run `pnpm run format` |
| Jest Coverage | `threshold not met` | Write more tests until 80%+ |
| Test Failure | `✕ test name` | Fix implementation or test |

### Continuous Validation During Development

```bash
# Run in separate terminals for real-time feedback:
pnpm run build:watch     # Terminal 1: TypeScript compiler
pnpm run test:watch      # Terminal 2: Jest tests
pnpm run typecheck       # Periodic: Type validation

# Quick validation during development:
pnpm run typecheck && pnpm test
```

### Coverage Validation Details

When running `pnpm run validate`, the coverage check will:
- Generate a coverage report in `coverage/` directory
- Display coverage percentages in terminal
- **FAIL if any metric is below 80%**
- Block the validation pipeline on failure

Example coverage output:
```
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.71 |    83.33 |     100 |   85.71 |
 index.ts |     100 |      100 |     100 |     100 |
 camera.ts|   81.25 |       80 |     100 |   81.25 |
----------|---------|----------|---------|---------|
```

### Validation Best Practices

1. **Run validation frequently**: Don't wait until commit time
2. **Fix issues immediately**: Don't accumulate validation debt
3. **Understand failures**: Read error messages carefully
4. **Use watch modes**: Get instant feedback during development
5. **Never skip validation**: No exceptions to the process

## TDD/BDD Tips and Best Practices

### Common TDD Pitfalls to Avoid
1. **Writing implementation before tests**: Always write the test first
2. **Testing implementation details**: Test public behavior, not internals
3. **Writing multiple tests at once**: One test at a time
4. **Skipping refactor step**: Always improve after green
5. **Large test steps**: Keep increments small and focused

### Effective Test Writing
```typescript
// ❌ BAD: Testing implementation
it('should call internal method', () => {
  // Don't test private methods or internal calls
});

// ✅ GOOD: Testing behavior
it('should assess camera quality based on resolution', () => {
  const result = assessCamera({ resolution: '4k' });
  expect(result.qualityScore).toBeGreaterThan(0.9);
});
```

### TDD Decision Making
- **Can't test without mocks?** → Refactor design
- **Test seems complex?** → Simplify implementation
- **Many test cases?** → Use parameterized tests
- **Slow tests?** → Optimize real implementations, never mock
- **External dependencies?** → Use test instances/environments

### Maintaining Test Quality
1. **Review tests like production code**: Tests need maintenance too
2. **Keep tests DRY**: Extract common setup, use builders
3. **Tests as documentation**: Name clearly, show usage
4. **Fast feedback**: Optimize for quick test runs
5. **Deterministic tests**: No randomness, consistent results

## Commit Strategy

### TDD/BDD Commit Practices
- Commit after each green test: `test: add test for camera resolution detection`
- Commit implementation separately: `feat: implement camera resolution detection`
- Commit refactoring separately: `refactor: extract resolution constants`
- Never commit with failing tests

### Commit Message Format
- Format: `type: description` (e.g., `feat: add camera calibration`)
- Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`
- Reference issues when applicable
- Include test status: `test: ✅ camera auto-config scenarios`

## 🎯 Slash Commands for Parallel Workflows

Create these in `.claude/commands/` for repeated parallel patterns:

### parallel-implementation.md
```markdown
Execute implementation using parallel subagents:
- Identify all independent tasks
- Launch subagents for tasks that can run concurrently
- Each agent focuses on their assigned scope
- Report progress at defined checkpoints
- Synchronize when dependencies require coordination

$ARGUMENTS: Feature or component to implement
```

### parallel-testing.md
```markdown
Run comprehensive testing in parallel:
- Distribute test suites across multiple agents
- Each agent handles specific test categories
- Aggregate results at completion
- Identify any failing tests or coverage gaps

$ARGUMENTS: Test scope or specific test suites
```

## 📋 Parallel Execution Best Practices

1. **Always think in parallel**: Can this task be split?
2. **Specialize subagents**: Give each a specific expertise
3. **Define clear boundaries**: Prevent overlap and conflicts  
4. **Use checkpoints**: Synchronize at natural breakpoints
5. **Leverage context windows**: Each subagent = fresh context
6. **Queue liberally**: System handles 100+ tasks efficiently
7. **Document decisions**: Subagents can't see each other's work