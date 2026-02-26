# @melaka/cli

Command-line interface for Melaka - AI-powered Firestore localization.

## Installation

```bash
npm install -g @melaka/cli
# or
pnpm add -g @melaka/cli
```

## Commands

### `melaka init`

Initialize Melaka in your Firebase project.

```bash
cd your-firebase-project
melaka init
```

Creates `melaka.config.ts` with a starter configuration.

### `melaka deploy`

Generate and deploy Melaka Cloud Functions.

```bash
melaka deploy
```

Options:
- `-o, --output <dir>` — Output directory (default: `functions/src/melaka`)
- `--no-firebase` — Generate only, skip deployment
- `--dry-run` — Show what would be generated

### `melaka translate`

Manually trigger translation for collections.

```bash
melaka translate
melaka translate --collection products
melaka translate --collection products --language ms-MY
melaka translate --force
```

### `melaka status`

Check translation status and configuration.

```bash
melaka status
melaka status --collection products
melaka status --json
```

### `melaka validate`

Validate your `melaka.config.ts`.

```bash
melaka validate
```

## Documentation

See the [main Melaka documentation](https://github.com/rizahassan/melaka).
