# @melaka/cloud

Fully managed translation service backend for Melaka Cloud.

## Overview

This package provides the server-side infrastructure for Melaka's fully managed translation service. It watches customer Firestore collections via OAuth and translates documents automatically.

## Components

### MelakaCloudService
Main orchestrator that ties everything together.

```typescript
import { MelakaCloudService } from '@melaka/cloud';

const service = new MelakaCloudService({
  oauth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'https://melaka.dev/api/oauth/callback',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  ai: {
    aiProvider: 'gemini',
    aiApiKey: process.env.GEMINI_API_KEY,
  },
});

await service.start();
```

### OAuthManager
Handles Google OAuth for Firestore access.

```typescript
import { OAuthManager } from '@melaka/cloud';

const oauth = new OAuthManager({
  clientId: '...',
  clientSecret: '...',
  redirectUri: '...',
});

// Get auth URL
const authUrl = oauth.getAuthUrl(userId);

// Exchange code for tokens
const tokens = await oauth.exchangeCode(code);
```

### ProjectManager
Manages connected customer Firebase projects.

```typescript
import { ProjectManager } from '@melaka/cloud';

const manager = new ProjectManager();
const firestore = await manager.initializeProject(project);
```

### FirestoreListener
Watches customer collections for changes.

```typescript
import { FirestoreListener } from '@melaka/cloud';

const listener = new FirestoreListener(queue, {
  onDocument: (projectId, docPath, action) => {
    console.log(`${action}: ${docPath}`);
  },
});

await listener.startListening(project, firestore);
```

### TranslationQueue
Redis-backed job queue for translation tasks.

```typescript
import { TranslationQueue } from '@melaka/cloud';

const queue = new TranslationQueue({
  redisUrl: process.env.REDIS_URL,
});

await queue.enqueue(job);
const job = await queue.dequeue();
```

### TranslationWorker
Processes translation jobs from the queue.

```typescript
import { TranslationWorker } from '@melaka/cloud';

const worker = new TranslationWorker(queue, projectManager, {
  aiProvider: 'gemini',
  aiApiKey: process.env.GEMINI_API_KEY,
});

await worker.start();
```

## Architecture

```
Customer's Firestore  ◄──OAuth──►  Melaka Cloud
                                   ├── FirestoreListener (watches collections)
                                   ├── TranslationQueue (Redis)
                                   ├── TranslationWorker (processes jobs)
                                   └── ProjectManager (manages connections)
```

## Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Redis
REDIS_URL=redis://localhost:6379

# AI Provider (choose one)
GEMINI_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
ANTHROPIC_API_KEY=your-api-key
```

## Deployment

The cloud service can be deployed to:
- **Cloud Run** (recommended)
- **Railway**
- **Fly.io**
- **AWS ECS/Fargate**

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
CMD ["node", "packages/cloud/dist/index.js"]
```

## Security

- OAuth tokens are encrypted at rest
- Minimal permissions (only Firestore access)
- Customers can revoke access anytime
- All operations are logged

## License

MIT
