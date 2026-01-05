#!/bin/bash

# VPS Deployment Script - Delta Changes Only
# Version: 2.5.0
# Date: January 5, 2026

set -e

VPS_HOST="88.222.244.84"
VPS_USER="root"
VPS_PATH="/var/www/ayurveda"
LOCAL_BUILD="./dist"

echo "🚀 Starting Delta Deployment to VPS..."
echo "=================================="

# Check if built files exist
if [ ! -d "$LOCAL_BUILD" ]; then
    echo "❌ Build directory not found. Running npm run build..."
    npm run build
fi

echo ""
echo "📦 Files to be deployed:"
echo "  - dist/static/app.js (Payment module fixes)"
echo "  - Documentation files"
echo ""

# Backup current version on VPS
echo "📋 Step 1: Creating backup on VPS..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    cd /var/www/ayurveda
    mkdir -p backups
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    cp -r dist/static/app.js backups/$BACKUP_NAME.app.js || true
    echo "✅ Backup created: backups/$BACKUP_NAME.app.js"
ENDSSH

# Deploy only changed files (delta)
echo ""
echo "📤 Step 2: Deploying changes..."
scp dist/static/app.js $VPS_USER@$VPS_HOST:$VPS_PATH/dist/static/
scp PAYMENT_MODULE_FIXES_v2.5.0.md $VPS_USER@$VPS_HOST:$VPS_PATH/

echo ""
echo "🔄 Step 3: Restarting application..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    cd /var/www/ayurveda
    pm2 restart ayurveda-clinic
    echo "✅ Application restarted"
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
ENDSSH

echo ""
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Application URL: http://88.222.244.84:3001"
echo "🌐 Domain URL: https://tpsdhanvantariayurveda.in/"
echo ""
echo "📝 Changes Deployed:"
echo "  ✅ Enhanced balance calculation"
echo "  ✅ Overpayment detection"
echo "  ✅ Payment amount validation"
echo "  ✅ Improved payment status display"
echo "  ✅ Required field validation"
echo ""

