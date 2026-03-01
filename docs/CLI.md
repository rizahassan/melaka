# CLI Reference

Melaka provides a command-line interface for managing translations.

## Installation

```bash
# Global installation (recommended)
npm install -g melaka

# Or use npx
npx melaka <command>
```

---

## Commands

### `melaka init`

Initialize Melaka in your Firebase project with an interactive step-by-step wizard.

```bash
melaka init [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `-f, --force` | Overwrite existing config file |
| `-q, --quick` | Use defaults for quick setup |

**Interactive Steps:**

The command guides you through 5 steps:

1. **Target Languages** — Select which languages to translate to (from common options or enter custom BCP 47 codes)
2. **AI Provider** — Choose between Gemini, OpenAI, or Claude
3. **AI Model** — Select the specific model for your provider
4. **Firebase Region** — Pick your Firebase Functions region
5. **Collections** — Configure one or more collections with their fields

**Example Session:**
```bash
$ melaka init

🌏 Welcome to Melaka!
   AI-powered localization for Firebase Firestore

   Let's set up your translation configuration step by step.
   Press Ctrl+C anytime to cancel.

Step 1/5: Target Languages
Which languages do you want to translate your content into?

? Select target languages:
  ◯ Malay (Malaysia) (ms-MY)
  ◉ Chinese (Simplified) (zh-CN)
  ◉ Japanese (ja-JP)
  ...

Step 2/5: AI Provider
? Select AI provider:
❯ Google Gemini - Cost-effective, fast translations (recommended)
  OpenAI - High quality, established provider
  Anthropic Claude - Nuanced, creative translations

Step 3/5: AI Model
? Select model:
❯ Gemini 2.5 Flash - Fast & affordable (recommended)
  Gemini 2.5 Pro - Higher quality
  
Step 4/5: Firebase Region
? Select Firebase region:
❯ US Central (Iowa)
  Asia Southeast (Singapore)
  ...

Step 5/5: Collections
? Enter collection path: articles
? Enter fields to translate in "articles": title, content, summary
? Add a custom prompt for context? Yes
? Enter context prompt: Blog articles with markdown formatting.
? Add another collection? No

✓ Created melaka.config.ts

✨ Melaka initialized successfully!

Configuration Summary:
  Languages:    zh-CN, ja-JP
  AI Provider:  Google Gemini
  Model:        gemini-3-flash-preview
  Region:       us-central1
  Collections:  articles

Next steps:
  1. Review your config:
     cat melaka.config.ts

  2. Set up your AI API key:
     firebase functions:secrets:set GEMINI_API_KEY

  3. Deploy translation triggers:
     melaka deploy
