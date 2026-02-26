# Melaka Architecture

This document describes the system architecture for Melaka, an AI-powered localization SDK for Firebase Firestore.

## Overview

Melaka is designed as a modular system with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   melaka init    melaka deploy    melaka translate    melaka status         │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLI LAYER (@melaka/cli)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Config Loader    Trigger Generator    Migration Runner    Status Checker  │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
          ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
          │ @melaka/core│  │@melaka/fire-│  │  @melaka/ai │
          │             │  │   store     │  │             │
          │ - Config    │  │             │  │ - Gemini    │
          │ - Types     │  │ - Triggers  │  │ - OpenAI    │
          │ - Schemas   │  │ - i18n Ops  │  │ - Claude    │
          │ - Utils     │  │ - Tasks     │  │ - Schema    │
          └─────────────┘  └─────────────┘  └─────────────┘
                                   │
                                   ▼
          ┌───────────────────────────────────────────────┐
          │              FIREBASE / FIRESTORE              │
          │                                                │
          │  ┌──────────┐    ┌──────────┐    ┌──────────┐ │
          │  │Collection│───▶│  i18n/   │───▶│  ms-MY   │ │
          │  │  /doc    │    │          │    │  zh-CN   │ │
          │  └──────────┘    └──────────┘    │  ta-IN   │ │
          │                                   └──────────┘ │
          └───────────────────────────────────────────────┘
```

## Package Structure

Melaka uses a monorepo structure with the following packages:

```
melaka/
├── packages/
│   ├── core/           # Config parsing, types, schemas, utilities
│   ├── firestore/      # Firestore adapter, triggers, i18n operations
│   ├── ai/             # AI provider adapters (Gemini, OpenAI, Claude)
│   └── cli/            # Command-line interface
├── examples/
│   └── basic/          # Basic usage example
├── docs/               # Documentation
└── scripts/            # Build and release scripts
```

### @melaka/core

The foundation package containing:

- **Configuration Types** — TypeScript interfaces for config files
- **Schema Definitions** — Zod schemas for validation
- **Field Type Detection** — Auto-detection of translatable vs non-translatable fields
- **Content Hashing** — SHA256 hashing for change detection
- **Glossary Management** — Shared terminology handling

### @melaka/firestore

Firebase/Firestore-specific functionality:

- **Trigger Generator** — Creates `onDocumentWritten` triggers from config
- **i18n Operations** — Read/write to `/{doc}/i18n/{locale}` subcollections
- **Task Queue Integration** — Cloud Tasks for async translation
- **Batch Processing** — Efficient bulk translation with rate limiting
- **Collection Group Support** — Handle subcollection translation

### @melaka/ai

AI provider adapters with unified interface:

- **Gemini Adapter** — Google's Gemini models via Genkit
- **OpenAI Adapter** — GPT-4 and GPT-3.5
- **Claude Adapter** — Anthropic's Claude models
- **Translation Facade** — Unified translation interface
- **Schema-Based Output** — Structured JSON output with Zod validation

### @melaka/cli

Command-line interface:

- **`melaka init`** — Initialize config file in a project
- **`melaka deploy`** — Generate and deploy Firestore triggers
- **`melaka translate`** — Run manual translation for a collection
- **`melaka status`** — Check translation progress
- **`melaka retry`** — Retry failed translations

---

## Core Concepts

### 1. i18n Subcollection Pattern

Translations are stored as subcollections under each document:

```
/articles/article-123
/articles/article-123/i18n/ms-MY    ← Malaysian translation
/articles/article-123/i18n/zh-CN    ← Chinese translation
/articles/article-123/i18n/ta-IN    ← Tamil translation
```

Each i18n document contains:

```typescript
{
  // Translated fields
  title: "Tajuk Artikel",
  content: "Kandungan artikel...",
  
  // Original non-translatable fields (copied)
  author_ref: DocumentReference,
  created_at: Timestamp,
  view_count: 123,
  
  // Melaka metadata
  _melaka: {
    source_hash: "abc123...",      // Hash of source content
    translated_at: Timestamp,      // When translation occurred
    model: "gemini-2.5-flash",     // AI model used
    status: "completed",           // completed | failed | pending
    reviewed: false,               // Human review flag
    error?: string                 // Error message if failed
  }
}
```

### 2. Field Type Detection

Melaka automatically determines which fields to translate:

**Translatable (sent to AI):**
- `string` — Text content
- `string[]` — Arrays of text

**Non-Translatable (copied as-is):**
- `number`, `number[]` — Numeric values
- `boolean` — Boolean flags
- `object`, `object[]` — Complex objects
- `DocumentReference`, `DocumentReference[]` — Firestore references
- `Timestamp` — Date/time values
- `GeoPoint` — Location data

### 3. Change Detection

Before translating, Melaka creates a SHA256 hash of the source content:

```typescript
const sourceHash = sha256(JSON.stringify(translatableContent));
```

On subsequent updates:
1. Compute new source hash
2. Compare with stored `_melaka.source_hash`
3. Skip translation if unchanged (unless `forceUpdate: true`)

### 4. Configuration-Driven

All behavior is defined in `melaka.config.ts`:

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  // Target languages
  languages: ['ms-MY', 'zh-CN'],
  
  // AI provider settings
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.3,
  },
  
  // Collections to translate
  collections: [
    {
      path: 'articles',
      fields: ['title', 'content', 'summary'],
      prompt: 'This is blog content. Keep the tone casual.',
    },
    {
      path: 'products',
      fields: ['name', 'description'],
      glossary: {
        'widget': 'widget',  // Don't translate
      },
    },
  ],
  
  // Shared glossary
  glossary: {
    'company_name': 'Nama Syarikat',
  },
});
```

