#!/bin/bash

CLOUDFLARE_TOKEN="hC5CaTeYI57idQVgHFMzxGQqNohQWZZf_ME3HT8K"

echo "Testing Cloudflare API Token..."
echo ""

# Test 1: Verify token
echo "1. Verifying token..."
TOKEN_VERIFY=$(curl -s -X GET "https://api.cloudflare.com/v4/user/tokens/verify" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json")

echo "$TOKEN_VERIFY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('   Success:', data.get('success'))
if data.get('success'):
    result = data.get('result', {})
    print('   Status:', result.get('status'))
else:
    errors = data.get('errors', [])
    for err in errors:
        print('   Error:', err.get('message'))
"
echo ""

# Test 2: List zones
echo "2. Listing zones..."
ZONES=$(curl -s -X GET "https://api.cloudflare.com/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json")

echo "$ZONES" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('   Success:', data.get('success'))
if data.get('success'):
    zones = data.get('result', [])
    print(f'   Total zones: {len(zones)}')
    for zone in zones:
        print(f'   - {zone.get(\"name\")} (ID: {zone.get(\"id\")})')
else:
    errors = data.get('errors', [])
    for err in errors:
        print('   Error Code:', err.get('code'), '- Message:', err.get('message'))
"
echo ""

# Test 3: Search for specific domain
echo "3. Searching for tpsdhanvantariayurveda.com..."
ZONE_SEARCH=$(curl -s -X GET "https://api.cloudflare.com/v4/zones?name=tpsdhanvantariayurveda.com" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json")

echo "$ZONE_SEARCH" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('   Success:', data.get('success'))
if data.get('success'):
    zones = data.get('result', [])
    print(f'   Found: {len(zones)} zone(s)')
    for zone in zones:
        print(f'   - Name: {zone.get(\"name\")}')
        print(f'   - ID: {zone.get(\"id\")}')
        print(f'   - Status: {zone.get(\"status\")}')
else:
    errors = data.get('errors', [])
    for err in errors:
        print('   Error Code:', err.get('code'), '- Message:', err.get('message'))
"
echo ""
echo "Full raw response for debugging:"
echo "$ZONE_SEARCH"
