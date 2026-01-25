#!/bin/bash
echo "=================================================="
echo "🧪 TESTING BOTH DOMAINS"
echo "=================================================="
echo ""

echo "1️⃣ Testing .in domain (tpsdhanvantariayurveda.in):"
echo "   URL: https://tpsdhanvantariayurveda.in/"
HTTP_IN=$(curl -s -o /dev/null -w "%{http_code}" https://tpsdhanvantariayurveda.in/)
echo "   Status: HTTP $HTTP_IN"
if [ "$HTTP_IN" = "200" ]; then
    echo "   ✅ WORKING"
else
    echo "   ❌ ERROR"
fi
echo ""

echo "2️⃣ Testing .com domain (tpsdhanvantariayurveda.com):"
echo "   URL: https://tpsdhanvantariayurveda.com/"
HTTP_COM=$(curl -s -o /dev/null -w "%{http_code}" https://tpsdhanvantariayurveda.com/)
echo "   Status: HTTP $HTTP_COM"
if [ "$HTTP_COM" = "200" ]; then
    echo "   ✅ WORKING"
else
    echo "   ❌ ERROR"
fi
echo ""

echo "3️⃣ Testing API endpoint (.in):"
API_IN=$(curl -s https://tpsdhanvantariayurveda.in/api/backups/health | grep -o "healthy" | head -1)
if [ "$API_IN" = "healthy" ]; then
    echo "   ✅ API WORKING on .in domain"
else
    echo "   ⚠️  API response: $API_IN"
fi
echo ""

echo "4️⃣ Testing API endpoint (.com):"
API_COM=$(curl -s https://tpsdhanvantariayurveda.com/api/backups/health | grep -o "healthy" | head -1)
if [ "$API_COM" = "healthy" ]; then
    echo "   ✅ API WORKING on .com domain"
else
    echo "   ⚠️  API response: $API_COM"
fi
echo ""

echo "=================================================="
echo "📊 SUMMARY"
echo "=================================================="
echo ""
if [ "$HTTP_IN" = "200" ] && [ "$HTTP_COM" = "200" ]; then
    echo "✅ BOTH DOMAINS ARE WORKING!"
    echo ""
    echo "🌐 Production URLs:"
    echo "   • https://tpsdhanvantariayurveda.in/"
    echo "   • https://tpsdhanvantariayurveda.com/"
    echo ""
    echo "🔐 Login (both domains):"
    echo "   Email: admin@tpsdhanvantari.com"
    echo "   Password: 123456"
    echo ""
    echo "✨ Both domains serve the same application!"
else
    echo "⚠️  One or more domains not working"
    echo "   .in domain: $HTTP_IN"
    echo "   .com domain: $HTTP_COM"
fi
echo ""
echo "=================================================="
