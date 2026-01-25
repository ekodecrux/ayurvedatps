#!/bin/bash

echo "=================================================="
echo "🔍 VERIFYING .com DOMAIN FIX"
echo "=================================================="
echo ""

# Test 1: Check if domain loads
echo "1️⃣  Testing domain load..."
COM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://tpsdhanvantariayurveda.com/" --max-time 10)
echo "   Status Code: $COM_STATUS"

if [ "$COM_STATUS" = "200" ]; then
    echo "   ✅ Domain is reachable"
else
    echo "   ⚠️  Domain returned status $COM_STATUS"
fi
echo ""

# Test 2: Check HTML content for version
echo "2️⃣  Checking content version..."
CONTENT=$(curl -s "https://tpsdhanvantariayurveda.com/" | head -50)

# Check for app.js version
APP_JS_VERSION=$(echo "$CONTENT" | grep -o 'app.js?v=[0-9.]*' | head -1)
echo "   App.js version: $APP_JS_VERSION"

# Check if Backup & Restore features are present in HTML
if echo "$CONTENT" | grep -q "Backup"; then
    echo "   ✅ 'Backup' text found in HTML"
else
    echo "   ⚠️  'Backup' text NOT found in HTML"
fi
echo ""

# Test 3: Check if using Cloudflare proxy
echo "3️⃣  Checking server configuration..."
HEADERS=$(curl -s -I "https://tpsdhanvantariayurveda.com/" | head -20)

if echo "$HEADERS" | grep -qi "cloudflare"; then
    echo "   🟠 Still using Cloudflare proxy"
    CF_RAY=$(echo "$HEADERS" | grep -i "cf-ray" | cut -d: -f2 | xargs)
    echo "   CF-Ray: $CF_RAY"
else
    echo "   ⚪ Direct connection (no Cloudflare proxy)"
fi

if echo "$HEADERS" | grep -qi "server.*nginx"; then
    echo "   ✅ Nginx server detected (good!)"
fi
echo ""

# Test 4: Check DNS resolution
echo "4️⃣  Checking DNS resolution..."
DNS_IP=$(getent hosts tpsdhanvantariayurveda.com | awk '{ print $1 }' | head -1)
echo "   Resolved IP: $DNS_IP"

if [ "$DNS_IP" = "88.222.244.84" ]; then
    echo "   ✅ DNS points directly to our server"
elif [ -z "$DNS_IP" ]; then
    echo "   ⚠️  DNS resolution failed (still propagating?)"
else
    echo "   🟠 DNS points to: $DNS_IP (Cloudflare IP)"
    echo "   Note: This means proxy is still active or DNS hasn't propagated"
fi
echo ""

# Test 5: Get actual page content
echo "5️⃣  Fetching page content sample..."
PAGE_CONTENT=$(curl -s "https://tpsdhanvantariayurveda.com/" | grep -o '<title>[^<]*' | sed 's/<title>//')
echo "   Page title: $PAGE_CONTENT"

# Check for specific new features
if curl -s "https://tpsdhanvantariayurveda.com/" | grep -q "app.js?v=3"; then
    echo "   ✅ Version 3.x detected in HTML"
elif curl -s "https://tpsdhanvantariayurveda.com/" | grep -q "app.js?v=2"; then
    echo "   ⚠️  Version 2.x detected - OLD VERSION"
else
    echo "   ❓ Version unclear"
fi
echo ""

# Test 6: Compare with .in domain
echo "6️⃣  Comparing with .in domain..."
IN_VERSION=$(curl -s "https://tpsdhanvantariayurveda.in/" | grep -o 'app.js?v=[0-9.]*' | head -1)
COM_VERSION=$(curl -s "https://tpsdhanvantariayurveda.com/" | grep -o 'app.js?v=[0-9.]*' | head -1)

echo "   .in  domain: $IN_VERSION"
echo "   .com domain: $COM_VERSION"

if [ "$IN_VERSION" = "$COM_VERSION" ]; then
    echo "   ✅ VERSIONS MATCH! Both domains serving same content"
else
    echo "   ⚠️  VERSIONS DIFFER - .com may still be cached"
fi
echo ""

# Test 7: Check backup API endpoint
echo "7️⃣  Testing Backup API..."
BACKUP_API_COM=$(curl -s "https://tpsdhanvantariayurveda.com/api/backups/health" --max-time 5)
if echo "$BACKUP_API_COM" | grep -q "healthy"; then
    echo "   ✅ Backup API working on .com domain"
else
    echo "   ⚠️  Backup API not responding on .com domain"
    echo "   Response: ${BACKUP_API_COM:0:100}"
fi
echo ""

# Final verdict
echo "=================================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================================="
echo ""

ISSUES=0

if [ "$COM_STATUS" != "200" ]; then
    echo "❌ Domain not loading properly"
    ISSUES=$((ISSUES + 1))
fi

if [ "$IN_VERSION" != "$COM_VERSION" ]; then
    echo "⚠️  Version mismatch - may need cache clear or DNS propagation"
    ISSUES=$((ISSUES + 1))
fi

if echo "$HEADERS" | grep -qi "cloudflare"; then
    echo "🟠 Cloudflare proxy still active (orange cloud)"
    echo "   → You may need to turn it to gray (DNS-only) in Cloudflare dashboard"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ ✅ ✅ SUCCESS! .com DOMAIN FULLY FIXED! ✅ ✅ ✅"
    echo ""
    echo "🎉 Both domains are now working identically!"
    echo ""
    echo "Production URLs:"
    echo "   • https://tpsdhanvantariayurveda.in/"
    echo "   • https://tpsdhanvantariayurveda.com/"
    echo ""
    echo "Login: Shankaranherbaltreatment@gmail.com / 123456"
else
    echo "⏳ Fix in progress - $ISSUES issue(s) remaining"
    echo ""
    echo "Common reasons:"
    echo "   1. DNS propagation (wait 5-10 minutes)"
    echo "   2. Browser cache (press Ctrl+Shift+R)"
    echo "   3. Cloudflare proxy still active (check dashboard)"
fi

echo ""
echo "=================================================="
