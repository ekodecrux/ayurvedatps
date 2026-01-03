#!/bin/bash
cd /var/www/ayurveda
npm install --production
pm2 delete ayurveda-clinic 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash
echo "✅ Application started on port 3001"
echo "🌐 Access at: http://88.222.244.84:3001"