---

## Data Flow

### Automatic Translation (Firestore Triggers)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │  Firestore  │     │   Trigger   │     │ Cloud Task  │
│   Write     │────▶│   Update    │────▶│   Fires     │────▶│  Enqueued   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                    ┌─────────────┐     ┌─────────────┐            │
                    │    i18n     │     │     AI      │            │
                    │  Updated    │◀────│ Translation │◀───────────┘
                    └─────────────┘     └─────────────┘
```

1. Client creates/updates a document
2. Firestore trigger (`onDocumentWritten`) fires
3. Trigger enqueues a Cloud Task with document reference
4. Task handler:
   - Reads source document
   - Separates translatable/non-translatable content
   - Checks source hash for changes
   - Calls AI translation API
   - Writes to i18n subcollection

### Manual Translation (CLI)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   melaka    │     │    Query    │     │   Enqueue   │     │   Process   │
│  translate  │────▶│ Collection  │────▶│   Tasks     │────▶│   Tasks     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. CLI queries all documents in a collection
2. For each document, checks if translation needed
3. Enqueues Cloud Tasks in batches
4. Tasks process with rate limiting and retry logic

---

## Translation Process Detail

### 1. Content Separation

```typescript
function separateContent(doc: DocumentData, config: CollectionConfig) {
  const translatable: Record<string, unknown> = {};
  const nonTranslatable: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(doc)) {
    const fieldType = detectFieldType(value);
    
    if (isTranslatable(fieldType)) {
      translatable[field] = value;
    } else {
      nonTranslatable[field] = value;
    }
  }

  return { translatable, nonTranslatable };
}
```

### 2. Schema Generation

Dynamic Zod schemas are created based on field types:

```typescript
function createTranslationSchema(translatable: Record<string, unknown>) {
  const schemaFields: Record<string, ZodSchema> = {};

  for (const [field, value] of Object.entries(translatable)) {
    if (typeof value === 'string') {
      schemaFields[field] = z.string();
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      schemaFields[field] = z.array(z.string());
    }
  }

  return z.object(schemaFields);
}
```

### 3. AI Translation

```typescript
const prompt = `
Translate the following content from English to ${targetLanguage}.

Preserve:
- Exact structure and meaning
- Markdown formatting
- Proper nouns (names, brands)
- Numbers and indices

${config.prompt || ''}

Glossary:
${formatGlossary(config.glossary)}

Content:
${JSON.stringify(translatableContent, null, 2)}
`;

