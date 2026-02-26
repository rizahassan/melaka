# AI Providers

Melaka supports multiple AI providers for translation. This document covers setup and configuration for each.

## Supported Providers

| Provider | Models | Best For |
|----------|--------|----------|
| **Gemini** | gemini-2.5-flash, gemini-2.5-pro | Cost-effective, fast translations |
| **OpenAI** | gpt-4o, gpt-4o-mini | High quality, established |
| **Claude** | claude-sonnet-4-20250514, claude-opus-4-20250514 | Nuanced, creative translations |

---

## Gemini (Google)

Google's Gemini models via Firebase Genkit.

### Setup

1. **Enable Gemini API** in Google Cloud Console
2. **Create API Key** or use Application Default Credentials
3. **Store API Key** as Firebase secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

### Configuration

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',  // Recommended
    temperature: 0.3,
    apiKeySecret: 'GEMINI_API_KEY',
  },
  // ...
});
```

### Available Models

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| `gemini-2.5-flash` | ⚡⚡⚡ | ★★★★ | $ |
| `gemini-2.5-pro` | ⚡⚡ | ★★★★★ | $$ |
| `gemini-2.0-flash` | ⚡⚡⚡ | ★★★ | $ |

### Recommendation

Use **`gemini-2.5-flash`** for most translation tasks. It's fast, cost-effective, and handles structured output well.

---

## OpenAI

OpenAI's GPT models.

### Setup

1. **Create API Key** at [platform.openai.com](https://platform.openai.com)
2. **Store API Key** as Firebase secret:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

### Configuration

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  ai: {
    provider: 'openai',
    model: 'gpt-4o-mini',  // Cost-effective
    temperature: 0.3,
    apiKeySecret: 'OPENAI_API_KEY',
  },
  // ...
});
```

### Available Models

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| `gpt-4o` | ⚡⚡ | ★★★★★ | $$$ |
| `gpt-4o-mini` | ⚡⚡⚡ | ★★★★ | $ |
| `gpt-4-turbo` | ⚡⚡ | ★★★★★ | $$ |

### Recommendation

Use **`gpt-4o-mini`** for cost-effective translations. Use **`gpt-4o`** when quality is critical.

---

## Claude (Anthropic)

Anthropic's Claude models.

### Setup

1. **Create API Key** at [console.anthropic.com](https://console.anthropic.com)
2. **Store API Key** as Firebase secret:

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

### Configuration

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  ai: {
    provider: 'claude',
    model: 'claude-sonnet-4-20250514',
    temperature: 0.3,
    apiKeySecret: 'ANTHROPIC_API_KEY',
  },
  // ...
});
```

### Available Models

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| `claude-sonnet-4-20250514` | ⚡⚡ | ★★★★★ | $$ |
| `claude-opus-4-20250514` | ⚡ | ★★★★★ | $$$ |
| `claude-3-5-sonnet-20241022` | ⚡⚡ | ★★★★ | $$ |

### Recommendation

Use **`claude-sonnet-4-20250514`** for high-quality translations with good speed.

---

## Provider Comparison

### Translation Quality

For general content translation, all providers perform well. Differences appear in:

| Aspect | Gemini | OpenAI | Claude |
|--------|--------|--------|--------|
| Accuracy | ★★★★ | ★★★★★ | ★★★★★ |
| Consistency | ★★★★★ | ★★★★ | ★★★★ |
| Cultural nuance | ★★★★ | ★★★★ | ★★★★★ |
| Technical terms | ★★★★ | ★★★★★ | ★★★★ |
| Markdown handling | ★★★★★ | ★★★★ | ★★★★★ |

### Cost Comparison (Approximate)

| Provider | Model | Cost per 1M tokens |
|----------|-------|-------------------|
| Gemini | gemini-2.5-flash | ~$0.075 |
| OpenAI | gpt-4o-mini | ~$0.15 |
| OpenAI | gpt-4o | ~$2.50 |
| Claude | claude-sonnet-4-20250514 | ~$3.00 |

### Speed Comparison

| Provider | Model | ~Tokens/sec |
|----------|-------|-------------|
| Gemini | gemini-2.5-flash | 150+ |
| OpenAI | gpt-4o-mini | 100+ |
| OpenAI | gpt-4o | 50+ |
| Claude | claude-sonnet-4-20250514 | 80+ |

---

## Multi-Provider Setup

You can configure different providers for different collections:

```typescript
import { defineConfig } from 'melaka';

export default defineConfig({
  // Default provider
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  },
  
  collections: [
    {
      path: 'articles',
      // Uses default (Gemini)
    },
    {
      path: 'legal_docs',
      // Override for this collection
      ai: {
        provider: 'openai',
        model: 'gpt-4o',  // Higher quality for legal content
      },
    },
  ],
});
```

---

## Local Development

For local development, use environment variables:

```bash
# .env.local (do not commit!)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

Load in your config:

```typescript
import { defineConfig } from 'melaka';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,  // For local dev
    apiKeySecret: 'GEMINI_API_KEY',       // For production
  },
  // ...
});
```

---

## Error Handling

### Rate Limiting

All providers have rate limits. Melaka handles this with:

- **Automatic retries** with exponential backoff
- **Request staggering** across Cloud Tasks
- **Configurable concurrency** limits

### Common Errors

| Error | Provider | Solution |
|-------|----------|----------|
| `RATE_LIMIT_EXCEEDED` | All | Reduce `maxConcurrency` |
| `INVALID_API_KEY` | All | Check secret configuration |
| `MODEL_NOT_FOUND` | All | Verify model name |
| `CONTEXT_LENGTH_EXCEEDED` | All | Split large documents |
| `INSUFFICIENT_QUOTA` | OpenAI | Upgrade account or wait |

### Handling Large Documents

For documents with large text fields:

```typescript
collections: [
  {
    path: 'long_articles',
    // Reduce batch size for large content
    batchSize: 5,
    maxConcurrency: 3,
  },
],
```

---

## Best Practices

### 1. Start with Gemini

For most use cases, Gemini offers the best cost/performance ratio:

```typescript
ai: {
  provider: 'gemini',
  model: 'gemini-2.5-flash',
}
```

### 2. Use Low Temperature

Lower temperature = more consistent translations:

```typescript
ai: {
  temperature: 0.3,  // Recommended for translation
}
```

### 3. Provide Context via Prompts

Help the AI understand your content:

```typescript
collections: [
  {
    path: 'quiz',
    prompt: `
      Educational quiz content for students.
      Keep tone friendly and encouraging.
      Translate answer choices clearly.
    `,
  },
],
```

### 4. Use Glossaries

Ensure consistent terminology:

```typescript
glossary: {
  'savings': 'simpanan',
  'investment': 'pelaburan',
  'Vespid': 'Vespid',  // Don't translate brand
}
```

### 5. Monitor Costs

Track usage and set alerts in your provider's dashboard.

---

## Next Steps

- [Configuration](./CONFIGURATION.md) — Full config reference
- [CLI Reference](./CLI.md) — Command documentation
- [Architecture](./ARCHITECTURE.md) — System design
