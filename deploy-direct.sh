#!/bin/bash

# Cloudflare Direct Upload Script
# This script uploads dist/ folder directly to Cloudflare Pages via API

PROJECT_NAME="ayurveda-clinic"
ACCOUNT_ID="df062639da601bcc1a52d074c1a2be12"

echo "🚀 Cloudflare Pages Direct Upload"
echo "=================================="
echo ""

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set"
    echo ""
    echo "Please set your API token:"
    echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
    echo "Or run with token:"
    echo "  CLOUDFLARE_API_TOKEN='your-token' ./deploy-direct.sh"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ folder not found"
    echo ""
    echo "Please build the project first:"
    echo "  npm run build"
    exit 1
fi

echo "📦 Building project..."
npm run build

echo ""
echo "📤 Uploading to Cloudflare Pages..."
echo "  Project: $PROJECT_NAME"
echo "  Account: $ACCOUNT_ID"
echo ""

# Use wrangler to deploy
npx wrangler pages deploy dist \
  --project-name "$PROJECT_NAME" \
  --branch main \
  --commit-dirty=true

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your PWA is live at:"
    echo "   https://$PROJECT_NAME.pages.dev"
    echo "   https://$PROJECT_NAME.pages.dev/pwa"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Troubleshooting:"
    echo "1. Verify your API token has 'Cloudflare Pages - Edit' permission"
    echo "2. Check project name is correct: $PROJECT_NAME"
    echo "3. Ensure account ID is correct: $ACCOUNT_ID"
    echo ""
fi
