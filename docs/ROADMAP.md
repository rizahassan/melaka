# Roadmap

This document outlines the planned development phases for Melaka.

---

## Current Status: 🚧 Planning

We're in the architecture and planning phase. No code has been written yet.

---

## Phase 1: MVP (v0.1.0)

**Goal:** Minimal viable product that can translate Firestore documents.

### Core Features

- [ ] **@melaka/core**
  - [ ] Config file parsing (`melaka.config.ts`)
  - [ ] TypeScript types and interfaces
  - [ ] Zod schema generation from field types
  - [ ] Content hashing for change detection
  - [ ] Glossary handling

- [ ] **@melaka/ai**
  - [ ] Gemini adapter (primary)
  - [ ] Translation facade with structured output
  - [ ] Prompt construction with glossary

- [ ] **@melaka/firestore**
  - [ ] i18n subcollection read/write
  - [ ] Cloud Task handler for translations
  - [ ] Trigger generator for `onDocumentWritten`
  - [ ] Batch processing with rate limiting

- [ ] **@melaka/cli**
  - [ ] `melaka init` — Create config file
  - [ ] `melaka deploy` — Deploy triggers
  - [ ] `melaka translate` — Manual translation
  - [ ] `melaka status` — Check progress

### Documentation

- [ ] README with quick start
- [ ] Architecture documentation
- [ ] Configuration reference
- [ ] Basic examples

### Milestone

✅ MVP is complete when you can:
1. Run `melaka init` in a Firebase project
2. Configure collections in `melaka.config.ts`
3. Run `melaka deploy` to deploy triggers
4. See automatic translations in `i18n` subcollections

---

## Phase 2: Production Ready (v0.2.0)

**Goal:** Ready for production use with reliability features.

### Features

- [ ] **Additional AI Providers**
  - [ ] OpenAI adapter
  - [ ] Claude adapter

- [ ] **Reliability**
  - [ ] Retry logic with exponential backoff
  - [ ] Error recording and status tracking
  - [ ] `melaka retry` command

- [ ] **Monitoring**
  - [ ] Detailed status output
  - [ ] Progress tracking
  - [ ] JSON output for CI/CD

- [ ] **CLI Improvements**
  - [ ] `melaka validate` — Config validation
  - [ ] `melaka cleanup` — Remove old translations
  - [ ] `--dry-run` flag for all commands
  - [ ] Verbose and quiet modes

### Documentation

- [ ] AI provider comparison and setup
- [ ] Troubleshooting guide
- [ ] CI/CD integration guide

### Milestone

✅ Phase 2 is complete when Melaka can be used in production with confidence.

---

## Phase 3: Developer Experience (v0.3.0)

**Goal:** Great developer experience and tooling.

### Features

- [ ] **Collection Groups**
  - [ ] Support for `isCollectionGroup: true`
  - [ ] Subcollection translation

- [ ] **Export/Import**
  - [ ] `melaka export` — Export translations to JSON/CSV
  - [ ] `melaka import` — Import reviewed translations
  - [ ] Human review workflow support

- [ ] **Field Mappings**
  - [ ] Detailed field configuration
  - [ ] Field-level descriptions for AI context
  - [ ] Custom schema type overrides

- [ ] **Local Development**
  - [ ] Firebase emulator support
  - [ ] Local translation preview
  - [ ] Watch mode for development

### Documentation

- [ ] Advanced configuration examples
- [ ] Human review workflow guide
- [ ] Local development guide

---

## Phase 4: Dashboard (v0.4.0)

**Goal:** Web UI for translation management.

### Features

- [ ] **Review Dashboard**
  - [ ] Web interface for reviewing translations
  - [ ] Side-by-side source/translation view
  - [ ] Mark as reviewed functionality
  - [ ] Edit and save translations

- [ ] **Analytics**
  - [ ] Translation statistics
  - [ ] Cost tracking
  - [ ] Error monitoring

- [ ] **Team Features**
  - [ ] Multiple reviewers
  - [ ] Review assignments
  - [ ] Comment system

### Technical

- [ ] React/Next.js dashboard
- [ ] Firebase Auth integration
- [ ] Hosted version option

---

## Phase 5: Enterprise (v1.0.0)

**Goal:** Enterprise-ready features for large-scale deployments.

### Features

- [ ] **Translation Memory**
  - [ ] Store and reuse translations
  - [ ] Similarity matching
  - [ ] Cost savings through reuse

- [ ] **Advanced Glossary**
  - [ ] Glossary management UI
  - [ ] Import from industry standards (TBX)
  - [ ] Per-language glossaries

- [ ] **Compliance**
  - [ ] Audit logging
  - [ ] Data residency options
  - [ ] SSO integration

- [ ] **Performance**
  - [ ] Incremental field translation
  - [ ] Parallel processing improvements
  - [ ] Large document handling

---

## Future Ideas

These are ideas for future consideration, not committed features:

### Database Adapters
- Supabase/PostgreSQL adapter
- MongoDB adapter
- PlanetScale adapter

### Integrations
- GitHub Action for CI/CD
- VS Code extension
- Slack notifications

### AI Features
- Quality scoring
- Auto-detect source language
- Translation suggestions
- Custom fine-tuned models

### Localization
- RTL language support
- Pluralization rules
- Date/number formatting

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Priority Areas

1. **Core functionality** — Help build the MVP
2. **Documentation** — Improve docs and examples
3. **Testing** — Add unit and integration tests
4. **AI adapters** — Add OpenAI and Claude support

---

## Release Schedule

| Version | Target | Focus |
|---------|--------|-------|
| v0.1.0 | Q2 2026 | MVP |
| v0.2.0 | Q2 2026 | Production ready |
| v0.3.0 | Q3 2026 | Developer experience |
| v0.4.0 | Q3 2026 | Dashboard |
| v1.0.0 | Q4 2026 | Enterprise |

*Dates are estimates and subject to change.*

---

## Feedback

Have ideas or feature requests? 

- Open an issue on [GitHub](https://github.com/rizahassan/melaka/issues)
- Start a discussion in [GitHub Discussions](https://github.com/rizahassan/melaka/discussions)
