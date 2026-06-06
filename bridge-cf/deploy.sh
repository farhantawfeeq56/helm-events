#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
FUNCTION_NAME="hermes-bridge"

echo "📦 Packaging Hermes Bridge Cloud Function..."

# Build TypeScript
npm run build

# Create deployment zip
zip -r function-source.zip \
  dist/ \
  package.json \
  package-lock.json

echo "🚀 Deploying to GCP Cloud Functions..."

gcloud functions deploy $FUNCTION_NAME \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=. \
  --entry-point=hermesBridge \
  --trigger-http \
  --allow-unauthenticated

echo "✅ Deployment complete!"