```

**Creates:**
- `melaka.config.ts` — Configuration file customized to your selections

---

### `melaka deploy`

Generate and deploy Firestore triggers for automatic translation.

```bash
melaka deploy [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--dry-run` | Preview generated code without deploying |
| `--only <collections>` | Deploy triggers for specific collections |
| `--region <region>` | Override Firebase region |

**Example:**
```bash
# Deploy all triggers
melaka deploy

# Preview without deploying
melaka deploy --dry-run

# Deploy specific collections
melaka deploy --only articles,products
```

**Generated:**
- Firestore `onDocumentWritten` triggers for each collection
- Cloud Task handler for async translation processing

---

### `melaka translate`

Manually translate documents in a collection.

```bash
melaka translate <collection> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `collection` | Collection path to translate |

**Options:**
| Option | Description |
|--------|-------------|
| `--language <code>` | Target language (translates to all if omitted) |
| `--force` | Re-translate even if unchanged |
| `--batch-size <n>` | Documents per batch |
| `--dry-run` | Preview without translating |
| `--document <id>` | Translate single document |

**Examples:**
```bash
# Translate all articles to all configured languages
melaka translate articles

# Translate to specific language
melaka translate articles --language ms-MY

# Force re-translation
melaka translate articles --force

# Translate single document
melaka translate articles --document article-123

# Preview translation
melaka translate articles --dry-run
```

---

### `melaka status`

Check translation progress for collections.

```bash
melaka status [collection] [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `collection` | Collection path (shows all if omitted) |

**Options:**
| Option | Description |
|--------|-------------|
| `--language <code>` | Filter by language |
| `--json` | Output as JSON |

**Examples:**
```bash
# Status of all collections
melaka status

# Status of specific collection
melaka status articles

# Filter by language
melaka status articles --language ms-MY
```

**Output:**
```
Collection: articles
Language: ms-MY

Total Documents:     150
├─ Completed:        142 (94.7%)
├─ Failed:             3 (2.0%)
└─ Pending:            5 (3.3%)

Last Translation: 2 hours ago
```

---

### `melaka retry`

Retry failed translations.

```bash
melaka retry [collection] [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `collection` | Collection path (retries all if omitted) |

**Options:**
| Option | Description |
|--------|-------------|
| `--language <code>` | Filter by language |
| `--limit <n>` | Maximum documents to retry |

**Examples:**
```bash
# Retry all failed translations
melaka retry

# Retry specific collection
melaka retry articles

# Retry with limit
melaka retry articles --limit 10
```

---

### `melaka validate`

Validate your configuration file.

```bash
melaka validate [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--config <path>` | Path to config file |

**Example:**
```bash
melaka validate
```

**Output:**
```
✓ Config file found: melaka.config.ts
✓ Languages valid: ms-MY, zh-CN
✓ AI provider configured: gemini
✓ Collections configured: 3
✓ Glossary entries: 15

Config is valid!
```

---

### `melaka cleanup`

Remove old or outdated translations.

```bash
melaka cleanup [collection] [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `collection` | Collection path (cleans all if omitted) |

**Options:**
| Option | Description |
|--------|-------------|
| `--days <n>` | Remove translations older than N days |
| `--failed-only` | Remove only failed translations |
| `--orphaned` | Remove translations for deleted source docs |
| `--dry-run` | Preview without deleting |

**Examples:**
```bash
# Remove translations older than 30 days
melaka cleanup --days 30

# Remove failed translations only
melaka cleanup articles --failed-only

# Preview cleanup
melaka cleanup --orphaned --dry-run
```

---

### `melaka export`

Export translations to files.

```bash
melaka export <collection> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `collection` | Collection path to export |

**Options:**
| Option | Description |
|--------|-------------|
| `--language <code>` | Language to export |
| `--format <type>` | Output format: json, csv |
| `--output <path>` | Output file path |

**Examples:**
```bash
# Export to JSON
melaka export articles --language ms-MY --output translations.json

# Export to CSV
melaka export articles --format csv --output translations.csv
```

---

### `melaka import`

Import translations from files (for human-reviewed content).

```bash
melaka import <collection> <file> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `collection` | Collection path to import into |
| `file` | Input file path |

**Options:**
| Option | Description |
|--------|-------------|
| `--language <code>` | Target language |
| `--mark-reviewed` | Mark imported as reviewed |
| `--dry-run` | Preview without importing |

**Examples:**
```bash
# Import reviewed translations
melaka import articles translations.json --language ms-MY --mark-reviewed

# Preview import
melaka import articles translations.json --dry-run
```

---

## Global Options

These options work with any command:

| Option | Description |
|--------|-------------|
| `--config <path>` | Path to config file |
| `--project <id>` | Firebase project ID |
| `--help` | Show help |
| `--version` | Show version |
| `--verbose` | Verbose output |
| `--quiet` | Minimal output |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MELAKA_CONFIG` | Path to config file |
| `FIREBASE_PROJECT` | Firebase project ID |
| `GEMINI_API_KEY` | Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |

---

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | General error |
| `2` | Config error |
| `3` | Firebase error |
| `4` | Translation error |

---

## Examples

### Complete Workflow

```bash
# 1. Initialize project
cd my-firebase-project
melaka init --provider gemini

# 2. Edit configuration
vim melaka.config.ts

# 3. Validate config
melaka validate

# 4. Deploy triggers
melaka deploy

# 5. Run initial translation
melaka translate --all

# 6. Check progress
melaka status

# 7. Retry any failures
melaka retry
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy Translations

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Melaka
        run: npm install -g melaka
      
      - name: Validate config
        run: melaka validate
      
      - name: Deploy triggers
        run: melaka deploy
        env:
          FIREBASE_PROJECT: ${{ secrets.FIREBASE_PROJECT }}
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GCP_SA_KEY }}
```

---

## Next Steps

- [Configuration](./CONFIGURATION.md) — Config file reference
- [AI Providers](./AI_PROVIDERS.md) — Provider-specific setup
- [Architecture](./ARCHITECTURE.md) — System design
