# Roadmap

This document outlines the planned development phases for Melaka.

---

## Current Status: ✅ Phase 1 Complete

Phase 1 MVP has been tested and is working. Moving to Phase 2 for production-ready features.

---

## Phase 1: MVP (v0.1.0) ✅ COMPLETE

**Goal:** Minimal viable product that can translate Firestore documents.

**Completed:** March 1, 2026

### Core Features

- [x] **@melaka/core**
  - [x] Config file parsing (`melaka.config.js`/`.ts`)
  - [x] TypeScript types and interfaces
  - [x] Zod schema generation from field types
  - [x] Content hashing for change detection (SHA256)
  - [x] Glossary handling

- [x] **@melaka/ai**
  - [x] Gemini adapter (primary)
  - [x] Translation facade with structured output
  - [x] Prompt construction with glossary

- [x] **@melaka/firestore**
  - [x] i18n subcollection read/write
  - [x] Cloud Task handler for translations
  - [x] Trigger generator for `onDocumentWritten`
  - [x] Batch processing with rate limiting

- [x] **@melaka/cli**
  - [x] `melaka init` — Create config file
  - [x] `melaka deploy` — Deploy triggers
  - [x] `melaka translate` — Manual translation
  - [x] `melaka status` — Check progress
  - [x] `melaka validate` — Config validation

### Documentation

- [x] README with quick start
- [x] Architecture documentation
- [x] Configuration reference
- [x] AI providers documentation
- [x] CLI documentation
- [x] Integration guide

### Milestone ✅

MVP is complete! You can:
1. Run `melaka init` in a Firebase project
2. Configure collections in `melaka.config.js`
3. Run `melaka deploy` to generate triggers
4. Deploy to Firebase and see automatic translations in `i18n` subcollections

---

## Phase 2: Production Ready (v0.2.0) 🚧 IN PROGRESS

**Goal:** Ready for production use with reliability features.

### Features

- [x] **Additional AI Providers**
  - [x] OpenAI adapter
  - [x] Claude adapter
  - [x] Provider switching/fallback

- [x] **Reliability**
  - [x] Retry logic with exponential backoff
  - [x] Error recording and status tracking
  - [x] `melaka retry` command for failed translations

- [ ] **Monitoring**
  - [ ] Detailed status output with statistics
  - [ ] Progress tracking per collection/locale
  - [ ] JSON output for CI/CD integration

- [ ] **CLI Improvements**
  - [ ] `melaka cleanup` — Remove orphaned translations
  - [ ] `--dry-run` flag for all commands
  - [ ] Verbose (`-v`) and quiet (`-q`) modes
  - [ ] Better error messages and diagnostics

- [ ] **Testing**
  - [ ] Unit tests for core packages
  - [ ] Integration tests with Firebase emulator
  - [ ] CI/CD pipeline setup

### Documentation

- [ ] AI provider comparison and setup guide
- [ ] Troubleshooting guide
- [ ] CI/CD integration examples
- [ ] Firebase emulator testing guide

### Milestone

Phase 2 is complete when:
1. OpenAI and Claude adapters are available
2. Failed translations can be retried automatically
3. Comprehensive error handling is in place
4. Unit and integration tests provide confidence

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
