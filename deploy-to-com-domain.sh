#!/bin/bash
# Deploy to tpsdhanvantariayurveda.com domain

echo "=================================================="
echo "🚀 DEPLOYING TO tpsdhanvantariayurveda.com"
echo "=================================================="
echo ""

SERVER="88.222.244.84"
USER="root"
PASSWORD="Yourkpo@202526"
NEW_DOMAIN="tpsdhanvantariayurveda.com"
WWW_DOMAIN="www.tpsdhanvantariayurveda.com"
OLD_DOMAIN="tpsdhanvantariayurveda.in"

echo "📋 Configuration:"
echo "   Server: $SERVER"
echo "   New Domain: $NEW_DOMAIN"
echo "   Old Domain: $OLD_DOMAIN"
echo ""

echo "📤 Step 1: Uploading files to server..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    dist/_worker.js dist/_routes.json dist/static/app.js \
    "$USER@$SERVER:/var/www/ayurveda/dist/"
echo "   ✅ Files uploaded"
echo ""

echo "🌐 Step 2: Configuring Nginx for new domain..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << ENDSSH
    echo "✅ Connected to server"
    echo ""
    
    # Create Nginx configuration for .com domain
    echo "📝 Creating Nginx config for $NEW_DOMAIN..."
    
    cat > /etc/nginx/sites-available/tpsdhanvantari.com << 'NGINX_EOF'
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name tpsdhanvantariayurveda.com www.tpsdhanvantariayurveda.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tpsdhanvantariayurveda.com www.tpsdhanvantariayurveda.com;

    # SSL configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/tpsdhanvantariayurveda.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tpsdhanvantariayurveda.com/privkey.pem;

    root /var/www/ayurveda;
    index index.html;

    # Application proxy
    location / {
        proxy_pass http://127.0.0.1:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backup API proxy
    location /backup-api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_EOF

    echo "   ✅ Nginx config created"
    echo ""
    
    # Enable the site
    echo "🔗 Enabling site..."
    ln -sf /etc/nginx/sites-available/tpsdhanvantari.com /etc/nginx/sites-enabled/
    echo "   ✅ Site enabled"
    echo ""
    
    # Test Nginx configuration
    echo "🧪 Testing Nginx configuration..."
    nginx -t
    if [ \$? -eq 0 ]; then
        echo "   ✅ Nginx config is valid"
        echo ""
        
        # Reload Nginx
        echo "🔄 Reloading Nginx..."
        systemctl reload nginx
        echo "   ✅ Nginx reloaded"
    else
        echo "   ❌ Nginx config test failed!"
        exit 1
    fi
    echo ""
    
    # Install Certbot if not already installed
    echo "📦 Checking Certbot installation..."
    if ! command -v certbot &> /dev/null; then
        echo "   Installing Certbot..."
        apt-get update -qq
        apt-get install -y certbot python3-certbot-nginx -qq
        echo "   ✅ Certbot installed"
    else
        echo "   ✅ Certbot already installed"
    fi
    echo ""
    
    # Get SSL certificate
    echo "🔒 Obtaining SSL certificate..."
    echo "   This will request Let's Encrypt certificate for:"
    echo "   - $NEW_DOMAIN"
    echo "   - $WWW_DOMAIN"
    echo ""
    
    certbot --nginx -d $NEW_DOMAIN -d $WWW_DOMAIN \
        --non-interactive --agree-tos \
        --email Parimi.prasad@gmail.com \
        --redirect
    
    if [ \$? -eq 0 ]; then
        echo "   ✅ SSL certificate obtained and configured"
    else
        echo "   ⚠️  SSL certificate request may have failed"
        echo "   You may need to run this manually:"
        echo "   sudo certbot --nginx -d $NEW_DOMAIN -d $WWW_DOMAIN"
    fi
    echo ""
    
    # Restart PM2 app
    echo "🔄 Restarting application..."
    pm2 restart ayurveda-clinic
    echo "   ✅ Application restarted"
    echo ""
    
    # Show final status
    echo "📊 Final Status:"
    pm2 list | grep -E "ayurveda-clinic|backup-api"
    echo ""
    
    # Test the site
    echo "🧪 Testing new domain..."
    HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3011/)
    echo "   Local test: HTTP \$HTTP_CODE"
    
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "=================================================="
    echo ""
    echo "🌐 New URLs:"
    echo "   • https://tpsdhanvantariayurveda.com/"
    echo "   • https://www.tpsdhanvantariayurveda.com/"
    echo ""
    echo "🔐 Login Credentials:"
    echo "   Email: admin@tpsdhanvantari.com"
    echo "   Password: 123456"
    echo ""
    echo "⏰ DNS Propagation:"
    echo "   • DNS changes may take 5-60 minutes to propagate"
    echo "   • SSL certificate should be active immediately"
    echo ""
    echo "✅ Old domain still works:"
    echo "   • https://tpsdhanvantariayurveda.in/"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Wait for DNS propagation (check: https://www.whatsmydns.net/)"
    echo "   2. Test new domain: https://tpsdhanvantariayurveda.com/"
    echo "   3. Verify SSL certificate is working"
    echo "   4. Test all features (login, backup, etc.)"
    echo ""
    echo "=================================================="
else
    echo ""
    echo "❌ Deployment failed. Please check the logs above."
    exit 1
fi
