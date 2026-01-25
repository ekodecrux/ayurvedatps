#!/bin/bash
echo "=== FIXING ROUTING ISSUE - AYURVEDA APP ==="
echo ""

echo "PROBLEM: Both .in and .com domains routing to MySchool chatbot"
echo "SOLUTION: Fix PM2 apps and Nginx configuration"
echo ""

echo "1. Checking current PM2 status..."
pm2 list

echo ""
echo "2. Finding which app is on port 3011..."
lsof -i :3011 || netstat -tlnp | grep 3011

echo ""
echo "3. Checking Nginx configuration..."
cat /etc/nginx/sites-available/tpsdhanvantariayurveda.in | grep -A 10 "location /"

echo ""
echo "4. Stopping MySchool chatbot if it's on wrong port..."
pm2 stop myschool-chatbot 2>/dev/null || true
pm2 stop demo-myschoolchatbot 2>/dev/null || true

echo ""
echo "5. Restarting Ayurveda clinic app..."
cd /var/www/ayurveda
pm2 restart ayurveda-clinic

echo ""
echo "6. Verifying apps are on correct ports..."
sleep 3
curl -s http://localhost:3011 | head -20

echo ""
echo "7. Testing production URLs..."
echo "Testing .in domain..."
curl -s https://tpsdhanvantariayurveda.in/ | grep -o "<title>.*</title>"

echo ""
echo "Testing .com domain..."
curl -s https://tpsdhanvantariayurveda.com/ | grep -o "<title>.*</title>"

echo ""
echo "=== FIX COMPLETE ==="
echo ""
echo "Expected title: 'TPS DHANVANTARI AYURVEDA - Management System'"
echo "If still showing 'MySchool', check Nginx proxy_pass configuration"
