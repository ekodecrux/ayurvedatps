#!/bin/bash
# Get SSL certificate for .com domain

SERVER="88.222.244.84"
USER="root"
PASSWORD="Yourkpo@202526"
NEW_DOMAIN="tpsdhanvantariayurveda.com"
WWW_DOMAIN="www.tpsdhanvantariayurveda.com"

echo "=================================================="
echo "🔒 OBTAINING SSL CERTIFICATE"
echo "=================================================="
echo ""

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'ENDSSH'
    echo "✅ Connected to server"
    echo ""
    
    # Kill any running certbot processes
    echo "🔧 Checking for running certbot processes..."
    pkill -9 certbot 2>/dev/null || true
    sleep 2
    echo "   ✅ Cleared any stuck certbot processes"
    echo ""
    
    # Get SSL certificate
    echo "🔒 Obtaining SSL certificate..."
    certbot --nginx \
        -d tpsdhanvantariayurveda.com \
        -d www.tpsdhanvantariayurveda.com \
        --non-interactive --agree-tos \
        --email Parimi.prasad@gmail.com \
        --redirect
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "   ✅ SSL certificate obtained!"
        echo ""
        
        # Reload nginx
        echo "🔄 Reloading Nginx..."
        systemctl reload nginx
        echo "   ✅ Nginx reloaded"
        echo ""
        
        # Test HTTPS
        echo "🧪 Testing HTTPS..."
        curl -k -s -o /dev/null -w "   HTTPS Status: %{http_code}\n" https://tpsdhanvantariayurveda.com/
        echo ""
    else
        echo ""
        echo "   ⚠️  SSL certificate failed"
        echo ""
        echo "📋 Manual command to run:"
        echo "   sudo certbot --nginx -d tpsdhanvantariayurveda.com -d www.tpsdhanvantariayurveda.com"
    fi
    
ENDSSH

echo ""
echo "=================================================="
echo "✅ SSL SETUP COMPLETE"
echo "=================================================="
echo ""
echo "🌐 Test URLs:"
echo "   • https://tpsdhanvantariayurveda.com/"
echo "   • https://www.tpsdhanvantariayurveda.com/"
echo "   • https://tpsdhanvantariayurveda.in/ (old domain)"
echo ""
echo "=================================================="
