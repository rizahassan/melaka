# 🌏 Melaka

**AI-powered localization for Firebase Firestore**

Melaka is an open-source SDK and CLI for automatically translating Firestore documents using AI. Named after the historic Malaysian state known as a multilingual trading hub where merchants from China, India, Arabia, and Europe gathered, Melaka brings seamless multilingual support to your Firebase applications.

[![CI](https://github.com/rizahassan/melaka/actions/workflows/ci.yml/badge.svg)](https://github.com/rizahassan/melaka/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Melaka?

Firebase has no built-in i18n solution. Melaka fills that gap with:

- 🤖 **AI-Powered Translation** — Uses Gemini, OpenAI, or Claude for context-aware translations
- 📝 **Declarative Config** — Define what to translate in a simple config file
- 🔄 **Auto-Sync** — Firestore triggers keep translations up-to-date automatically
- 📦 **i18n Subcollections** — Battle-tested pattern: `/{doc}/i18n/{locale}`
- 🔍 **Change Detection** — Content hashing prevents unnecessary re-translations
- 📖 **Glossary Support** — Consistent terminology across your app
- ✅ **Human Review Workflow** — Mark translations as reviewed
- ☁️ **Melaka Cloud** — Fully managed SaaS (no deployment needed)

## Quick Start

### Option 1: Melaka Cloud (Recommended)

No deployment needed — connect your Firebase project in minutes:

1. Sign up at [melaka.dev](https://melaka.dev)
2. Click **"Connect Firebase"** (OAuth)
3. Select collections to translate
4. Configure target languages
5. Done! Translations happen automatically.

**Pricing:**
- **Free** — Self-hosted, unlimited translations
- **Starter** — $19/mo, 2,000 translations
- **Pro** — $49/mo, 10,000 translations
- **Scale** — $149/mo, 50,000 translations

All paid plans include a 14-day free trial.

### Option 2: Self-Hosted (Free)

```bash
# Install Melaka CLI
npm install -g @melaka/cli

# Initialize in your Firebase project
cd your-firebase-project
melaka init

# Configure your collections (edit melaka.config.ts)
# Deploy translation triggers
melaka deploy
```

## Usage

```typescript
import { Melaka } from '@melaka/core';

const melaka = new Melaka({
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY,
});

// Translate a document to multiple languages
await melaka.translate(docRef, ['ms', 'zh', 'ta', 'ja']);

// Auto-translate on document changes (Cloud Functions)
export const onContentUpdate = melaka.createTrigger('articles', {
  targetLocales: ['ms', 'zh', 'ta'],
  fields: ['title', 'body', 'summary'],
});
```

## Packages

| Package | Description |
|---------|-------------|
| `@melaka/core` | Config parsing, types, utilities |
| `@melaka/ai` | AI translation facade (Gemini, OpenAI, Claude) |
| `@melaka/firestore` | Firestore triggers and i18n helpers |
| `@melaka/cli` | Command-line interface |
| `@melaka/dashboard` | Web dashboard (Next.js) |
| `@melaka/cloud` | Melaka Cloud backend services |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Your Firebase  │────▶│  Melaka Cloud   │────▶│   AI Provider   │
│    Project      │     │   (Listener)    │     │ (Gemini/OpenAI) │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Cloud Tasks    │
                        │    (Queue)      │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Melaka Worker  │
                        │  (Translator)   │
                        └─────────────────┘
```

## Documentation

- [Integration Guide](./docs/INTEGRATION.md) — Step-by-step setup
- [Configuration](./docs/CONFIGURATION.md) — Config file reference
- [CLI Reference](./docs/CLI.md) — Command documentation
- [AI Providers](./docs/AI_PROVIDERS.md) — Supported AI models
- [Architecture](./docs/ARCHITECTURE.md) — System design and components
- [Contributing](./CONTRIBUTING.md) — Development guide

## Roadmap

- [x] Core SDK & CLI
- [x] Melaka Cloud (managed SaaS)
- [x] OAuth Firebase connection
- [x] Stripe billing integration
- [ ] Team collaboration
- [ ] Translation memory
- [ ] Batch translation API
- [ ] VS Code extension

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
# Clone and setup
git clone https://github.com/rizahassan/melaka.git
cd melaka
pnpm install
pnpm build
pnpm test
```

## License

MIT License — see [LICENSE](./LICENSE)

---

**[melaka.dev](https://melaka.dev)** · Built with 💙 by [Vehan Apps](https://vehanapps.com)
