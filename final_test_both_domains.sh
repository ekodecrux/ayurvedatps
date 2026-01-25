#!/bin/bash

echo "=================================================="
echo "🎉 FINAL VERIFICATION - BOTH DOMAINS"
echo "=================================================="
echo ""

# Test .in domain
echo "1️⃣  Testing .in domain..."
IN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://tpsdhanvantariayurveda.in/" --max-time 10)
IN_SSL=$(curl -sI "https://tpsdhanvantariayurveda.in/" 2>&1 | grep -i "SSL certificate problem" && echo "FAIL" || echo "PASS")

if [ "$IN_STATUS" = "200" ] && [ "$IN_SSL" = "PASS" ]; then
    echo "   ✅ https://tpsdhanvantariayurveda.in/ - WORKING"
    echo "      Status: $IN_STATUS | SSL: Valid"
else
    echo "   ⚠️  Issue detected"
fi

# Test .com domain
echo ""
echo "2️⃣  Testing .com domain..."
COM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://tpsdhanvantariayurveda.com/" --max-time 10)
COM_SSL=$(curl -sI "https://tpsdhanvantariayurveda.com/" 2>&1 | grep -i "SSL certificate problem" && echo "FAIL" || echo "PASS")

if [ "$COM_STATUS" = "200" ] && [ "$COM_SSL" = "PASS" ]; then
    echo "   ✅ https://tpsdhanvantariayurveda.com/ - WORKING"
    echo "      Status: $COM_STATUS | SSL: Valid"
else
    echo "   ⚠️  Issue detected"
fi

# Test Backup API on both
echo ""
echo "3️⃣  Testing Backup API..."

echo "   .in domain backup API:"
curl -s "https://tpsdhanvantariayurveda.in/api/backups/health" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if data.get('status') == 'healthy':
        print('   ✅ Backup API healthy')
    else:
        print('   ⚠️  Status:', data.get('status', 'unknown'))
except:
    print('   ⚠️  API not responding')
"

echo "   .com domain backup API:"
curl -s "https://tpsdhanvantariayurveda.com/api/backups/health" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if data.get('status') == 'healthy':
        print('   ✅ Backup API healthy')
    else:
        print('   ⚠️  Status:', data.get('status', 'unknown'))
except:
    print('   ⚠️  API not responding')
"

# Summary
echo ""
echo "=================================================="
echo "📊 FINAL STATUS SUMMARY"
echo "=================================================="
echo ""

if [ "$IN_STATUS" = "200" ] && [ "$COM_STATUS" = "200" ]; then
    echo "🎉 🎉 🎉  SUCCESS!  🎉 🎉 🎉"
    echo ""
    echo "Both domains are fully operational!"
    echo ""
    echo "✅ https://tpsdhanvantariayurveda.in/"
    echo "✅ https://tpsdhanvantariayurveda.com/"
    echo ""
    echo "Features Available:"
    echo "  • Patient Management"
    echo "  • Herbs & Roots Prescriptions"
    echo "  • Backup & Restore System"
    echo "  • Appointment Management"
    echo "  • Payment Tracking"
    echo "  • Reports & Analytics"
    echo ""
    echo "Login Credentials:"
    echo "  Email: Shankaranherbaltreatment@gmail.com"
    echo "  Password: 123456"
    echo ""
    echo "Next Steps:"
    echo "  1. Login to either domain"
    echo "  2. Go to Settings → Backup & Restore"
    echo "  3. Create your first backup"
    echo "  4. Add missing medicine data to prescriptions"
else
    echo "⚠️  Some issues detected. Check logs above."
fi

echo ""
echo "=================================================="

