#!/bin/bash
# Upload Backup System to Production
# This script uploads the backup system files to production server

echo "=================================================="
echo "📤 UPLOADING BACKUP SYSTEM TO PRODUCTION"
echo "=================================================="
echo ""

SERVER="88.222.244.84"
USER="root"
PASSWORD="Yourkpo@202526"
REMOTE_DIR="/var/www/ayurveda"

echo "📁 Target Server: $SERVER"
echo "📂 Remote Directory: $REMOTE_DIR"
echo ""

# Install sshpass if not already installed
if ! command -v sshpass &> /dev/null; then
    echo "📦 Installing sshpass..."
    sudo apt-get update -qq && sudo apt-get install -y sshpass -qq
    echo "✅ sshpass installed"
fi

echo "📤 Step 1: Uploading automated_backup_server.py..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    automated_backup_server.py "$USER@$SERVER:$REMOTE_DIR/"
if [ $? -eq 0 ]; then
    echo "   ✅ automated_backup_server.py uploaded"
else
    echo "   ❌ Failed to upload automated_backup_server.py"
    exit 1
fi

echo "📤 Step 2: Uploading setup_automated_backup.sh..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    setup_automated_backup.sh "$USER@$SERVER:$REMOTE_DIR/"
if [ $? -eq 0 ]; then
    echo "   ✅ setup_automated_backup.sh uploaded"
else
    echo "   ❌ Failed to upload setup_automated_backup.sh"
    exit 1
fi

echo "📤 Step 3: Uploading daily_backup.py..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    daily_backup.py "$USER@$SERVER:$REMOTE_DIR/"
if [ $? -eq 0 ]; then
    echo "   ✅ daily_backup.py uploaded"
else
    echo "   ❌ Failed to upload daily_backup.py"
    exit 1
fi

echo "📤 Step 4: Uploading restore_from_backup.py..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
    restore_from_backup.py "$USER@$SERVER:$REMOTE_DIR/"
if [ $? -eq 0 ]; then
    echo "   ✅ restore_from_backup.py uploaded"
else
    echo "   ❌ Failed to upload restore_from_backup.py"
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ ALL FILES UPLOADED SUCCESSFULLY!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. SSH to production server:"
echo "   ssh root@88.222.244.84"
echo ""
echo "2. Navigate to directory:"
echo "   cd /var/www/ayurveda"
echo ""
echo "3. Run the setup script:"
echo "   chmod +x setup_automated_backup.sh"
echo "   ./setup_automated_backup.sh"
echo ""
echo "4. Test the backup API:"
echo "   curl http://localhost:5000/health"
echo ""
echo "=================================================="
