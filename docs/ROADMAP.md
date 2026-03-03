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

## Phase 2: Production Ready (v0.2.0) ✅ COMPLETE

**Goal:** Ready for production use with reliability features.

**Completed:** March 1, 2026

### Features

- [x] **Additional AI Providers**
  - [x] OpenAI adapter
  - [x] Claude adapter
  - [x] Provider switching/fallback

- [x] **Reliability**
  - [x] Retry logic with exponential backoff
  - [x] Error recording and status tracking
  - [x] `melaka retry` command for failed translations

- [x] **Monitoring**
  - [x] Detailed status output with statistics (`--live` flag)
  - [x] Progress tracking per collection/locale
  - [x] JSON output for CI/CD integration (`--json` flag)

- [x] **CLI Improvements**
  - [x] `melaka cleanup` — Remove orphaned translations
  - [x] `--dry-run` flag for cleanup and retry commands
  - [x] Verbose (`-v`) mode for all commands
  - [x] Better error messages and diagnostics

- [x] **Testing**
  - [x] Unit tests for core packages (48 tests)
  - [x] Vitest with coverage support
  - [x] Integration tests with mocked AI providers (8 tests)
  - [x] Integration tests for Firestore emulator (7 tests)
  - [x] CI/CD pipeline setup

### Documentation

- [x] AI provider comparison and setup guide
- [x] Integration test README with emulator instructions
- [ ] Troubleshooting guide
- [ ] Firebase emulator testing guide

### Milestone

Phase 2 is complete when:
1. ✅ OpenAI and Claude adapters are available
2. ✅ Failed translations can be retried automatically
3. ✅ Comprehensive error handling is in place
4. ✅ Unit and integration tests provide confidence

---

## Phase 3: Developer Experience (v0.3.0) ✅ COMPLETE

**Goal:** Great developer experience and tooling.

**Completed:** March 2, 2026

### Features

- [x] **Collection Groups**
  - [x] Support for `isCollectionGroup: true`
  - [x] Subcollection translation via collectionGroup queries

- [x] **Export/Import**
  - [x] `melaka export` — Export translations to JSON/CSV
  - [x] `melaka import` — Import reviewed translations
  - [x] Human review workflow support (--failed-only, --unreviewed-only, --mark-reviewed)

- [x] **Field Mappings**
  - [x] Detailed field configuration via `fieldMappings`
  - [x] Field-level descriptions for AI context
  - [x] Custom schema type overrides

- [x] **Local Development**
  - [x] Firebase emulator support (--emulator flag)
  - [x] `melaka watch` — Real-time translation during development
  - [x] Verbose mode for debugging

### Documentation

- [ ] Advanced configuration examples
- [ ] Human review workflow guide
- [ ] Local development guide

---

## Phase 4: Dashboard (v0.4.0) ✅ COMPLETE

**Goal:** Web UI for translation management.

**Completed:** March 2, 2026

### Features

- [x] **Review Dashboard**
  - [x] Web interface for reviewing translations
  - [x] Side-by-side source/translation view
  - [x] Mark as reviewed functionality
  - [x] Edit and save translations

- [x] **Analytics**
  - [x] Translation statistics
  - [x] Progress tracking by collection/language
  - [x] Recent activity feed

- [ ] **Team Features** (deferred to v0.5.0)
  - [ ] Multiple reviewers
  - [ ] Review assignments
  - [ ] Comment system

### Technical

- [x] Next.js 14 dashboard
- [x] Tailwind CSS styling
- [x] Firebase client SDK integration
- [ ] Firebase Auth integration (deferred)
- [ ] Hosted version option (deferred)

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

## Phase 6: Melaka Cloud (v1.1.0) 🚧 IN PROGRESS

**Goal:** Fully managed SaaS — customers just connect Firebase, we handle everything.

### Business Model
- **Free:** Self-hosted with own AI keys (current SDK)
- **Pro ($29/mo):** Fully managed translations + dashboard
- **Enterprise ($299/mo):** Everything + SSO + translation memory + priority support (roadmap)

### Customer Experience
1. Sign up at melaka.dev
2. Click "Connect Firebase" (OAuth)
3. Select collections to translate
4. Configure languages
5. Done! Translations happen automatically.

**No Cloud Functions. No deployment. No AI keys.**

### Features

- [x] **OAuth Integration**
  - [x] "Connect with Google" in dashboard
  - [x] Request Firestore read/write permissions
  - [x] Secure token storage (AES-256-GCM encrypted)
  - [ ] Per-collection permission scoping
  - [ ] Easy disconnect/revoke UI

- [x] **Database Layer**
  - [x] Supabase/PostgreSQL schema
  - [x] Projects CRUD with user ownership
  - [x] Encrypted OAuth token storage
  - [x] Usage metering records

- [x] **Project Management APIs**
  - [x] GET/POST /api/projects
  - [x] GET/PATCH/DELETE /api/projects/[id]

- [x] **Cloud Package (@melaka/cloud)**
  - [x] OAuthManager for Google OAuth
  - [x] ProjectManager for Firebase projects
  - [x] FirestoreListener for collection watching
  - [x] TranslationQueue (Redis-backed)
  - [x] TranslationWorker with AI integration

