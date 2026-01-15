#!/bin/bash

# Fix Port Conflict - TPS Dhanvantari Ayurveda vs demo.myschoolchatbot.in
# This script diagnoses and fixes the issue where wrong app is being served

echo "🔍 Diagnosing Port Conflict Issue..."
echo "=================================="
echo ""

# Connect to VPS and run diagnostics
ssh -o StrictHostKeyChecking=no root@88.222.244.84 << 'ENDSSH'

echo "📊 Step 1: Checking PM2 Processes"
echo "----------------------------------"
pm2 list
echo ""

echo "📊 Step 2: Checking Nginx Configuration"
echo "----------------------------------"
echo "Checking tpsdhanvantariayurveda.in config:"
if [ -f /etc/nginx/sites-available/tpsdhanvantariayurveda ]; then
  cat /etc/nginx/sites-available/tpsdhanvantariayurveda | grep -A5 "server_name\|proxy_pass"
else
  echo "❌ Config file not found!"
  ls /etc/nginx/sites-available/ | grep -i tps
fi
echo ""

echo "Checking demo.myschoolchatbot.in config:"
if [ -f /etc/nginx/sites-available/demo.myschoolchatbot.in ]; then
  cat /etc/nginx/sites-available/demo.myschoolchatbot.in | grep -A5 "server_name\|proxy_pass"
else
  echo "❌ Config file not found!"
  ls /etc/nginx/sites-available/ | grep -i myschool
fi
echo ""

echo "📊 Step 3: Checking Which Ports Are in Use"
echo "----------------------------------"
netstat -tulpn | grep -E ':(3000|3001|8080|8081)' || ss -tulpn | grep -E ':(3000|3001|8080|8081)'
echo ""

echo "📊 Step 4: Checking Application Directories"
echo "----------------------------------"
echo "TPS Ayurveda directory:"
ls -la /var/www/ayurveda/ 2>/dev/null || echo "❌ Directory not found"
echo ""
echo "MySchool directory (if exists):"
ls -la /var/www/myschool* 2>/dev/null || echo "✅ No myschool directory found"
echo ""

echo "📊 Step 5: Testing Localhost Endpoints"
echo "----------------------------------"
echo "Testing port 3000:"
curl -s http://localhost:3000/ | head -20 | grep -i "title\|h1\|MySchool\|Dhanvantari\|Ayurveda"
echo ""
echo "Testing port 3001:"
curl -s http://localhost:3001/ | head -20 | grep -i "title\|h1\|MySchool\|Dhanvantari\|Ayurveda"
echo ""

echo "=================================="
echo "✅ Diagnostics Complete!"
echo ""
echo "🔧 Now applying fix..."
echo "=================================="
echo ""

# Stop all PM2 processes to avoid conflicts
echo "🛑 Stopping all PM2 processes..."
pm2 stop all
sleep 2

# Kill any process on port 3000 and 3001
echo "🔪 Killing processes on ports 3000 and 3001..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

# Check if /var/www/ayurveda exists
if [ -d "/var/www/ayurveda" ]; then
  cd /var/www/ayurveda
  
  echo "📦 Current directory: $(pwd)"
  
  # Build the project first
  echo "🔨 Building project..."
  npm run build 2>&1 | tail -10
  
  # Update server to use port 3001 (matching the server.js)
  echo "🔧 Starting Ayurveda server on port 3001..."
  
  # Start using server.js (which uses port 3001)
  pm2 start server.js --name ayurveda-clinic
  sleep 3
  
  # Check if server started successfully
  pm2 list
  
  echo ""
  echo "🧪 Testing local server..."
  curl -s http://localhost:3001/ | head -30 | grep -i "Dhanvantari\|Ayurveda" && echo "✅ CORRECT APP DETECTED!" || echo "⚠️ Still wrong app"
  
else
  echo "❌ /var/www/ayurveda directory not found!"
  echo "Available directories in /var/www/:"
  ls -la /var/www/
fi

echo ""
echo "📝 Checking Nginx configuration..."

# Fix Nginx configuration for tpsdhanvantariayurveda.in
if [ -f /etc/nginx/sites-available/tpsdhanvantariayurveda ]; then
  echo "✏️ Updating Nginx to proxy to port 3001..."
  
  # Backup original
  cp /etc/nginx/sites-available/tpsdhanvantariayurveda /etc/nginx/sites-available/tpsdhanvantariayurveda.backup
  
  # Update proxy_pass to port 3001
  sed -i 's|proxy_pass http://[^;]*|proxy_pass http://127.0.0.1:3001|g' /etc/nginx/sites-available/tpsdhanvantariayurveda
  
  # Test nginx config
  nginx -t
  
  # Reload nginx
  if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
  else
    echo "❌ Nginx config test failed! Restoring backup..."
    cp /etc/nginx/sites-available/tpsdhanvantariayurveda.backup /etc/nginx/sites-available/tpsdhanvantariayurveda
  fi
fi

echo ""
echo "=================================="
echo "✅ FIX APPLIED!"
echo "=================================="
echo ""
echo "📊 Final Status:"
pm2 status
echo ""
echo "🧪 Testing endpoints:"
echo "Local test:"
curl -s http://localhost:3001/ | grep -o '<title>[^<]*' || echo "Could not detect title"
echo ""
echo "Public test (wait 5 seconds for propagation):"
sleep 5
curl -s https://tpsdhanvantariayurveda.in/ | grep -o '<title>[^<]*' || echo "Could not detect title"

echo ""
echo "=================================="
echo "🎯 NEXT STEPS:"
echo "=================================="
echo "1. Clear browser cache: Ctrl+Shift+R"
echo "2. Visit: https://tpsdhanvantariayurveda.in"
echo "3. Should see: TPS DHANVANTARI AYURVEDA"
echo "4. Login with: Shankaranherbaltreatment@gmail.com / 123456"
echo ""

ENDSSH

echo ""
echo "✅ Script completed!"
echo ""
echo "If issue persists, check the output above for errors."
