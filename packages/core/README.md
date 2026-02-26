# @melaka/core

Core types, utilities, and configuration for Melaka.

## Installation

```bash
npm install @melaka/core
```

## Usage

### Define Configuration

```typescript
import { defineConfig } from '@melaka/core';

export default defineConfig({
  languages: ['ms-MY', 'zh-CN'],
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  },
  collections: [
    {
      path: 'articles',
      fields: ['title', 'content'],
    },
  ],
});
```

### Types

```typescript
import type {
  MelakaConfig,
  CollectionConfig,
  FieldMapping,
  TranslationResult,
} from '@melaka/core';
```

## API Reference

See [types.ts](./src/types.ts) for full type definitions.
