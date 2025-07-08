# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library project for camera assessment functionality. The project is configured with:
- TypeScript for type safety
- Jest for testing
- ESLint and Prettier for code quality
- CommonJS module output with type definitions

## Commands

### Development
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Compile in watch mode
- `npm run typecheck` - Type check without emitting files

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Utilities
- `npm run clean` - Remove build artifacts (dist/, coverage/)

## Project Structure

```
camera-assessment/
├── src/                  # Source code
│   ├── __tests__/       # Test files
│   └── index.ts         # Main entry point
├── dist/                # Compiled output (generated)
├── coverage/            # Test coverage reports (generated)
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── jest.config.js       # Jest configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## Development Workflow

1. Write code in `src/` directory
2. Run `npm run typecheck` to verify types
3. Run `npm test` to ensure tests pass
4. Run `npm run lint` to check code quality
5. Build with `npm run build` when ready to distribute