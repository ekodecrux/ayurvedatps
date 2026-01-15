#!/bin/bash

# =================================================================
# AUTOMATED PORT CONFLICT FIX
# This script fixes the issue where tpsdhanvantariayurveda.in
# is showing MySchool chatbot instead of Ayurveda clinic system
# =================================================================

HOST="88.222.244.84"
USER="root"
PASSWORD="Yourkpo@202425"

echo "🔍 TPS Dhanvantari Ayurveda - Port Conflict Fix"
echo "=================================================="
echo ""
echo "This script will:"
echo "1. Connect to your VPS at $HOST"
echo "2. Stop conflicting processes"
echo "3. Start Ayurveda clinic on port 3001"
echo "4. Configure Nginx to proxy correctly"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Create a heredoc script to send to the server
cat << 'REMOTESCRIPT' | ssh -o StrictHostKeyChecking=no $USER@$HOST bash

echo "🔍 DIAGNOSING PORT CONFLICT..."
echo "=================================================="

# Check current PM2 processes
echo ""
echo "📊 Current PM2 Processes:"
pm2 list

# Check which ports are in use
echo ""
echo "📊 Ports Currently in Use:"
netstat -tulpn 2>/dev/null | grep -E ':(3000|3001|8080|8081)' || ss -tulpn | grep -E ':(3000|3001|8080|8081)'

# Test current endpoints
echo ""
echo "📊 Testing Port 3000:"
curl -s http://localhost:3000/ 2>/dev/null | head -20 | grep -i "title\|MySchool\|Dhanvantari" || echo "No response on port 3000"

echo ""
echo "📊 Testing Port 3001:"
curl -s http://localhost:3001/ 2>/dev/null | head -20 | grep -i "title\|MySchool\|Dhanvantari" || echo "No response on port 3001"

echo ""
echo "=================================================="
echo "🔧 APPLYING FIX..."
echo "=================================================="

# Stop all PM2 processes
echo ""
echo "🛑 Step 1: Stopping all PM2 processes..."
pm2 stop all
sleep 2

# Kill processes on ports
echo ""
echo "🔪 Step 2: Killing processes on ports 3000 and 3001..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

# Navigate to project
echo ""
echo "📁 Step 3: Navigating to Ayurveda project..."
cd /var/www/ayurveda || { echo "❌ ERROR: /var/www/ayurveda not found!"; exit 1; }
echo "Current directory: $(pwd)"

# Check files
echo ""
echo "📋 Step 4: Checking required files..."
if [ ! -f server.js ]; then
    echo "❌ ERROR: server.js not found!"
    exit 1
fi
if [ ! -f dist/_worker.js ]; then
    echo "❌ ERROR: dist/_worker.js not found!"
    echo "Attempting to build..."
    npm run build || { echo "❌ Build failed!"; exit 1; }
fi
echo "✅ All required files found"

# Build project
echo ""
echo "🔨 Step 5: Building project (if needed)..."
npm run build 2>&1 | tail -5

# Start server on port 3001
echo ""
echo "🚀 Step 6: Starting Ayurveda server on PORT 3001..."
PORT=3001 pm2 start server.js --name ayurveda-clinic --update-env
sleep 3

# Check PM2 status
echo ""
echo "📊 Step 7: PM2 Status:"
pm2 list

# Test local server
echo ""
echo "🧪 Step 8: Testing local server on port 3001..."
sleep 2
RESPONSE=$(curl -s http://localhost:3001/ 2>/dev/null | head -30)
echo "$RESPONSE"

if echo "$RESPONSE" | grep -qi "Dhanvantari\|Ayurveda"; then
    echo ""
    echo "✅ CORRECT APP DETECTED on port 3001!"
else
    echo ""
    echo "⚠️  WARNING: Could not confirm correct app"
fi

# Backup and update Nginx config
echo ""
echo "📝 Step 9: Updating Nginx configuration..."
if [ -f /etc/nginx/sites-available/tpsdhanvantariayurveda ]; then
    cp /etc/nginx/sites-available/tpsdhanvantariayurveda /etc/nginx/sites-available/tpsdhanvantariayurveda.backup
    sed -i 's|proxy_pass http://127.0.0.1:[0-9]*;|proxy_pass http://127.0.0.1:3001;|g' /etc/nginx/sites-available/tpsdhanvantariayurveda
    echo "✅ Nginx config updated"
else
    echo "⚠️  WARNING: Nginx config not found at expected location"
fi

# Test and reload Nginx
echo ""
echo "🧪 Step 10: Testing Nginx configuration..."
if nginx -t 2>&1; then
    echo ""
    echo "🔄 Step 11: Reloading Nginx..."
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo ""
    echo "❌ Nginx config test failed!"
    if [ -f /etc/nginx/sites-available/tpsdhanvantariayurveda.backup ]; then
        cp /etc/nginx/sites-available/tpsdhanvantariayurveda.backup /etc/nginx/sites-available/tpsdhanvantariayurveda
        echo "Backup restored"
    fi
fi

# Final verification
echo ""
echo "=================================================="
echo "✅ FIX APPLIED!"
echo "=================================================="

echo ""
echo "📊 Final PM2 Status:"
pm2 status

echo ""
echo "🧪 Testing Public Endpoint..."
sleep 3
PUBLIC_RESPONSE=$(curl -s https://tpsdhanvantariayurveda.in/ 2>/dev/null | head -30)

if echo "$PUBLIC_RESPONSE" | grep -qi "Dhanvantari\|Ayurveda"; then
    echo "✅ PUBLIC SITE IS CORRECT!"
else
    echo "⚠️  Public site might still show wrong app"
    echo "Clear your browser cache with Ctrl+Shift+R"
fi

echo ""
echo "=================================================="
echo "🎯 NEXT STEPS:"
echo "=================================================="
echo "1. Clear browser cache: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "2. Visit: https://tpsdhanvantariayurveda.in"
echo "3. Should see: TPS DHANVANTARI AYURVEDA"
echo "4. Login: Shankaranherbaltreatment@gmail.com / 123456"
echo ""
echo "✅ FIX COMPLETE!"
echo "=================================================="

REMOTESCRIPT

echo ""
echo "✅ Script execution completed!"
echo ""
echo "If you're still seeing the wrong app:"
echo "1. Clear your browser cache completely"
echo "2. Try in incognito/private mode"
echo "3. Wait 1-2 minutes for DNS/CDN propagation"
