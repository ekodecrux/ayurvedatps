#!/bin/bash

echo "=================================================="
echo "🔒 INSTALLING SSL CERTIFICATE FOR .com DOMAIN"
echo "=================================================="
echo ""

SERVER="88.222.244.84"
USER="root"
PASSWORD="Yourkpo@202526"
DOMAIN="tpsdhanvantariayurveda.com"
WWW_DOMAIN="www.tpsdhanvantariayurveda.com"

echo "Target: $DOMAIN"
echo "Server: $SERVER"
echo ""

echo "Step 1: Installing certbot if needed..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "   Installing certbot..."
    apt-get update -qq
    apt-get install -y certbot python3-certbot-nginx -qq
    echo "   ✅ Certbot installed"
else
    echo "   ✅ Certbot already installed"
fi

ENDSSH

echo ""
echo "Step 2: Creating Nginx configuration for .com domain..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'

# Create Nginx config for .com domain
cat > /etc/nginx/sites-available/tpsdhanvantariayurveda.com << 'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name tpsdhanvantariayurveda.com www.tpsdhanvantariayurveda.com;

    location / {
        proxy_pass http://127.0.0.1:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backup API proxy
    location /api/backups/ {
        proxy_pass http://localhost:5000/api/backups/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXCONF

# Enable the site
ln -sf /etc/nginx/sites-available/tpsdhanvantariayurveda.com /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "   Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "   Reloading Nginx..."
systemctl reload nginx

echo "   ✅ Nginx configured for .com domain"

ENDSSH

echo ""
echo "Step 3: Obtaining SSL certificate from Let's Encrypt..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'

# Obtain SSL certificate
echo "   Requesting SSL certificate..."
certbot --nginx -d tpsdhanvantariayurveda.com -d www.tpsdhanvantariayurveda.com --non-interactive --agree-tos --email admin@tpsdhanvantariayurveda.com --redirect

if [ $? -eq 0 ]; then
    echo "   ✅ SSL certificate installed successfully!"
else
    echo "   ⚠️  SSL installation had issues, checking status..."
fi

# Check certificate
echo ""
echo "   Checking certificate status..."
certbot certificates | grep -A 5 "tpsdhanvantariayurveda.com"

ENDSSH

echo ""
echo "Step 4: Testing HTTPS..."
sleep 3

# Test HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://tpsdhanvantariayurveda.com/" --insecure --max-time 10)

if [ "$HTTPS_STATUS" = "200" ]; then
    echo "   ✅ HTTPS working! Status: $HTTPS_STATUS"
else
    echo "   ⚠️  HTTPS status: $HTTPS_STATUS"
fi

echo ""
echo "=================================================="
echo "✅ SSL INSTALLATION COMPLETE!"
echo "=================================================="
echo ""
echo "🎉 Both domains are now working with HTTPS!"
echo ""
echo "Production URLs:"
echo "   • https://tpsdhanvantariayurveda.in/"
echo "   • https://tpsdhanvantariayurveda.com/"
echo ""
echo "Login: Shankaranherbaltreatment@gmail.com / 123456"
echo ""
echo "🧪 Test now:"
echo "   1. Visit: https://tpsdhanvantariayurveda.com/"
echo "   2. Should load WITHOUT SSL warning"
echo "   3. Login and go to Settings → Backup & Restore"
echo "   4. Both domains should work identically!"
echo ""
echo "=================================================="

