#!/bin/bash

# Automated deployment to Hostinger VPS
set -e

echo "🚀 Deploying TPS Dhanvantari to Hostinger..."
echo ""

SERVER_IP="88.222.244.84"
SERVER_USER="root"
SERVER_PASS="Yourkpo@202526"
DEPLOY_PATH="/var/www/ayurveda"
PORT=3001

# Step 1: Create directory on server
echo "📁 Step 1: Creating deployment directory on server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_PATH"

# Step 2: Upload deployment package
echo "📤 Step 2: Uploading files to server..."
cd /home/user/webapp/deploy-package
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r * $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

# Step 3: Check if Node.js is installed, install if needed
echo "🔍 Step 3: Checking Node.js installation..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "  📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "  ✅ Node.js already installed: $(node --version)"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "  📦 Installing PM2..."
    npm install -g pm2
else
    echo "  ✅ PM2 already installed: $(pm2 --version)"
fi
ENDSSH

# Step 4: Install dependencies and start application
echo "🚀 Step 4: Installing dependencies and starting application..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << ENDSSH
cd $DEPLOY_PATH

# Install Node.js dependencies
echo "  📦 Installing npm packages..."
npm install --production 2>&1 | grep -v "npm WARN"

# Stop existing process if running
echo "  🔄 Stopping existing application..."
pm2 delete ayurveda-clinic 2>/dev/null || echo "  ℹ No existing process to stop"

# Start the application
echo "  ▶️  Starting application..."
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root | tail -1 | bash 2>/dev/null || true

# Show status
echo ""
echo "✅ Deployment Complete!"
echo ""
pm2 status
ENDSSH

echo ""
echo "=========================================="
echo "🎉 Deployment Successful!"
echo "=========================================="
echo ""
echo "📍 Access URLs:"
echo "  • Direct IP: http://88.222.244.84:3001"
echo "  • Domain: http://ayurveda.myschoolct.com:3001 (configure DNS)"
echo ""
echo "🔐 Default Login:"
echo "  Email: admin@tpsdhanvantari.com"
echo "  Password: admin123"
echo ""
echo "📊 Management Commands (run on server):"
echo "  pm2 status              - Check application status"
echo "  pm2 logs ayurveda-clinic - View application logs"
echo "  pm2 restart ayurveda-clinic - Restart application"
echo "  pm2 stop ayurveda-clinic    - Stop application"
echo ""
echo "🌐 To remove port from URL, configure Nginx reverse proxy"
echo "   (see DEPLOY_README.md in deployment package)"
echo ""
