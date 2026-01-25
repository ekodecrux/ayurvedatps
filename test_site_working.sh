#!/bin/bash

echo "🔍 TESTING RESTORED SITE"
echo "========================"
echo ""

# Test 1: Stats API
echo "1. Testing Dashboard Stats API..."
STATS=$(curl -s "https://tpsdhanvantariayurveda.com/api/stats")
if echo "$STATS" | grep -q "success.*true"; then
    echo "   ✅ Stats API working"
    echo "   Data: $STATS"
else
    echo "   ❌ Stats API failed"
fi
echo ""

# Test 2: Backup API
echo "2. Testing Backup API..."
BACKUPS=$(curl -s "https://tpsdhanvantariayurveda.com/api/backups/list")
if echo "$BACKUPS" | grep -q "success.*true"; then
    echo "   ✅ Backup API working"
    COUNT=$(echo "$BACKUPS" | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "   Backups available: $COUNT"
else
    echo "   ❌ Backup API failed"
fi
echo ""

# Test 3: Home page
echo "3. Testing Homepage..."
HOME=$(curl -s -o /dev/null -w "%{http_code}" "https://tpsdhanvantariayurveda.com/")
if [ "$HOME" = "200" ]; then
    echo "   ✅ Homepage loads (HTTP $HOME)"
else
    echo "   ❌ Homepage failed (HTTP $HOME)"
fi
echo ""

# Test 4: App.js version
echo "4. Checking app.js version..."
VERSION=$(curl -s "https://tpsdhanvantariayurveda.com/" | grep -o 'app.js?v=[^"]*' | head -1)
echo "   Version: $VERSION"
echo ""

echo "========================"
echo "✅ SITE TEST COMPLETE"
echo "========================"
