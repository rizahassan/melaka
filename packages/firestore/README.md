# @melaka/firestore

Firestore adapter and triggers for Melaka - AI-powered Firestore localization.

## Installation

```bash
pnpm add @melaka/firestore
```

## Usage

### i18n Operations

```typescript
import { readTranslation, writeTranslation, getI18nRef } from '@melaka/firestore';

// Read a translation
const translation = await readTranslation(docRef, 'ms-MY');

// Write a translation
await writeTranslation(docRef, 'ms-MY', translatedContent, nonTranslatable, metadata);

// Check if translation is current
const isCurrent = await isTranslationCurrent(docRef, 'ms-MY', sourceHash);
```

### Translation Processing

```typescript
import { processTranslation } from '@melaka/firestore';

const result = await processTranslation(
  docRef,
  docData,
  'ms-MY',
  config,
  collectionConfig
);

if (result.success) {
  console.log('Translation completed!');
}
```

### Code Generation

```typescript
import { generateTriggers } from '@melaka/firestore';

const files = generateTriggers(config, {
  outputDir: 'functions/src/melaka',
});

// files contains triggers.ts, task-handler.ts, index.ts
```

## Documentation

See the [main Melaka documentation](https://github.com/rizahassan/melaka).
