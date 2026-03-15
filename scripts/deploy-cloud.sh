#!/bin/bash
# Deploy Melaka Cloud services to GCP

set -e

PROJECT_ID="melaka-cloud"
REGION="us-central1"

echo "=== Deploying Melaka Cloud Services ==="

# 1. Create Cloud Tasks queue (if not exists)
echo "Creating Cloud Tasks queue..."
gcloud tasks queues create melaka-translations \
  --location=$REGION \
  --max-concurrent-dispatches=10 \
  --max-attempts=3 \
  --min-backoff=10s \
  --max-backoff=300s \
  --project=$PROJECT_ID 2>/dev/null || echo "Queue already exists"

# 2. Build and deploy Worker service
echo "Deploying Worker service..."
cd services/worker
gcloud run deploy melaka-worker \
  --source . \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=$GEMINI_API_KEY" \
  --memory=512Mi \
  --timeout=300s \
  --project=$PROJECT_ID

WORKER_URL=$(gcloud run services describe melaka-worker --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)
echo "Worker URL: $WORKER_URL"

# 3. Build and deploy Listener service
echo "Deploying Listener service..."
cd ../listener
gcloud run deploy melaka-listener \
  --source . \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars="FIREBASE_PROJECT_ID=$PROJECT_ID,FIREBASE_SERVICE_ACCOUNT_JSON=$FIREBASE_SERVICE_ACCOUNT_JSON,ENCRYPTION_KEY=$ENCRYPTION_KEY,CLOUD_TASKS_PROJECT_ID=$PROJECT_ID,CLOUD_TASKS_LOCATION=$REGION,CLOUD_TASKS_QUEUE_NAME=melaka-translations,CLOUD_TASKS_SERVICE_URL=$WORKER_URL,GEMINI_API_KEY=$GEMINI_API_KEY" \
  --memory=1Gi \
  --min-instances=1 \
  --timeout=3600s \
  --project=$PROJECT_ID

LISTENER_URL=$(gcloud run services describe melaka-listener --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)
echo "Listener URL: $LISTENER_URL"

echo ""
echo "=== Deployment Complete ==="
echo "Worker:   $WORKER_URL"
echo "Listener: $LISTENER_URL"
echo ""
echo "Update your .env.local:"
echo "CLOUD_TASKS_SERVICE_URL=$WORKER_URL"