const result = await ai.generate({
  prompt,
  output: { schema: translationSchema },
});
```

### 4. Content Merge & Save

```typescript
const finalDoc = {
  ...result.output,          // Translated fields
  ...nonTranslatableContent, // Copied fields
  _melaka: {
    source_hash: sourceHash,
    translated_at: Timestamp.now(),
    model: config.ai.model,
    status: 'completed',
    reviewed: false,
  },
};

await doc.ref.collection('i18n').doc(targetLanguage).set(finalDoc);
```

---

## Error Handling

### Retry Strategy

Failed translations use exponential backoff:

```typescript
{
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 60,
    maxBackoffSeconds: 300,
  }
}
```

### Error Recording

Failed translations are recorded with error details:

```typescript
{
  _melaka: {
    status: 'failed',
    error: 'Rate limit exceeded',
    translated_at: Timestamp.now(),
    source_hash: sourceHash,
  }
}
```

### Recovery

```bash
# Retry all failed translations
melaka retry --collection articles --language ms-MY
```

---

## Performance Considerations

### Rate Limiting

- **Default:** 10 concurrent translation tasks
- **Staggered Execution:** Tasks scheduled with increasing delays
- **Batch Processing:** Documents processed in configurable batch sizes

### Optimization

- **Content Hashing:** Skip unchanged documents
- **Field Filtering:** Only translate configured fields
- **Async Processing:** All translations run as Cloud Tasks

### Monitoring

```bash
# Check translation progress
melaka status --collection articles

# Output:
# articles → ms-MY
#   Total: 150
#   Completed: 142 (94.7%)
#   Failed: 3
#   Pending: 5
```

---

## Security

### API Key Management

AI provider API keys should be stored as Firebase secrets:

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set OPENAI_API_KEY
```

Access in triggers:

```typescript
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

export const translateTask = onTaskDispatched(
  { secrets: [geminiApiKey] },
  async (request) => {
    // Use geminiApiKey.value()
  }
);
```

### Firestore Rules

Example rules for i18n subcollections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to translations
    match /{collection}/{docId}/i18n/{locale} {
      allow read: if true;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

---

## Future Considerations

### Potential Features

- **Translation Memory** — Reuse translations across documents
- **Real-time Preview** — Preview translations before saving
- **Review Dashboard** — Web UI for human review workflow
- **Incremental Field Translation** — Translate only changed fields
- **Custom Validators** — User-defined validation rules
- **Webhook Notifications** — Notify external systems on completion

### Database Adapters (Future)

The architecture is designed to support other databases:

```
melaka/
├── packages/
│   ├── firestore/    # Current
│   ├── supabase/     # Future
│   ├── mongodb/      # Future
│   └── planetscale/  # Future
```

Each adapter would implement a common interface:

```typescript
interface DatabaseAdapter {
  getDocument(path: string): Promise<Document>;
  setTranslation(path: string, locale: string, data: object): Promise<void>;
  queryCollection(path: string): Promise<Document[]>;
  onDocumentChange(path: string, handler: ChangeHandler): void;
}
```

---

## Summary

Melaka provides a complete solution for Firestore localization:

1. **Declarative Configuration** — Simple config file defines all behavior
2. **Automatic Translation** — Firestore triggers keep translations in sync
3. **AI-Powered** — Leverages modern LLMs for quality translations
4. **Battle-Tested Pattern** — i18n subcollections used in production at Vespid
5. **Developer Experience** — CLI for common operations
6. **Extensible** — Modular architecture for future growth
