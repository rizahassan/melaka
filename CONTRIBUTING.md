# Contributing to Melaka

Thank you for your interest in contributing to Melaka! This document provides guidelines for contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Firebase CLI
- A Firebase project for testing

### Setup

```bash
# Clone the repository
git clone https://github.com/rizahassan/melaka.git
cd melaka

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
melaka/
├── packages/
│   ├── core/           # Config, types, utilities
│   ├── firestore/      # Firestore adapter
│   ├── ai/             # AI provider adapters
│   └── cli/            # Command-line interface
├── examples/           # Example projects
├── docs/               # Documentation
└── scripts/            # Build scripts
```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write code following the style guide
- Add tests for new functionality
- Update documentation as needed

### 3. Test

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @melaka/core test

# Run tests in watch mode
pnpm test:watch
```

### 4. Lint and Format

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

### 5. Commit

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat(core): add glossary merging"

# Bug fixes
git commit -m "fix(firestore): handle empty collections"

# Documentation
git commit -m "docs: update configuration examples"

# Breaking changes
git commit -m "feat(cli)!: change deploy command options"
```

### 6. Submit PR

- Push your branch
- Create a Pull Request
- Fill out the PR template
- Wait for review

---

## Code Style

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Document public APIs with JSDoc

```typescript
/**
 * Translate a document to the specified language.
 * 
 * @param doc - The source document
 * @param language - Target language code (BCP 47)
 * @returns The translated document
 * @throws {TranslationError} If translation fails
 */
export async function translateDocument(
  doc: DocumentData,
  language: string
): Promise<TranslatedDocument> {
  // ...
}
```

### Naming

- **Files:** `kebab-case.ts`
- **Classes:** `PascalCase`
- **Functions/variables:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`

### Imports

```typescript
// External packages first
import { z } from 'zod';
import { Firestore } from 'firebase-admin/firestore';

// Internal packages
import { MelakaConfig } from '@melaka/core';

// Relative imports last
import { translateDocument } from './translate';
```

---

## Testing

### Unit Tests

Use Vitest for unit tests:

```typescript
import { describe, it, expect } from 'vitest';
import { createContentHash } from './hash';

describe('createContentHash', () => {
  it('should create consistent hashes', () => {
    const content = { title: 'Hello', body: 'World' };
    const hash1 = createContentHash(content);
    const hash2 = createContentHash(content);
    
    expect(hash1).toBe(hash2);
  });

  it('should detect content changes', () => {
    const hash1 = createContentHash({ title: 'Hello' });
    const hash2 = createContentHash({ title: 'World' });
    
    expect(hash1).not.toBe(hash2);
  });
});
```

### Integration Tests

For Firebase integration tests, use the emulator:

```typescript
import { describe, it, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Integration', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: { host: 'localhost', port: 8080 },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  // Tests...
});
```

---

## Documentation

### README Files

Each package should have a README with:

- Description
- Installation
- Basic usage
- API reference

### JSDoc

Document all public APIs:

```typescript
/**
 * Configuration for a collection to translate.
 */
export interface CollectionConfig {
  /**
   * Firestore collection path.
   * @example 'articles'
   * @example 'users/{uid}/posts'
   */
  path: string;

  /**
   * Fields to translate. If omitted, auto-detects string fields.
   */
  fields?: string[];
}
```

### Docs Folder

Update `docs/` for user-facing documentation.

---

## Pull Request Guidelines

### PR Title

Use conventional commit format:

```
feat(core): add support for nested fields
fix(cli): handle missing config file gracefully
docs: add troubleshooting guide
```

### PR Description

Include:

- **What:** Brief description of changes
- **Why:** Motivation and context
- **How:** Implementation approach
- **Testing:** How you tested the changes

### Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Types check (`pnpm typecheck`)
- [ ] Documentation updated
- [ ] Changeset added (if needed)

---

## Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning:

```bash
# Add a changeset for your changes
pnpm changeset

# Follow the prompts to describe your changes
```

---

## Issue Guidelines

### Bug Reports

Include:

- Melaka version
- Node.js version
- Firebase SDK version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs

### Feature Requests

Include:

- Use case description
- Proposed solution
- Alternative approaches considered

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

---

## Getting Help

- **Questions:** Open a [Discussion](https://github.com/rizahassan/melaka/discussions)
- **Bugs:** Open an [Issue](https://github.com/rizahassan/melaka/issues)
- **Chat:** Join our Discord (coming soon)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
