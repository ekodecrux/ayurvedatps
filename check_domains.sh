#!/bin/bash
echo "=================================================="
echo "🔍 CHECKING DOMAIN CONFIGURATIONS"
echo "=================================================="
echo ""

echo "1️⃣  Checking .in domain:"
echo "   URL: https://tpsdhanvantariayurveda.in/"
curl -s https://tpsdhanvantariayurveda.in/ | grep -o 'app\.js[^"]*' | head -1
echo ""

echo "2️⃣  Checking .com domain:"
echo "   URL: https://tpsdhanvantariayurveda.com/"
curl -s https://tpsdhanvantariayurveda.com/ | grep -o 'app\.js[^"]*' | head -1
echo ""

echo "3️⃣  Testing backup API on .in:"
curl -s https://tpsdhanvantariayurveda.in/api/backups/health | python3 -m json.tool 2>/dev/null | head -5
echo ""

echo "4️⃣  Testing backup API on .com:"
curl -s https://tpsdhanvantariayurveda.com/api/backups/health | python3 -m json.tool 2>/dev/null | head -5
echo ""

echo "=================================================="
