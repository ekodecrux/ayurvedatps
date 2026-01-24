#!/bin/bash
# AUTOMATED BACKUP SERVER SETUP
# Installs and configures the fully automated backup/restore server

echo "=========================================="
echo "AUTOMATED BACKUP SERVER SETUP"
echo "=========================================="
echo ""

# Configuration
INSTALL_DIR="/var/www/ayurveda"
SERVICE_NAME="backup-api"
PORT=5000

echo "📁 Installation Directory: $INSTALL_DIR"
echo "🔌 API Port: $PORT"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing Python dependencies..."
pip3 install flask flask-cors >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ⚠️  Warning: pip3 install may have issues. Trying with sudo..."
    sudo pip3 install flask flask-cors
fi

# Step 2: Make script executable
echo "🔧 Step 2: Making scripts executable..."
chmod +x $INSTALL_DIR/automated_backup_server.py
chmod +x $INSTALL_DIR/daily_backup.py
chmod +x $INSTALL_DIR/restore_from_backup.py
echo "   ✅ Scripts executable"

# Step 3: Create PM2 ecosystem file for backup API
echo "📝 Step 3: Creating PM2 configuration..."
cat > $INSTALL_DIR/ecosystem-backup-api.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'backup-api',
      script: 'python3',
      args: 'automated_backup_server.py',
      cwd: '/var/www/ayurveda',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/www/ayurveda/logs/backup-api-error.log',
      out_file: '/var/www/ayurveda/logs/backup-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}
EOF
echo "   ✅ PM2 config created"

# Step 4: Create logs directory
echo "📁 Step 4: Creating logs directory..."
mkdir -p $INSTALL_DIR/logs
echo "   ✅ Logs directory ready"

# Step 5: Start backup API with PM2
echo "🚀 Step 5: Starting Backup API server..."
cd $INSTALL_DIR
pm2 delete backup-api 2>/dev/null || true
pm2 start ecosystem-backup-api.config.cjs
pm2 save
echo "   ✅ Backup API started on port $PORT"

# Step 6: Configure Nginx proxy (if nginx installed)
if command -v nginx &> /dev/null; then
    echo "🌐 Step 6: Configuring Nginx proxy..."
    
    # Add backup API proxy to nginx config
    NGINX_CONF="/etc/nginx/sites-available/ayurveda"
    if [ -f "$NGINX_CONF" ]; then
        # Check if backup API location already exists
        if ! grep -q "location /backup-api" "$NGINX_CONF"; then
            # Add before the closing brace
            sudo sed -i '/^}$/i \    # Backup API proxy\n    location /backup-api/ {\n        proxy_pass http://localhost:5000/api/;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection '\''upgrade'\'';\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n    }\n' "$NGINX_CONF"
            
            sudo nginx -t && sudo systemctl reload nginx
            echo "   ✅ Nginx configured for backup API"
        else
            echo "   ℹ️  Nginx already configured"
        fi
    else
        echo "   ⚠️  Nginx config not found at $NGINX_CONF"
    fi
else
    echo "   ℹ️  Nginx not installed, skipping proxy setup"
fi

# Step 7: Test backup API
echo "🧪 Step 7: Testing Backup API..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Backup API is responding (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  Backup API may not be ready (HTTP $HTTP_CODE)"
fi

# Step 8: Setup daily backup cron (if not already set)
echo "⏰ Step 8: Checking daily backup cron..."
if ! crontab -l 2>/dev/null | grep -q "daily_backup.py"; then
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/python3 $INSTALL_DIR/daily_backup.py >> $INSTALL_DIR/logs/daily_backup.log 2>&1") | crontab -
    echo "   ✅ Daily backup cron added (2 AM)"
else
    echo "   ℹ️  Daily backup cron already exists"
fi

echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "📊 Service Status:"
pm2 list | grep -E "backup-api|ayurveda-clinic"
echo ""
echo "🔗 Access Points:"
echo "   • Backup API: http://localhost:5000/health"
echo "   • Via Nginx: https://tpsdhanvantariayurveda.in/backup-api/"
echo "   • Web UI: Settings > Backup & Restore"
echo ""
echo "📝 Management Commands:"
echo "   • List backups: curl http://localhost:5000/api/backups/list"
echo "   • Create backup: curl -X POST http://localhost:5000/api/backups/create"
echo "   • PM2 logs: pm2 logs backup-api"
echo "   • PM2 restart: pm2 restart backup-api"
echo "   • PM2 stop: pm2 stop backup-api"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • Update frontend BACKUP_API URL to:"
echo "     const BACKUP_API = 'https://tpsdhanvantariayurveda.in/backup-api';"
echo "   • Or use: const BACKUP_API = 'http://localhost:5000/api';"
echo ""
echo "=========================================="
