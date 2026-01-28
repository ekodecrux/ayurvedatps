#!/bin/bash

# ============================================================================
# DIRECT PRODUCTION DEPLOYMENT COMMAND
# Run this from your local machine (where you have SSH access to the server)
# ============================================================================

echo "=========================================================================="
echo "  TPS DHANVANTARI AYURVEDA - PRODUCTION DEPLOYMENT"
echo "=========================================================================="
echo ""
echo "📦 Deploying 6 features to both .in and .com sites"
echo ""
echo "⏱️  Estimated time: 3-5 minutes"
echo ""
echo "=========================================================================="
echo ""

# Execute deployment on production server
ssh root@88.222.244.84 << 'ENDSSH'

set -e

echo "✅ Connected to production server"
echo ""

# Navigate to project directory
echo "📁 Navigating to project directory..."
cd /var/www/ayurveda

# Show current commit
echo ""
echo "📊 Current commit:"
git log --oneline -1

# Pull latest changes
echo ""
echo "⬇️  Pulling latest code from GitHub..."
git fetch origin
git pull origin main

# Show new commit
echo ""
echo "📊 New commit:"
git log --oneline -1

# Check if package.json changed
echo ""
echo "🔍 Checking for dependency changes..."
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "📦 package.json changed - installing dependencies..."
    npm install
else
    echo "✅ No dependency changes"
fi

# Build project
echo ""
echo "🔨 Building project..."
npm run build

# Apply migrations
echo ""
echo "🗄️  Applying database migrations..."
npx wrangler d1 migrations list ayurveda-db --local || true
npx wrangler d1 migrations apply ayurveda-db --local

# Stop PM2
echo ""
echo "🛑 Stopping PM2 application..."
pm2 stop ayurveda-clinic || echo "App was not running"

# Clean port
echo ""
echo "🧹 Cleaning port 3001..."
fuser -k 3001/tcp 2>/dev/null || echo "Port already clean"
sleep 2

# Start PM2
echo ""
echo "🚀 Starting PM2 application..."
pm2 start ecosystem.config.cjs || pm2 restart ayurveda-clinic

# Wait for startup
echo ""
echo "⏳ Waiting for application to start..."
sleep 5

# Check PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 list

# Test local endpoint
echo ""
echo "🧪 Testing local endpoint..."
if curl -f -s http://localhost:3001 > /dev/null; then
    echo "✅ Local endpoint responding"
else
    echo "❌ Local endpoint not responding"
    echo "Checking logs..."
    pm2 logs ayurveda-clinic --nostream --lines 20
    exit 1
fi

# Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
nginx -t && systemctl reload nginx

# Save PM2
echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "=========================================================================="
echo "  ✅ DEPLOYMENT COMPLETED ON SERVER"
echo "=========================================================================="

ENDSSH

# Verify deployment from local machine
echo ""
echo "=========================================================================="
echo "  🧪 VERIFYING DEPLOYMENT"
echo "=========================================================================="
echo ""

# Test .in site
echo "Testing .in site..."
if curl -f -s https://tpsdhanvantariayurveda.in > /dev/null 2>&1; then
    echo "✅ https://tpsdhanvantariayurveda.in is responding"
else
    echo "❌ https://tpsdhanvantariayurveda.in is not responding"
fi

# Test .com site
echo ""
echo "Testing .com site..."
if curl -f -s https://tpsdhanvantariayurveda.com > /dev/null 2>&1; then
    echo "✅ https://tpsdhanvantariayurveda.com is responding"
else
    echo "❌ https://tpsdhanvantariayurveda.com is not responding"
fi

# Test API
echo ""
echo "Testing Medicine API..."
MEDICINE_COUNT=$(curl -s https://tpsdhanvantariayurveda.in/api/medicines 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
if [ "$MEDICINE_COUNT" -ge "15" ]; then
    echo "✅ Medicine API responding - $MEDICINE_COUNT medicines found"
else
    echo "⚠️  Medicine API may have issues - only $MEDICINE_COUNT medicines found"
fi

echo ""
echo "=========================================================================="
echo "  🎉 DEPLOYMENT COMPLETE!"
echo "=========================================================================="
echo ""
echo "📝 Next Steps:"
echo "   1. Clear browser cache (Ctrl+Shift+R)"
echo "   2. Login to https://tpsdhanvantariayurveda.in"
echo "   3. Test Medicine Management in Herbs & Roots"
echo "   4. Test Patient Disease functionality"
echo "   5. Test Backup & Restore page"
echo ""
echo "🔐 Login Credentials:"
echo "   Email: Shankaranherbaltreatment@gmail.com"
echo "   Password: 123456"
echo ""
echo "=========================================================================="
