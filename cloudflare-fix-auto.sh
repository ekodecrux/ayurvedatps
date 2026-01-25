#!/bin/bash
# Automated Cloudflare Fix for .com domain

CLOUDFLARE_TOKEN="hC5CaTeYI57idQVgHFMzxGQqNohQWZZf_ME3HT8K"
DOMAIN="tpsdhanvantariayurveda.com"
TARGET_IP="88.222.244.84"

echo "=================================================="
echo "🚀 AUTOMATED CLOUDFLARE FIX"
echo "=================================================="
echo ""
echo "Domain: $DOMAIN"
echo "Target IP: $TARGET_IP"
echo ""

# Step 1: Get Zone ID
echo "📋 Step 1: Getting Zone ID..."
ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/v4/zones?name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json")

ZONE_ID=$(echo $ZONE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ZONE_ID" ]; then
    echo "   ❌ Failed to get Zone ID"
    echo "   Response: $ZONE_RESPONSE"
    exit 1
fi

echo "   ✅ Zone ID: $ZONE_ID"
echo ""

# Step 2: Purge All Cache
echo "🧹 Step 2: Purging all cache..."
PURGE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}')

PURGE_SUCCESS=$(echo $PURGE_RESPONSE | grep -o '"success":[^,]*' | cut -d':' -f2)

if [ "$PURGE_SUCCESS" = "true" ]; then
    echo "   ✅ Cache purged successfully!"
else
    echo "   ⚠️  Cache purge response: $PURGE_RESPONSE"
fi
echo ""

# Step 3: Get DNS Records
echo "🔍 Step 3: Getting DNS records..."
DNS_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/v4/zones/$ZONE_ID/dns_records?type=A" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json")

echo "$DNS_RESPONSE" | grep -o '"name":"[^"]*","type":"A","content":"[^"]*","proxied":[^,]*' | while read line; do
    RECORD_NAME=$(echo $line | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    RECORD_CONTENT=$(echo $line | grep -o '"content":"[^"]*' | cut -d'"' -f4)
    RECORD_PROXIED=$(echo $line | grep -o '"proxied":[^,]*' | cut -d':' -f2)
    
    echo "   Found: $RECORD_NAME → $RECORD_CONTENT (Proxied: $RECORD_PROXIED)"
done
echo ""

# Step 4: Get specific DNS record IDs and update to DNS-only
echo "🔧 Step 4: Updating DNS records to DNS-only mode..."

# Get all A records
DNS_RECORDS=$(curl -s -X GET "https://api.cloudflare.com/v4/zones/$ZONE_ID/dns_records?type=A" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json")

# Extract record IDs for @ and www
echo "$DNS_RECORDS" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for record in data.get('result', []):
    name = record.get('name', '')
    record_id = record.get('id', '')
    content = record.get('content', '')
    proxied = record.get('proxied', False)
    if 'tpsdhanvantariayurveda.com' in name:
        print(f'{record_id}|{name}|{content}|{proxied}')
" | while IFS='|' read RECORD_ID RECORD_NAME RECORD_CONTENT RECORD_PROXIED; do
    
    echo "   Updating: $RECORD_NAME"
    
    # Update to point to our server and disable proxy
    UPDATE_RESPONSE=$(curl -s -X PATCH "https://api.cloudflare.com/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
      -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$RECORD_NAME\",\"content\":\"$TARGET_IP\",\"ttl\":1,\"proxied\":false}")
    
    UPDATE_SUCCESS=$(echo $UPDATE_RESPONSE | grep -o '"success":[^,]*' | cut -d':' -f2)
    
    if [ "$UPDATE_SUCCESS" = "true" ]; then
        echo "   ✅ Updated: $RECORD_NAME → $TARGET_IP (DNS-only)"
    else
        echo "   ⚠️  Update response: $UPDATE_RESPONSE"
    fi
done

echo ""

# Step 5: Verify changes
echo "✅ Step 5: Verification..."
sleep 2

DNS_CHECK=$(curl -s -X GET "https://api.cloudflare.com/v4/zones/$ZONE_ID/dns_records?type=A" \
  -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
  -H "Content-Type: application/json")

echo "$DNS_CHECK" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('\n   Current DNS Configuration:')
for record in data.get('result', []):
    name = record.get('name', '')
    content = record.get('content', '')
    proxied = record.get('proxied', False)
    proxy_status = '🟠 Proxied' if proxied else '⚪ DNS-only'
    if 'tpsdhanvantariayurveda.com' in name:
        print(f'   {name} → {content} ({proxy_status})')
"

echo ""
echo "=================================================="
echo "✅ CLOUDFLARE FIX COMPLETE!"
echo "=================================================="
echo ""
echo "Changes made:"
echo "1. ✅ Purged all cache"
echo "2. ✅ Updated DNS to point to $TARGET_IP"
echo "3. ✅ Disabled Cloudflare proxy (DNS-only mode)"
echo ""
echo "⏰ Wait 5-10 minutes for DNS propagation"
echo ""
echo "🧪 Test after propagation:"
echo "   1. Visit: https://tpsdhanvantariayurveda.com/"
echo "   2. Press: Ctrl + Shift + R (hard refresh)"
echo "   3. Should show: NEW version!"
echo ""
echo "📋 Next step: Get SSL certificate"
echo "   ssh root@88.222.244.84"
echo "   sudo certbot --nginx -d tpsdhanvantariayurveda.com -d www.tpsdhanvantariayurveda.com"
echo ""
echo "=================================================="
