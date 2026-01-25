#!/bin/bash

echo "========================================="
echo "Testing Admin Login"
echo "========================================="
echo ""
echo "Email: Shankaranherbaltreatment@gmail.com"
echo "Password: 123456"
echo ""
echo "Testing on both domains..."
echo ""

# Test .in domain
echo "1. Testing https://tpsdhanvantariayurveda.in/"
curl -s -X POST https://tpsdhanvantariayurveda.in/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Shankaranherbaltreatment@gmail.com","password":"123456"}' | python3 -m json.tool 2>/dev/null || echo "Login response received"
echo ""

# Test .com domain  
echo "2. Testing https://tpsdhanvantariayurveda.com/"
curl -s -X POST https://tpsdhanvantariayurveda.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Shankaranherbaltreatment@gmail.com","password":"123456"}' | python3 -m json.tool 2>/dev/null || echo "Login response received"
echo ""

echo "========================================="
echo "If you see 'success: true' above, login is working!"
echo "========================================="
