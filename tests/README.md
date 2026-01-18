# Testing Guide

This document explains how to run and write tests for the Obsidian Confluence Toolkit plugin.

## Test Structure

```
tests/
├── confluenceRender.test.ts   # Unit tests for the renderer
├── integration.test.ts         # Integration tests using sample files
└── README.md                   # This file

test-samples/
├── markdown-test-sample.md     # Markdown input for testing
├── confluence-wiki-markup-sample.txt  # Expected output reference
└── README.md                   # Sample usage guide
```

## Running Tests

### Install Dependencies

First, install the test dependencies:

```bash
npm install
```

This will install Jest, ts-jest, and TypeScript definitions.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools

## Test Suites

### 1. Unit Tests (`confluenceRender.test.ts`)

Tests individual conversion functions for:
- **Text Formatting**: Bold, italic, strikethrough, inline code
- **Headings**: All six heading levels
- **Lists**: Ordered, unordered, nested, mixed
- **Links**: Simple links, links with titles
- **Images**: Standard images, Obsidian-style images
- **Code Blocks**: With and without language, custom themes, options
- **Tables**: Simple and complex tables
- **Blockquotes**: Single and multiline
- **Special Elements**: Horizontal rules, line breaks, HTML

Example test:
```typescript
test("should convert bold text", () => {
    const markdown = "**bold text**";
    const result = marked.parse(markdown, { renderer, async: false });
    expect(result.trim()).toContain("*bold text*");
});
```

### 2. Integration Tests (`integration.test.ts`)

Tests using the actual sample files:
- **Full Document Conversion**: Converts entire markdown-test-sample.md
- **Section-by-Section**: Tests individual sections (headings, lists, etc.)
- **Code Block Options**: Tests theme, line numbers, collapse settings
- **Edge Cases**: Empty documents, special characters, deep nesting
- **Performance**: Tests conversion speed with large documents

Example test:
```typescript
test("should convert entire markdown sample without errors", () => {
    const renderer = new AtlassianWikiMarkupRenderer();
    expect(() => {
        marked.parse(markdownContent, { renderer, async: false });
    }).not.toThrow();
});
```

## Writing New Tests

### Unit Test Example

```typescript
describe("New Feature", () => {
    test("should convert new markdown syntax", () => {
        const markdown = "~~new syntax~~";
        const renderer = new AtlassianWikiMarkupRenderer();
        const result = marked.parse(markdown, { renderer, async: false });
        
        expect(result).toContain("expected output");
    });
});
```

### Integration Test Example

```typescript
test("should handle new markdown feature", () => {
    const markdown = "Complex markdown with new feature";
    const renderer = new AtlassianWikiMarkupRenderer();
    const result = marked.parse(markdown, { renderer, async: false });
    
    expect(result).toMatch(/expected pattern/);
    expect(result).toContain("expected text");
});
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    // ...
};
```

### TypeScript Configuration

Tests use the same TypeScript configuration as the main project but with Jest globals enabled.

## Continuous Integration

### GitHub Actions Workflow (`.github/workflows/test.yml`)

Automatically runs tests on:
- Push to main/master/develop branches
- Pull requests
- Multiple Node.js versions (16.x, 18.x, 20.x)

The workflow:
1. Checks out code
2. Sets up Node.js
3. Installs dependencies
4. Runs tests
5. Generates coverage reports
6. Uploads results to Codecov

### Local CI Simulation

Test against multiple Node versions locally using nvm:

```bash
# Node 16
nvm use 16
npm test

# Node 18
nvm use 18
npm test

# Node 20
nvm use 20
npm test
```

## Coverage Goals

Aim for:
- **Overall**: >80% coverage
- **Renderer**: >90% coverage (core functionality)
- **Edge cases**: Test all known edge cases

View coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Test-Driven Development (TDD)

When adding new features:

1. **Write test first** that defines expected behavior
2. **Run test** - should fail (red)
3. **Implement feature** to make test pass (green)
4. **Refactor** code while keeping tests passing
5. **Repeat** for next feature

Example TDD workflow:

```bash
# Terminal 1: Watch mode
npm run test:watch

# Terminal 2: Edit code
# 1. Write failing test
# 2. Implement feature
# 3. See test pass
# 4. Refactor
```

## Debugging Tests

### VS Code Debugger

Add to `.vscode/launch.json`:

```json
{
    "type": "node",
    "request": "launch",
    "name": "Jest Debug",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": ["--runInBand", "--no-cache", "--watchAll=false"],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen"
}
```

### Debug Single Test

```bash
node --inspect-brk node_modules/.bin/jest --runInBand tests/confluenceRender.test.ts
```

### Add Debug Statements

```typescript
test("debug example", () => {
    const result = marked.parse(markdown, { renderer });
    console.log("Result:", result);  // Debug output
    expect(result).toContain("expected");
});
```

## Common Testing Patterns

### Testing with Options

```typescript
const options: MarkdownToAtlassianWikiMarkupOptions = {
    codeBlock: {
        theme: CodeBlockTheme.Midnight,
        showLineNumbers: true,
        collapse: false,
    },
};
const renderer = new AtlassianWikiMarkupRenderer(options);
```

### Testing Multiple Cases

```typescript
test.each([
    ["# Heading 1", "h1. Heading 1"],
    ["## Heading 2", "h2. Heading 2"],
    ["### Heading 3", "h3. Heading 3"],
])("should convert %s to %s", (input, expected) => {
    const result = marked.parse(input, { renderer });
    expect(result.trim()).toContain(expected);
});
```

### Testing Regex Patterns

```typescript
test("should match pattern", () => {
    const result = marked.parse(markdown, { renderer });
    expect(result).toMatch(/^#\s/m);  // Ordered list
    expect(result).toMatch(/^\*\s/m); // Unordered list
});
```

## Troubleshooting

### Tests Fail After Installation

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### TypeScript Errors in Tests

```bash
# Install type definitions
npm install --save-dev @types/jest @types/node
```

### Coverage Not Generated

```bash
# Ensure jest.config.js has coverage settings
npm run test:coverage -- --coverage --collectCoverageFrom='src/**/*.ts'
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on input/output, not internal details
2. **Keep Tests Simple**: One assertion per test when possible
3. **Use Descriptive Names**: Test names should describe what they verify
4. **Avoid Test Interdependence**: Each test should run independently
5. **Test Edge Cases**: Empty strings, special characters, extreme values
6. **Keep Tests Fast**: Mock expensive operations, avoid real file I/O when possible
7. **Maintain Test Coverage**: Add tests when fixing bugs or adding features

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TypeScript Testing](https://github.com/kulshekhar/ts-jest)
- [Confluence Wiki Markup Reference](https://confluence.atlassian.com/doc/confluence-wiki-markup-251003035.html)

## Contributing Tests

When contributing:

1. Add tests for new features
2. Add tests for bug fixes
3. Ensure all tests pass: `npm test`
4. Ensure coverage doesn't decrease: `npm run test:coverage`
5. Update this documentation if adding new test patterns

---

For questions or issues with tests, please open an issue on GitHub.
