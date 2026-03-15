# Melaka Cloud Deployment Guide

This guide covers deploying Melaka Cloud services to Google Cloud Platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Melaka Cloud                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Dashboard  │     │   Listener   │     │    Worker    │    │
│  │  (Next.js)   │     │ (Cloud Run)  │     │ (Cloud Run)  │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                    │                    ▲             │
│         │                    │                    │             │
│         ▼                    ▼                    │             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │  Firestore   │     │ Cloud Tasks  │────▶│    Gemini    │    │
│  │ (melaka-cloud)│     │    Queue     │     │     API      │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Customer Firestore│
                    │  (translations)   │
                    └──────────────────┘
```

## Prerequisites

1. **Google Cloud Project**: `melaka-cloud` (or your project ID)
2. **gcloud CLI**: Installed and authenticated
3. **APIs Enabled**:
   - Cloud Run
   - Cloud Tasks
   - Cloud Build
   - Firestore

## Step-by-Step Deployment

### 1. Install gcloud CLI

```bash
# macOS
brew install --cask google-cloud-sdk

# Then authenticate
gcloud init
gcloud auth login
```

### 2. Set Project & Enable APIs

```bash
gcloud config set project melaka-cloud

gcloud services enable \
  run.googleapis.com \
  cloudtasks.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com
```

### 3. Create Cloud Tasks Queue

```bash
gcloud tasks queues create melaka-translations \
  --location=us-central1 \
  --max-concurrent-dispatches=10 \
  --max-attempts=3
```

### 4. Deploy Worker Service

The worker processes translation tasks using Gemini.

```bash
cd services/worker

gcloud beta run deploy melaka-worker \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=<your-gemini-key>" \
  --memory=512Mi \
  --timeout=300s
```

Note the URL output (e.g., `https://melaka-worker-xxxxx.run.app`)

### 5. Deploy Listener Service

The listener watches customer Firestore collections and queues translations.

```bash
cd services/listener

gcloud beta run deploy melaka-listener \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --min-instances=1 \
  --timeout=3600s \
  --set-env-vars="\
FIREBASE_PROJECT_ID=melaka-cloud,\
ENCRYPTION_KEY=<your-encryption-key>,\
CLOUD_TASKS_PROJECT_ID=melaka-cloud,\
CLOUD_TASKS_LOCATION=us-central1,\
CLOUD_TASKS_QUEUE_NAME=melaka-translations,\
CLOUD_TASKS_SERVICE_URL=<worker-url-from-step-4>,\
GEMINI_API_KEY=<your-gemini-key>"
```

**Note**: For `FIREBASE_SERVICE_ACCOUNT_JSON`, you may need to use Secret Manager:

```bash
# Create secret
echo '<service-account-json>' | gcloud secrets create melaka-service-account --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding melaka-service-account \
  --member="serviceAccount:<project-number>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Deploy with secret
gcloud beta run deploy melaka-listener \
  --source . \
  --region=us-central1 \
  --set-secrets="FIREBASE_SERVICE_ACCOUNT_JSON=melaka-service-account:latest" \
  ...
```

### 6. Deploy Dashboard

The dashboard can be deployed to Firebase Hosting or Vercel.

#### Firebase Hosting

```bash
cd packages/dashboard

# Build
pnpm build

# Deploy
firebase deploy --only hosting
```

## Environment Variables

### Dashboard (.env.local)

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=

# OAuth & Security
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ENCRYPTION_KEY=

# Cloud Tasks
CLOUD_TASKS_PROJECT_ID=
CLOUD_TASKS_LOCATION=
CLOUD_TASKS_QUEUE_NAME=
CLOUD_TASKS_SERVICE_URL=

# AI
GEMINI_API_KEY=

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

### Worker Service

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key |

### Listener Service

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Melaka Cloud project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Service account JSON |
| `ENCRYPTION_KEY` | 32+ char encryption key |
| `CLOUD_TASKS_PROJECT_ID` | GCP project for Cloud Tasks |
| `CLOUD_TASKS_LOCATION` | Region (e.g., `us-central1`) |
| `CLOUD_TASKS_QUEUE_NAME` | Queue name (e.g., `melaka-translations`) |
| `CLOUD_TASKS_SERVICE_URL` | Worker service URL |
| `GEMINI_API_KEY` | For future use |

## Monitoring

### Cloud Run Logs

```bash
# Worker logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=melaka-worker" --limit=50

# Listener logs  
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=melaka-listener" --limit=50
```

### Cloud Tasks Queue

```bash
gcloud tasks queues describe melaka-translations --location=us-central1
```

### Health Checks

```bash
# Worker
curl https://melaka-worker-xxxxx.run.app/

# Listener
curl https://melaka-listener-xxxxx.run.app/
```

## Troubleshooting

### "NOT_FOUND" errors
- Ensure Firestore is in **Native mode** (not Datastore mode)
- Check that `melaka_projects` collection exists

### OAuth "invalid_client"
- Verify client secret matches between GCP and `.env.local`
- Check redirect URIs in GCP Credentials

### Translations not triggering
- Check listener logs for errors
- Verify project status is `active` in Firestore
- Ensure collections are configured with correct field paths

### Cloud Tasks failing
- Check worker logs for errors
- Verify worker URL is accessible
- Check IAM permissions for Cloud Tasks to invoke Cloud Run

## Updating Services

```bash
# Rebuild and deploy
cd services/worker
gcloud beta run deploy melaka-worker --source .

cd services/listener
gcloud beta run deploy melaka-listener --source .
```

## Cost Optimization

- **Listener**: `--min-instances=1` keeps one instance warm (required for real-time listeners)
- **Worker**: Scales to zero when idle
- **Cloud Tasks**: Pay per task (~$0.40 per million)

For lower costs during development:
```bash
# Allow listener to scale to zero (but will have cold starts)
gcloud run services update melaka-listener --min-instances=0 --region=us-central1
```
