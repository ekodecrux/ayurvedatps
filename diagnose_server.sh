#!/bin/bash
# Deep Diagnosis Script for TPS Dhanvantari Deployment Issue

echo "========================================"
echo "🔍 DEEP DIAGNOSIS - Finding the Problem"
echo "========================================"
echo ""

echo "1️⃣ Checking what PM2 is actually running..."
echo "----------------------------------------"
pm2 describe ayurveda-clinic

echo ""
echo "2️⃣ Checking the actual file being served..."
echo "----------------------------------------"
echo "First 50 lines of _worker.js:"
head -50 /var/www/ayurveda/dist/_worker.js

echo ""
echo "3️⃣ Checking directory structure..."
echo "----------------------------------------"
ls -la /var/www/ayurveda/
echo ""
ls -la /var/www/ayurveda/dist/
echo ""
ls -la /var/www/ayurveda/dist/static/

echo ""
echo "4️⃣ Checking PM2 ecosystem config..."
echo "----------------------------------------"
cat /var/www/ayurveda/ecosystem.config.cjs

echo ""
echo "5️⃣ Checking if there are multiple ayurveda folders..."
echo "----------------------------------------"
find /var/www -name "ayurveda*" -type d

echo ""
echo "6️⃣ Checking all PM2 processes..."
echo "----------------------------------------"
pm2 list

echo ""
echo "7️⃣ Testing localhost:3001..."
echo "----------------------------------------"
curl -s http://localhost:3001/ | head -30

echo ""
echo "8️⃣ Checking nginx configuration..."
echo "----------------------------------------"
cat /etc/nginx/sites-available/tpsdhanvantari

echo ""
echo "========================================"
echo "✅ Diagnosis Complete!"
echo "========================================"
