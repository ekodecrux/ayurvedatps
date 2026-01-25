#!/bin/bash
echo "🚨 EMERGENCY FIX - Wrong App Showing!"
echo "======================================"
echo ""

# Step 1: Check what's running on port 3011
echo "1. Checking port 3011 (Ayurveda app)..."
lsof -i :3011 | head -5 || echo "Nothing on 3011!"

# Step 2: Check PM2 status
echo ""
echo "2. PM2 Status..."
pm2 list

# Step 3: Check Nginx config
echo ""
echo "3. Checking Nginx config for tpsdhanvantariayurveda.in..."
cat /etc/nginx/sites-enabled/tpsdhanvantariayurveda.in 2>/dev/null | grep -A 10 "location /"

# Step 4: Test local port
echo ""
echo "4. Testing localhost:3011..."
curl -s http://localhost:3011 | head -50 | grep -i "title"

# Step 5: Restart ayurveda-clinic
echo ""
echo "5. Restarting ayurveda-clinic..."
pm2 restart ayurveda-clinic

# Wait a bit
sleep 3

# Step 6: Test again
echo ""
echo "6. Testing after restart..."
curl -s http://localhost:3011 | head -50 | grep -i "title"

# Step 7: Reload Nginx
echo ""
echo "7. Reloading Nginx..."
systemctl reload nginx

echo ""
echo "✅ Fix attempt complete!"
echo "Testing production URL..."
curl -s https://tpsdhanvantariayurveda.in/ | head -100 | grep -i "title"
EOF
