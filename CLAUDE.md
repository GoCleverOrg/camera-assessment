# CLAUDE.md

Guidelines for Claude Code when working with the camera-assessment TypeScript library.

## Project Overview

Camera assessment TypeScript library with Jest testing (no mocks), ESLint/Prettier, CommonJS output, and pnpm package management.

## Development Workflow

1. **Plan before coding**: Use scratchpad files (`/tmp/*.ts`) for complex implementations
2. **Test-driven**: Write tests first or alongside implementation
3. **Verify continuously**: Run `pnpm run typecheck` after changes
4. **Test immediately**: Run `pnpm test` to catch issues early
5. **Handle errors gracefully**: Never leave code in broken state

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

### Test-Driven Development
- Write test cases before implementation
- One test file per source file: `camera.ts` → `camera.test.ts`
- Test public API thoroughly, internal helpers minimally

### Test Structure
```typescript
describe('CameraAssessment', () => {
  describe('assess()', () => {
    it('should handle valid input', () => {});
    it('should throw on invalid input', () => {});
  });
});
```

### Testing Philosophy
- **NO MOCKS**: Never use mocks in tests
- Test real implementations only
- Use test fixtures in `__tests__/fixtures/` for data
- Create actual test instances rather than mocking
- Integration tests preferred over isolated unit tests

### Coverage Requirements
- Minimum 80% coverage for new code
- 100% coverage for critical paths
- Focus on branch coverage over line coverage

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
- `pnpm run validate` - Run all checks (typecheck, lint, format:check, test)

## Commit Strategy

- Atomic commits with clear messages
- Format: `type: description` (e.g., `feat: add camera calibration`)
- Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`
- Reference issues when applicable