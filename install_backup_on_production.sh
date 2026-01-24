#!/bin/bash
# Install Backup System on Production Server

echo "=================================================="
echo "🚀 INSTALLING BACKUP SYSTEM ON PRODUCTION"
echo "=================================================="
echo ""

SERVER="88.222.244.84"
USER="root"
PASSWORD="Yourkpo@202526"

echo "🔌 Connecting to production server..."
echo ""

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'ENDSSH'
    echo "✅ Connected to production server"
    echo ""
    
    cd /var/www/ayurveda
    
    echo "📋 Making scripts executable..."
    chmod +x setup_automated_backup.sh
    chmod +x automated_backup_server.py
    chmod +x daily_backup.py
    chmod +x restore_from_backup.py
    echo "   ✅ Scripts are executable"
    echo ""
    
    echo "🚀 Running installation..."
    echo ""
    ./setup_automated_backup.sh
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "✅ INSTALLATION COMPLETE!"
    echo "=================================================="
    echo ""
    echo "🎉 Backup system is now running on production!"
    echo ""
    echo "📋 Verification:"
    echo "   Visit: https://tpsdhanvantariayurveda.in/"
    echo "   Login: admin@tpsdhanvantari.com / 123456"
    echo "   Go to: Settings > Backup & Restore"
    echo ""
    echo "🧪 Test manually:"
    echo "   curl https://tpsdhanvantariayurveda.in/backup-api/health"
    echo ""
    echo "=================================================="
else
    echo ""
    echo "❌ Installation failed. Please check the logs."
    exit 1
fi
