#!/bin/bash

###############################################################################
# AUTOMATIC DEPLOYMENT TO HOSTINGER VPS
# AyurvedaTPS v2.5.1 - Critical Payment Fix
###############################################################################

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║         🚀 DEPLOYING TO HOSTINGER VPS - v2.5.1 CRITICAL FIX 🚀          ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

VPS_HOST="88.222.244.84"
VPS_USER="root"
VPS_PATH="/var/www/ayurveda"
APP_NAME="ayurveda-clinic"

echo "📋 Deployment Details:"
echo "   • VPS Host: $VPS_HOST"
echo "   • User: $VPS_USER"
echo "   • Path: $VPS_PATH"
echo "   • App: $APP_NAME"
echo ""

# Note: Since we're in sandbox, we'll output the commands that need to be run
# on the VPS server directly

echo "═══════════════════════════════════════════════════════════════════════════"
echo "🔧 DEPLOYMENT COMMANDS FOR VPS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Copy and paste these commands to deploy to your VPS:"
echo ""
echo "-------------------------------------------------------------------"
cat << 'VPS_COMMANDS'
# Connect to VPS
ssh root@88.222.244.84

# Navigate to app directory
cd /var/www/ayurveda

# Create backup
mkdir -p backups
cp dist/static/app.js backups/app.js.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"

# Pull latest code from GitHub
git pull origin main
echo "✅ Code updated"

# Rebuild application
npm run build
echo "✅ Build complete"

# Restart PM2 service
pm2 restart ayurveda-clinic
echo "✅ Service restarted"

# Check status
pm2 status
pm2 logs ayurveda-clinic --lines 10 --nostream

# Test application
curl -I http://localhost:3001

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Test URLs:"
echo "   • Direct IP: http://88.222.244.84:3001"
echo "   • Domain: https://tpsdhanvantariayurveda.in/"
echo ""
echo "✅ VERIFY THE FIX:"
echo "   1. Login to application"
echo "   2. Go to Herbs & Roots → Add New"
echo "   3. Add 4 medicines to ONE course"
echo "   4. Set payment: ₹10,000"
echo "   5. Click View/Print"
echo "   6. Verify: Total = ₹10,000 (NOT ₹40,000)"
echo ""
VPS_COMMANDS
echo "-------------------------------------------------------------------"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "✅ Deployment script ready!"
echo "═══════════════════════════════════════════════════════════════════════════"

