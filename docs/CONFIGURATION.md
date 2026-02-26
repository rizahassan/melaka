# Configuration Reference

This document describes the configuration options for Melaka.

## Config File

Melaka uses a TypeScript configuration file (`melaka.config.ts`) at the root of your Firebase project.

### Basic Example

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  languages: ['ms-MY', 'zh-CN', 'ja-JP'],
  
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

### Full Example

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  // Target languages for translation
  languages: ['ms-MY', 'zh-CN', 'ja-JP'],
  
  // AI provider configuration
  ai: {
    provider: 'gemini',           // 'gemini' | 'openai' | 'claude'
    model: 'gemini-2.5-flash',    // Model name
    temperature: 0.3,             // 0-1, lower = more consistent
    apiKeySecret: 'GEMINI_API_KEY', // Firebase secret name
  },
  
  // Firebase region for deployed functions
  region: 'asia-southeast1',
  
  // Default batch processing settings
  defaults: {
    batchSize: 20,
    maxConcurrency: 10,
    forceUpdate: false,
  },
  
  // Shared glossary (applies to all collections)
  glossary: {
    'checkout': 'checkout',
    'cart': 'cart',
    'wishlist': 'wishlist',
  },
  
  // Collections to translate
  collections: [
    {
      path: 'articles',
      fields: ['title', 'content', 'summary'],
      prompt: 'This is blog content for an e-commerce platform.',
      glossary: {
        'sale': 'jualan',
      },
    },
    {
      path: 'products',
      fields: ['name', 'description'],
      batchSize: 10,
      maxConcurrency: 5,
    },
    {
      path: 'notifications',
      isCollectionGroup: true,  // For subcollections
      fields: ['title', 'body', 'message'],
    },
  ],
});
```

---

## Configuration Options

### Root Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `languages` | `string[]` | ✅ | Target language codes (BCP 47 format) |
| `ai` | `AIConfig` | ✅ | AI provider configuration |
| `region` | `string` | ❌ | Firebase region (default: `us-central1`) |
| `defaults` | `DefaultsConfig` | ❌ | Default settings for all collections |
| `glossary` | `Record<string, string>` | ❌ | Shared glossary for all collections |
| `collections` | `CollectionConfig[]` | ✅ | Collections to translate |

### AI Configuration

```typescript
interface AIConfig {
  provider: 'gemini' | 'openai' | 'claude';
  model: string;
  temperature?: number;       // Default: 0.3
  apiKeySecret?: string;      // Firebase secret name
}
```

#### Supported Models

**Gemini (Google):**
- `gemini-2.5-flash` — Fast, cost-effective (recommended)
- `gemini-2.5-pro` — Higher quality, slower
- `gemini-2.0-flash` — Previous generation

**OpenAI:**
- `gpt-4o` — Latest GPT-4
- `gpt-4o-mini` — Faster, cheaper
- `gpt-4-turbo` — Previous flagship

**Claude (Anthropic):**
- `claude-sonnet-4-20250514` — Balanced speed/quality
- `claude-opus-4-20250514` — Highest quality

### Defaults Configuration

```typescript
interface DefaultsConfig {
  batchSize?: number;        // Documents per batch (default: 20)
  maxConcurrency?: number;   // Concurrent tasks (default: 10)
  forceUpdate?: boolean;     // Re-translate unchanged docs (default: false)
}
```

### Collection Configuration

```typescript
interface CollectionConfig {
  path: string;                      // Collection path
  isCollectionGroup?: boolean;       // Use collection group query
  fields?: string[];                 // Fields to translate (auto-detect if omitted)
  fieldMappings?: FieldMapping[];    // Detailed field configuration
  prompt?: string;                   // Context for AI translation
  glossary?: Record<string, string>; // Collection-specific glossary
  batchSize?: number;                // Override default
  maxConcurrency?: number;           // Override default
  forceUpdate?: boolean;             // Override default
}
```

### Field Mapping Configuration

For fine-grained control over field translation:

```typescript
interface FieldMapping {
  sourceField: string;          // Field name in source document
  targetField?: string;         // Field name in translation (default: same)
  schemaType?: SchemaType;      // Override auto-detection
  required?: boolean;           // Fail if field missing
  description?: string;         // Help AI understand context
}

type SchemaType = 
  | 'string' 
  | 'string[]' 
  | 'number' 
  | 'number[]' 
  | 'boolean'
  | 'object'
  | 'object[]'
  | 'object|null'
  | 'DocumentReference'
  | 'DocumentReference[]';
