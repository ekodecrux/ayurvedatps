#!/bin/bash

echo "🧪 Testing Login Flow for TPS Dhanvantari Ayurveda PWA"
echo "=================================================="
echo ""

# Step 1: Login
echo "1️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -c /tmp/test-cookies.txt -X POST \
  https://tpsdhanvantariayurveda.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Shankaranherbaltreatment@gmail.com","password":"123456"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq .
echo ""

# Step 2: Check if session cookie was set
echo "2️⃣ Checking Session Cookie..."
if grep -q "session_token" /tmp/test-cookies.txt; then
    echo "✅ Session cookie was set successfully!"
    cat /tmp/test-cookies.txt | grep session_token
else
    echo "❌ Session cookie was NOT set"
fi
echo ""

# Step 3: Test authentication check
echo "3️⃣ Testing Authentication Check (/api/auth/me)..."
AUTH_RESPONSE=$(curl -s -b /tmp/test-cookies.txt \
  https://tpsdhanvantariayurveda.com/api/auth/me)

echo "Auth Check Response:"
echo "$AUTH_RESPONSE" | jq .
echo ""

# Step 4: Verify authenticated status
if echo "$AUTH_RESPONSE" | jq -e '.authenticated == true' > /dev/null; then
    echo "✅ User is authenticated!"
    echo ""
    echo "🎉 LOGIN FLOW TEST PASSED!"
    echo "You can now login at: https://tpsdhanvantariayurveda.com/login"
else
    echo "❌ User is NOT authenticated"
    echo "❌ LOGIN FLOW TEST FAILED"
fi

# Cleanup
rm -f /tmp/test-cookies.txt
