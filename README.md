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

## Quick Start

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

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — System design and components
- [Configuration](./docs/CONFIGURATION.md) — Config file reference
- [CLI Reference](./docs/CLI.md) — Command documentation
- [AI Providers](./docs/AI_PROVIDERS.md) — Supported AI models
- [Contributing](./CONTRIBUTING.md) — Development guide

## Status

🚧 **Early Development** — Not ready for production use yet.

See [ROADMAP.md](./docs/ROADMAP.md) for planned features.

## License

MIT License — see [LICENSE](./LICENSE)

---

*Built with 💙 in Malaysia*