```

---

## Language Codes

Use BCP 47 language tags:

| Code | Language |
|------|----------|
| `ms-MY` | Malay (Malaysia) |
| `zh-CN` | Chinese (Simplified) |
| `zh-TW` | Chinese (Traditional) |
| `ta-IN` | Tamil (India) |
| `hi-IN` | Hindi (India) |
| `id-ID` | Indonesian |
| `th-TH` | Thai |
| `vi-VN` | Vietnamese |
| `ja-JP` | Japanese |
| `ko-KR` | Korean |
| `es-ES` | Spanish (Spain) |
| `fr-FR` | French (France) |
| `de-DE` | German |
| `pt-BR` | Portuguese (Brazil) |
| `ar-SA` | Arabic |

---

## Glossary

Glossaries ensure consistent translation of domain-specific terms.

### Shared Glossary

Applied to all collections:

```typescript
export default defineConfig({
  glossary: {
    // Term: Translation (or same to preserve)
    'checkout': 'checkout',
    'wishlist': 'senarai hajat',
    'Acme Inc': 'Acme Inc',  // Proper noun, don't translate
  },
  // ...
});
```

### Collection Glossary

Override or extend for specific collections:

```typescript
collections: [
  {
    path: 'recipes',
    glossary: {
      'simmer': 'reneh',
      'sauté': 'tumis',
    },
  },
],
```

### Glossary Merging

Collection glossary is merged with shared glossary:

```typescript
// Effective glossary for 'recipes' collection:
{
  ...sharedGlossary,
  ...collectionGlossary,  // Overrides shared
}
```

---

## Translation Prompts

Custom prompts provide context to the AI:

```typescript
collections: [
  {
    path: 'recipes',
    prompt: `
      This is cooking recipe content.
      Translate ingredient names and cooking instructions clearly.
      Keep measurements in their original units.
    `,
  },
  {
    path: 'promotions',
    prompt: `
      This is promotional content for retail offers.
      Keep the promotional tone engaging.
      Preserve all coupon codes, addresses, and links exactly.
    `,
  },
],
```

---

## Collection Groups

For subcollections that appear in multiple places:

```typescript
// Translates all 'comments' subcollections across the database
// e.g., /posts/{pid}/comments/{id}, /products/{prodId}/comments/{id}

collections: [
  {
    path: 'comments',
    isCollectionGroup: true,
    fields: ['text', 'reply'],
  },
],
```

---

## Examples

### Minimal Config

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  languages: ['ms-MY'],
  ai: { provider: 'gemini', model: 'gemini-2.5-flash' },
  collections: [
    { path: 'articles', fields: ['title', 'content'] },
  ],
});
```

### Multi-Language E-commerce Config

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  languages: ['ms-MY', 'zh-CN', 'ja-JP', 'ko-KR'],
  
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.3,
  },
  
  region: 'asia-southeast1',
  
  glossary: {
    'Acme Store': 'Acme Store',
    'free shipping': 'penghantaran percuma',
  },
  
  collections: [
    {
      path: 'products',
      fields: ['name', 'description', 'features'],
      prompt: 'E-commerce product descriptions. Keep brand names unchanged.',
    },
    {
      path: 'categories',
      fields: ['name', 'description'],
      prompt: 'Product category names and descriptions.',
    },
  ],
});
```

### Advanced Field Mappings

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  languages: ['ms-MY'],
  ai: { provider: 'gemini', model: 'gemini-2.5-flash' },
  
  collections: [
    {
      path: 'products',
      fieldMappings: [
        {
          sourceField: 'name',
          schemaType: 'string',
          required: true,
          description: 'Product name - keep brand names unchanged',
        },
        {
          sourceField: 'description',
          schemaType: 'string',
          required: true,
          description: 'Product description with markdown formatting',
        },
        {
          sourceField: 'features',
          schemaType: 'string[]',
          required: false,
          description: 'List of product features',
        },
        {
          sourceField: 'price',
          schemaType: 'number',
          required: true,
          // Numbers are copied, not translated
        },
        {
          sourceField: 'category_ref',
          schemaType: 'DocumentReference',
          required: true,
          // References are copied, not translated
        },
      ],
    },
  ],
});
```

---

## Environment Variables

For local development, create a `.env` file:

```bash
# .env (do not commit!)
GEMINI_API_KEY=your-api-key-here
OPENAI_API_KEY=your-api-key-here
ANTHROPIC_API_KEY=your-api-key-here
```

For production, use Firebase secrets:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

---

## Validation

Melaka validates your config on startup and deployment:

```bash
$ melaka validate

✓ Config file found: melaka.config.ts
✓ Languages valid: ms-MY, zh-CN
✓ AI provider configured: gemini
✓ Collections configured: 3
  - articles (3 fields)
  - products (2 fields)
  - comments (collection group, 2 fields)
✓ Glossary entries: 15

Config is valid!
```

---

## Next Steps

- [CLI Reference](./CLI.md) — Available commands
- [AI Providers](./AI_PROVIDERS.md) — Provider-specific setup
- [Architecture](./ARCHITECTURE.md) — System design
