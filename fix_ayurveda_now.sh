#!/bin/bash
echo "🚨 EMERGENCY FIX - Ayurveda Clinic"
echo "=================================="
echo ""

# Navigate to ayurveda directory
cd /var/www/ayurveda

echo "1. Stopping ayurveda-clinic..."
pm2 stop ayurveda-clinic
sleep 2

echo ""
echo "2. Killing any process on port 3011..."
fuser -k 3011/tcp 2>/dev/null || echo "Port already free"
sleep 2

echo ""
echo "3. Starting ayurveda-clinic..."
pm2 start ayurveda-clinic
sleep 5

echo ""
echo "4. Checking status..."
pm2 list | grep ayurveda

echo ""
echo "5. Testing local port 3011..."
curl -s http://127.0.0.1:3011 | head -50 | grep -i "title"

echo ""
echo "6. Reloading Nginx..."
systemctl reload nginx

echo ""
echo "7. Testing production URL..."
curl -s https://tpsdhanvantariayurveda.in/ | head -100 | grep -i "title"

echo ""
echo "8. Checking logs for errors..."
pm2 logs ayurveda-clinic --nostream --lines 20 | tail -20

echo ""
echo "=================================="
echo "✅ Fix Complete!"
echo "=================================="
echo ""
echo "If you see 'TPS DHANVANTARI' above, it's WORKING!"
echo "If you see '502 Bad Gateway' or 'MySchool', run:"
echo "  cd /var/www/ayurveda && npm run build && pm2 restart ayurveda-clinic"
