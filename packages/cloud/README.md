# @melaka/cloud

Fully managed translation service backend for Melaka Cloud.

## Overview

This package provides the server-side infrastructure for Melaka's fully managed translation service using Firebase/GCP services.

**Stack:**
- **Database**: Firestore
- **Queue**: Cloud Tasks
- **Auth**: Firebase Auth + Google OAuth
- **Hosting**: Firebase Hosting / Cloud Run

## Usage

```typescript
import { MelakaCloudGCP } from '@melaka/cloud';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp();
const firestore = getFirestore(app);

const melaka = new MelakaCloudGCP({
  firestore,
  encryptionKey: process.env.ENCRYPTION_KEY!,
  oauth: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: 'https://melaka.dev/api/oauth/callback',
  },
  tasks: {
    projectId: process.env.GCP_PROJECT_ID!,
    location: 'us-central1',
    queueName: 'melaka-translations',
    serviceUrl: 'https://your-cloud-run-service.run.app',
  },
  ai: {
    provider: 'gemini',
    apiKey: process.env.GEMINI_API_KEY!,
  },
});
```

## Components

- **MelakaCloudGCP** - Main service orchestrator
- **MelakaFirestoreDatabase** - Projects, OAuth tokens (encrypted), usage records
- **MelakaCloudTasks** - Job queue using Google Cloud Tasks
- **OAuthManager** - Google OAuth for customer Firestore access

## Dashboard Import

For Next.js dashboard, use the lightweight import that excludes Cloud Tasks:

```typescript
import { MelakaFirestoreDatabase, OAuthManager } from '@melaka/cloud/dashboard';
```

This avoids bundling issues with `@google-cloud/tasks` in Next.js.

## Environment Variables

```env
# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Encryption (32+ chars)
ENCRYPTION_KEY=your-encryption-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Cloud Tasks
CLOUD_TASKS_PROJECT_ID=your-project-id
CLOUD_TASKS_LOCATION=us-central1
CLOUD_TASKS_QUEUE_NAME=melaka-translations
CLOUD_TASKS_SERVICE_URL=https://your-service.run.app

# AI Provider
GEMINI_API_KEY=your-api-key
```

## Firestore Collections

- `melaka_projects` - Connected Firebase projects
- `melaka_oauth_tokens` - Encrypted OAuth credentials
- `melaka_usage` - Monthly usage records
- `melaka_jobs` - Translation job tracking

## Security

- OAuth tokens encrypted at rest (AES-256-GCM)
- Minimal permissions (only Firestore access)
- Customers can revoke access anytime

## License

MIT
