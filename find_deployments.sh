#!/bin/bash
# Find All Deployments Script

echo "🔍 Searching for ALL deployments on server..."
echo ""

echo "1. All PM2 processes:"
pm2 list

echo ""
echo "2. All processes on port 3001:"
netstat -tulpn | grep 3001

echo ""
echo "3. All wrangler processes:"
ps aux | grep wrangler | grep -v grep

echo ""
echo "4. All Node.js processes:"
ps aux | grep node | grep -v grep | head -10

echo ""
echo "5. Search for MySchool files:"
find /var/www -name "*myschool*" -o -name "*chatbot*" 2>/dev/null

echo ""
echo "6. Search for Ayurveda/Dhanvantari files:"
find /var/www -name "*ayurveda*" -o -name "*dhanvantari*" 2>/dev/null

echo ""
echo "7. Check all nginx sites:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "8. Check what's actually at /var/www/ayurveda:"
ls -la /var/www/ayurveda/ 2>/dev/null || echo "Directory not found"

echo ""
echo "9. Check the _worker.js file content:"
head -30 /var/www/ayurveda/dist/_worker.js 2>/dev/null || echo "File not found"

echo ""
echo "10. Direct curl test to localhost:3001:"
curl -s http://localhost:3001/ 2>/dev/null | head -20 || echo "Connection failed"
