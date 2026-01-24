#!/bin/bash
# Fix Flask Installation and Restart Backup API

echo "=================================================="
echo "🔧 FIXING BACKUP API ON PRODUCTION"
echo "=================================================="
echo ""

SERVER="88.222.244.84"
USER="root"
PASSWORD="Yourkpo@202526"

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'ENDSSH'
    echo "✅ Connected to production"
    echo ""
    
    cd /var/www/ayurveda
    
    echo "📦 Step 1: Installing Flask via apt..."
    sudo apt-get install -y python3-flask python3-flask-cors -qq
    echo "   ✅ Flask installed"
    echo ""
    
    echo "📦 Step 2: Stopping crashed backup-api..."
    pm2 delete backup-api 2>/dev/null || true
    echo "   ✅ Stopped"
    echo ""
    
    echo "🚀 Step 3: Starting backup-api with PM2..."
    pm2 start ecosystem-backup-api.config.cjs
    pm2 save
    echo "   ✅ Started"
    echo ""
    
    echo "⏳ Step 4: Waiting for API to be ready..."
    sleep 5
    echo ""
    
    echo "🧪 Step 5: Testing backup API..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Backup API is healthy (HTTP $HTTP_CODE)"
        echo ""
        echo "   Response:"
        curl -s http://localhost:5000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:5000/health
    else
        echo "   ⚠️  API returned HTTP $HTTP_CODE"
        echo "   Checking logs..."
        pm2 logs backup-api --nostream --lines 20
    fi
    echo ""
    
    echo "📊 PM2 Status:"
    pm2 list | grep -E "backup-api|ayurveda-clinic"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "✅ BACKUP API IS NOW RUNNING!"
    echo "=================================================="
    echo ""
    echo "🌐 Test URLs:"
    echo "   • http://localhost:5000/health (on server)"
    echo "   • https://tpsdhanvantariayurveda.in/backup-api/health"
    echo ""
    echo "📋 Next: Login to website and test in Settings"
    echo "=================================================="
fi
