#!/bin/bash

# TPS Dhanvantari - Hostinger Deployment Script
# This script will deploy the application to your Hostinger VPS

set -e

echo "🚀 TPS Dhanvantari - Hostinger Deployment"
echo "=========================================="

# Configuration
SERVER_IP="88.222.244.84"
SERVER_USER="root"
DEPLOY_PATH="/var/www/ayurveda"
PORT="3001"  # Using port 3001 (8080 is already in use)

echo "📦 Step 1: Preparing deployment package..."
cd /home/user/webapp

# Create deployment directory structure
mkdir -p deploy-package
mkdir -p deploy-package/dist
mkdir -p deploy-package/migrations

# Copy necessary files
echo "  ✓ Copying server files..."
cp server.js deploy-package/
cp package.json deploy-package/
cp package-lock.json deploy-package/ 2>/dev/null || true
cp seed.sql deploy-package/

# Copy dist directory (built application)
echo "  ✓ Copying dist directory..."
cp -r dist/* deploy-package/dist/

# Copy migrations
echo "  ✓ Copying database migrations..."
cp migrations/*.sql deploy-package/migrations/

# Create ecosystem config for PM2
echo "  ✓ Creating PM2 configuration..."
cat > deploy-package/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ayurveda-clinic',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Create start script
echo "  ✓ Creating start script..."
cat > deploy-package/start.sh << 'EOF'
#!/bin/bash
cd /var/www/ayurveda
npm install --production
pm2 delete ayurveda-clinic 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash
echo "✅ Application started on port 3001"
echo "🌐 Access at: http://88.222.244.84:3001"
EOF

chmod +x deploy-package/start.sh

# Create stop script
cat > deploy-package/stop.sh << 'EOF'
#!/bin/bash
pm2 stop ayurveda-clinic
pm2 delete ayurveda-clinic
EOF

chmod +x deploy-package/stop.sh

# Create README for deployment
cat > deploy-package/DEPLOY_README.md << 'EOF'
# TPS Dhanvantari - Hostinger Deployment Instructions

## Quick Deploy

### 1. Upload to Server
```bash
scp -r /home/user/webapp/deploy-package/* root@88.222.244.84:/var/www/ayurveda/
```

### 2. SSH into Server
```bash
ssh root@88.222.244.84
```

### 3. Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

### 4. Start Application
```bash
cd /var/www/ayurveda
bash start.sh
```

## Access URLs

- **Application**: http://88.222.244.84:3001
- **Domain**: http://ayurveda.myschoolct.com:3001 (after DNS configuration)

## Nginx Configuration (Optional - for domain)

If you want to use http://ayurveda.myschoolct.com without port:

```nginx
server {
    listen 80;
    server_name ayurveda.myschoolct.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save to `/etc/nginx/sites-available/ayurveda` and enable:
```bash
ln -s /etc/nginx/sites-available/ayurveda /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Commands

- **Start**: `pm2 start ayurveda-clinic`
- **Stop**: `pm2 stop ayurveda-clinic`
- **Restart**: `pm2 restart ayurveda-clinic`
- **Logs**: `pm2 logs ayurveda-clinic`
- **Status**: `pm2 status`

## Database

- Location: `/var/www/ayurveda/ayurveda.db`
- Automatic migrations applied on first start
- Default admin: admin@tpsdhanvantari.com / admin123

## Troubleshooting

### Port already in use
```bash
lsof -i :3001
kill -9 <PID>
```

### Permission issues
```bash
chown -R root:root /var/www/ayurveda
chmod -R 755 /var/www/ayurveda
```
EOF

echo ""
echo "✅ Deployment package ready at: /home/user/webapp/deploy-package"
echo ""
echo "📤 Next Steps:"
echo "1. Create directory on server:"
echo "   ssh root@88.222.244.84 'mkdir -p /var/www/ayurveda'"
echo ""
echo "2. Upload files:"
echo "   scp -r /home/user/webapp/deploy-package/* root@88.222.244.84:/var/www/ayurveda/"
echo ""
echo "3. Install Node.js on server (if not installed):"
echo "   ssh root@88.222.244.84 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs && npm install -g pm2'"
echo ""
echo "4. Start the application:"
echo "   ssh root@88.222.244.84 'cd /var/www/ayurveda && bash start.sh'"
echo ""
echo "5. Access the application:"
echo "   http://88.222.244.84:3001"
echo ""
