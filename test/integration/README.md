# Integration Tests

Integration tests verify Melaka against the Firebase Emulator Suite.

## Prerequisites

1. **Install Firebase Tools** (globally):
   ```bash
   npm install -g firebase-tools
   ```

2. **Start Emulators** before running tests:
   ```bash
   firebase emulators:start --only firestore
   ```

## Running Tests

With emulators running:

```bash
# From project root
pnpm test:integration
```

Or run manually:

```bash
# Start emulators in one terminal
firebase emulators:start --only firestore

# Run integration tests in another
FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm vitest run test/integration
```

## Test Structure

- `firestore.test.ts` - Tests i18n subcollection operations
- `processor.test.ts` - Tests document translation processor
- `facade.test.ts` - Tests AI provider facade (mocked)

## CI/CD

Integration tests are currently skipped in CI due to emulator setup complexity.
To run in CI, add a job that starts emulators before running tests.

Example GitHub Actions step:
```yaml
- name: Start Firebase Emulator
  run: |
    npm install -g firebase-tools
    firebase emulators:start --only firestore &
    sleep 10
  
- name: Run integration tests
  env:
    FIRESTORE_EMULATOR_HOST: localhost:8080
  run: pnpm test:integration
```
