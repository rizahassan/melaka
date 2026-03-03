# 🌏 Melaka

**AI-powered localization for Firebase Firestore**

Melaka is an open-source SDK and CLI for automatically translating Firestore documents using AI. Named after the historic Malaysian state known as a lingua franca hub where many languages were spoken, Melaka brings seamless multilingual support to your Firebase applications.

## Why Melaka?

Firebase has no great i18n solution today. Melaka fills that gap with:

- 🤖 **AI-Powered Translation** — Uses Gemini, OpenAI, or Claude for context-aware translations
- 📝 **Declarative Config** — Define what to translate in a simple config file
- 🔄 **Auto-Sync** — Firestore triggers keep translations up-to-date automatically
- 📦 **i18n Subcollections** — Battle-tested pattern: `/{doc}/i18n/{locale}`
- 🔍 **Change Detection** — Content hashing prevents unnecessary re-translations
- 📖 **Glossary Support** — Consistent terminology across your app
- ✅ **Human Review Workflow** — Mark translations as reviewed
- ☁️ **Melaka Cloud** — Fully managed option (no deployment needed)

## Quick Start

### Self-Hosted (Free)

```bash
# Install Melaka CLI
npm install -g melaka

# Initialize in your Firebase project
cd your-firebase-project
melaka init

# Configure your collections
# Edit melaka.config.ts

# Deploy translation triggers
melaka deploy
```

### Melaka Cloud (Coming Soon)

No deployment needed — just connect your Firebase project:

1. Sign up at melaka.dev
2. Click "Connect Firebase" (OAuth)
3. Select collections to translate
4. Configure target languages
5. Done! Translations happen automatically.

## Packages

| Package | Description |
|---------|-------------|
| `@melaka/core` | Config parsing, types, utilities |
| `@melaka/ai` | AI translation facade (Gemini, OpenAI, Claude) |
| `@melaka/firestore` | Firestore triggers and i18n helpers |
| `@melaka/cli` | Command-line interface |
| `@melaka/dashboard` | Translation review web UI |
| `@melaka/cloud` | Fully managed backend (Melaka Cloud) |

## Documentation

- [Integration Guide](./docs/INTEGRATION.md) — Step-by-step setup
- [Configuration](./docs/CONFIGURATION.md) — Config file reference
- [CLI Reference](./docs/CLI.md) — Command documentation
- [AI Providers](./docs/AI_PROVIDERS.md) — Supported AI models
- [Architecture](./docs/ARCHITECTURE.md) — System design and components
- [Contributing](./CONTRIBUTING.md) — Development guide

## Status

✅ **Core SDK Complete** — Self-hosted solution is fully functional.  
🚧 **Melaka Cloud In Progress** — Fully managed SaaS coming soon.

See [ROADMAP.md](./docs/ROADMAP.md) for planned features.

## License

MIT License — see [LICENSE](./LICENSE)

---

*Built with 💙 in Malaysia*
