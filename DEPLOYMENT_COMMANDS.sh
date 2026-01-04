#!/bin/bash
# TPS Dhanvantari Ayurveda - Deployment Commands
# Execute these commands on the production server (88.222.244.84)

echo "🚀 Starting TPS Dhanvantari Ayurveda Deployment"
echo "================================================"

# Navigate to project directory
cd /var/www/ayurveda

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p dist/static backups

# Backup existing files
echo "📦 Backing up current files..."
if [ -f dist/_worker.js ]; then
  cp dist/_worker.js backups/_worker.js.$(date +%Y%m%d-%H%M%S)
  echo "✅ Backup created"
fi

# Download correct files from GitHub
echo "⬇️ Downloading files from GitHub..."
curl -L -o dist/_worker.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js
curl -L -o dist/_routes.json https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_routes.json
curl -L -o dist/static/app.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js
curl -L -o dist/static/styles.css https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css

echo ""
echo "📊 Downloaded file sizes:"
ls -lh dist/_worker.js dist/static/app.js dist/static/styles.css dist/_routes.json

# Verify content
echo ""
echo "🔍 Verifying content..."
if head -50 dist/_worker.js | grep -i "dhanvantari\|ayurveda" > /dev/null; then
  echo "✅ CORRECT: TPS Dhanvantari Ayurveda app detected!"
else
  echo "⚠️ WARNING: File might still be wrong!"
  echo "First 100 characters of _worker.js:"
  head -c 100 dist/_worker.js
fi

# Create ecosystem.config.cjs if missing
echo ""
if [ ! -f ecosystem.config.cjs ]; then
  echo "📝 Creating PM2 configuration..."
  cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ayurveda-clinic',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3001',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
EOF
  echo "✅ PM2 config created"
else
  echo "✅ PM2 config already exists"
fi

# Stop existing services
echo ""
echo "🛑 Stopping existing services..."
pm2 delete ayurveda-clinic 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

# Start service
echo ""
echo "🚀 Starting TPS Dhanvantari Ayurveda..."
pm2 start ecosystem.config.cjs
pm2 save

# Wait for service to start
echo ""
echo "⏳ Waiting for service to start..."
sleep 5

# Check PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 status ayurveda-clinic

# Test service
echo ""
echo "🧪 Testing service..."
if curl -s http://localhost:3001/ | head -30 | grep -i "dhanvantari\|ayurveda" > /dev/null; then
  echo "✅✅✅ SUCCESS! TPS Dhanvantari Ayurveda is running!"
  echo ""
  echo "🌐 Test URLs:"
  echo "  • https://tpsdhanvantariayurveda.in"
  echo "  • http://88.222.244.84:3001"
  echo ""
  echo "👤 Login Credentials:"
  echo "  Email: Shankaranherbaltreatment@gmail.com"
  echo "  Password: 123456"
else
  echo "❌ WARNING: Service might not be responding correctly"
  echo ""
  echo "📋 Last 20 lines of PM2 logs:"
  pm2 logs ayurveda-clinic --nostream --lines 20
fi

echo ""
echo "🎉 Deployment script completed!"
echo "================================================"
