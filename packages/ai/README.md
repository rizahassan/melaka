# @melaka/ai

AI provider adapters for Melaka - AI-powered Firestore localization.

## Installation

```bash
pnpm add @melaka/ai
```

## Usage

```typescript
import { createTranslationFacade } from '@melaka/ai';
import { z } from 'zod';

const facade = createTranslationFacade({
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
});

const result = await facade.translate(
  { title: 'Hello World', body: 'Welcome to our app' },
  z.object({ title: z.string(), body: z.string() }),
  { targetLanguage: 'ms-MY' }
);

if (result.success) {
  console.log(result.output);
  // { title: 'Hello Dunia', body: 'Selamat datang ke aplikasi kami' }
}
```

## Supported Providers

- **Gemini** (Google) - `gemini-2.5-flash`, `gemini-2.5-pro`
- **OpenAI** - `gpt-4o`, `gpt-4o-mini` (Phase 2)
- **Claude** (Anthropic) - `claude-sonnet-4-20250514` (Phase 2)

## Documentation

See the [main Melaka documentation](https://github.com/rizahassan/melaka).