- [ ] **Firestore Listener Service Deployment**
  - [x] Core listener implementation
  - [ ] Cloud Run deployment
  - [ ] Auto-scaling configuration
  - [ ] Health checks and monitoring

- [ ] **AI Translation Engine**
  - [x] Multi-provider support (Gemini, OpenAI, Claude)
  - [x] Automatic provider fallback
  - [ ] Production deployment
  - [ ] Cost optimization

- [ ] **Translation Memory** (deferred to Enterprise)
  - [ ] Cache translations server-side
  - [ ] Similarity matching (fuzzy reuse)

- [ ] **Usage Metering & Billing**
  - [x] Usage records schema
  - [x] Stripe integration (checkout, portal, webhook)
  - [ ] Real-time usage tracking
  - [ ] Overage alerts and notifications

- [ ] **Dashboard Enhancements**
  - [x] Connect Firebase page (/connect)
  - [x] Pricing page with Free/Pro tiers
  - [ ] Collection selector with preview
  - [ ] Real-time translation status
  - [ ] Usage & cost analytics

- [ ] **Firestore Listener Service**
  - [ ] Watches customer's Firestore collections
  - [ ] Detects document creates/updates
  - [ ] Queues translation jobs
  - [ ] Writes translations back to i18n subcollections
  - [ ] Handles retries and failures

- [ ] **AI Translation Engine**
  - [ ] Multi-provider support (Gemini, OpenAI, Claude)
  - [ ] Automatic provider fallback
  - [ ] Customer doesn't need AI API keys
  - [ ] Melaka handles all AI costs (built into pricing)

- [ ] **Translation Memory**
  - [ ] Cache translations server-side
  - [ ] Similarity matching (fuzzy reuse)
  - [ ] Significant cost savings
  - [ ] Cross-project memory (opt-in for enterprise)

- [ ] **Usage Metering & Billing**
  - [ ] Track translations per customer
  - [ ] Stripe subscription + usage billing
  - [ ] Free tier limits (e.g., 1,000 translations/month)
  - [ ] Usage dashboard with cost breakdown
  - [ ] Overage alerts and notifications

- [ ] **Dashboard Enhancements**
  - [ ] Project connection wizard
  - [ ] Collection selector with preview
  - [ ] Real-time translation status
  - [ ] Usage & cost analytics
  - [ ] Billing management (Stripe portal)
  - [ ] Team invitations and roles

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Customer's Firebase Project                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Firestore                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │
│  │  │ articles │  │  quiz    │  │ lessons  │  ...      │    │
│  │  │  └─i18n  │  │  └─i18n  │  │  └─i18n  │           │    │
│  │  └──────────┘  └──────────┘  └──────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ▲                                  │
│                           │ Read/Write (OAuth)               │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     Melaka Cloud                             │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │              Firestore Listener Service              │    │
│  │  • Watches customer collections                      │    │
│  │  • Detects changes via onSnapshot                    │    │
│  │  • Queues translation jobs                           │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │              Translation Engine                      │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Job Queue│  │ Trans Memory │  │  AI Providers│   │    │
│  │  │ (Redis)  │  │  (Postgres)  │  │ Gemini/GPT/  │   │    │
│  │  │          │  │              │  │ Claude       │   │    │
│  │  └──────────┘  └──────────────┘  └──────────────┘   │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │              Dashboard & API                         │    │
│  │  • OAuth management        • Usage tracking          │    │
│  │  • Translation review      • Stripe billing          │    │
│  │  • Analytics               • Team management         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Infrastructure Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Dashboard | Next.js (Vercel) | UI + API routes |
| Listener Service | Node.js (Cloud Run / Railway) | Watch customer Firestore |
| Job Queue | Redis (Upstash) | Translation job management |
| Translation Memory | PostgreSQL (Supabase) | Cache + similarity matching |
| Auth | Firebase Auth | User management |
| Billing | Stripe | Subscriptions + usage billing |

### Security

- OAuth tokens encrypted at rest
- Minimal permissions (only requested collections)
- Audit logging for all operations
- Customer can revoke access anytime
- SOC 2 compliance (future)

### Migration Path

**Self-hosted users can keep using the SDK for free.**
Melaka Cloud is an optional paid tier, not a replacement.

```
Self-hosted (Free)              Melaka Cloud (Paid)
├── @melaka/core                ├── Just connect Firebase
├── @melaka/ai                  ├── No code deployment
├── @melaka/firestore           ├── No AI keys needed
├── @melaka/cli                 └── We handle everything
└── Your own AI keys
```

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
| v0.1.0 | ✅ Mar 2026 | MVP |
| v0.2.0 | ✅ Mar 2026 | Production ready |
| v0.3.0 | ✅ Mar 2026 | Developer experience |
| v0.4.0 | ✅ Mar 2026 | Dashboard |
| v1.0.0 | Q2 2026 | Enterprise |
| v1.1.0 | Q3 2026 | Melaka Cloud (SaaS) |

*Dates are estimates and subject to change.*

---

## Feedback

Have ideas or feature requests? 

- Open an issue on [GitHub](https://github.com/rizahassan/melaka/issues)
- Start a discussion in [GitHub Discussions](https://github.com/rizahassan/melaka/discussions)
