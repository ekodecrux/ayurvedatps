#!/bin/bash
# Complete Rebuild and Deployment Script for TPS Dhanvantari Ayurveda

echo "========================================"
echo "🚀 COMPLETE REBUILD - TPS Dhanvantari"
echo "========================================"
echo ""

echo "Step 1: Stop all services"
echo "----------------------------------------"
pm2 delete ayurveda-clinic 2>/dev/null || echo "Service not found, continuing..."
fuser -k 3001/tcp 2>/dev/null || echo "Port 3001 already free"
sleep 2

echo ""
echo "Step 2: Backup and clean old files"
echo "----------------------------------------"
cd /var/www/ayurveda
mkdir -p backups
cp -r dist backups/dist.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

echo ""
echo "Step 3: Download fresh TPS Dhanvantari files from GitHub"
echo "----------------------------------------"
echo "Downloading _worker.js (main app)..."
curl -L -f -o dist/_worker.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to download _worker.js"
    exit 1
fi

echo "Downloading app.js (frontend)..."
curl -L -f -o dist/static/app.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to download app.js"
    exit 1
fi

echo "Downloading styles.css..."
curl -L -f -o dist/static/styles.css https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css
if [ $? -ne 0 ]; then
    echo "❌ Failed to download styles.css"
    exit 1
fi

echo ""
echo "Step 4: Verify downloaded files"
echo "----------------------------------------"
echo "File sizes:"
ls -lh dist/_worker.js dist/static/app.js dist/static/styles.css

echo ""
echo "Checking content of _worker.js:"
if head -100 dist/_worker.js | grep -qi "dhanvantari\|ayurveda\|tps"; then
    echo "✅ CORRECT: TPS Dhanvantari Ayurveda app detected!"
else
    echo "❌ ERROR: File content doesn't match expected app!"
    echo "First 30 lines:"
    head -30 dist/_worker.js
    exit 1
fi

echo ""
echo "Step 5: Check PM2 ecosystem config"
echo "----------------------------------------"
if [ -f ecosystem.config.cjs ]; then
    echo "✅ ecosystem.config.cjs exists"
    cat ecosystem.config.cjs
else
    echo "⚠️ ecosystem.config.cjs not found, creating one..."
    cat > ecosystem.config.cjs << 'EOFCONFIG'
module.exports = {
  apps: [
    {
      name: 'ayurveda-clinic',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3001',
      cwd: '/var/www/ayurveda',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}
EOFCONFIG
    echo "✅ Created ecosystem.config.cjs"
fi

echo ""
echo "Step 6: Start PM2 service"
echo "----------------------------------------"
pm2 start ecosystem.config.cjs
sleep 5

echo ""
echo "Step 7: Check PM2 status"
echo "----------------------------------------"
pm2 status ayurveda-clinic

echo ""
echo "Step 8: Wait for service to start..."
echo "----------------------------------------"
sleep 5

echo ""
echo "Step 9: Test localhost"
echo "----------------------------------------"
echo "Testing http://localhost:3001 ..."
RESPONSE=$(curl -s http://localhost:3001/ | head -50)
if echo "$RESPONSE" | grep -qi "dhanvantari\|ayurveda"; then
    echo "✅ SUCCESS: TPS Dhanvantari Ayurveda is running!"
else
    echo "❌ FAILED: Wrong app or not responding"
    echo "Response received:"
    echo "$RESPONSE"
    echo ""
    echo "PM2 Logs:"
    pm2 logs ayurveda-clinic --nostream --lines 30
    exit 1
fi

echo ""
echo "Step 10: Check nginx configuration"
echo "----------------------------------------"
nginx -t
if [ $? -ne 0 ]; then
    echo "⚠️ Nginx config has errors, attempting to fix..."
    rm -f /etc/nginx/sites-enabled/demo.myschoolchatbot.in
    nginx -t
fi

systemctl reload nginx

echo ""
echo "========================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================"
echo ""
echo "🌐 Your TPS Dhanvantari Ayurveda app should now be live at:"
echo "  • https://tpsdhanvantariayurveda.in"
echo "  • http://88.222.244.84:3001"
echo ""
echo "📱 Next steps:"
echo "  1. Clear browser cache (Ctrl+Shift+Delete)"
echo "  2. Visit https://tpsdhanvantariayurveda.in"
echo "  3. You should see TPS DHANVANTARI AYURVEDA (not MySchool)"
echo "  4. Login with: Shankaranherbaltreatment@gmail.com / 123456"
echo ""
echo "🔍 If still showing MySchool:"
echo "  1. Hard refresh: Ctrl+Shift+R"
echo "  2. Try incognito/private window"
echo "  3. Check PM2 logs: pm2 logs ayurveda-clinic"
echo ""
