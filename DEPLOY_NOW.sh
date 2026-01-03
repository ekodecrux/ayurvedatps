#!/bin/bash
# IMMEDIATE DEPLOYMENT FIX FOR PATIENT VIEW MODE
# This script must be run ON THE PRODUCTION SERVER at 88.222.244.84

echo "================================"
echo "Patient View Mode Deployment Fix"
echo "================================"
echo ""
echo "Starting deployment..."

# Navigate to project directory
cd /var/www/ayurveda || { echo "ERROR: Project directory not found"; exit 1; }

# Show current status
echo "Current git status:"
git status

# Pull latest code from GitHub
echo ""
echo "Pulling latest code from GitHub..."
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo "ERROR: Git pull failed"
    exit 1
fi

# Copy the fixed file
echo ""
echo "Deploying fixed app.js..."
cp -f public/static/app.js dist/static/app.js

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to copy app.js"
    exit 1
fi

# Verify deployment
echo ""
echo "Verifying deployment..."
if grep -q "showPatientModal(res.data.data, true)" dist/static/app.js; then
    echo "✅ SUCCESS: New code deployed correctly!"
else
    echo "❌ ERROR: New code NOT found in deployed file"
    echo "Please check the file manually"
    exit 1
fi

# Show file info
echo ""
echo "Deployed file info:"
ls -lh dist/static/app.js
md5sum dist/static/app.js

# Restart PM2 (optional, but recommended for cache clearing)
echo ""
echo "Restarting PM2 process..."
pm2 restart ayurveda-clinic

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "IMPORTANT: Clear your browser cache!"
echo "Press: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo ""
echo "Test the fix:"
echo "1. Go to: http://88.222.244.84:3001/"
echo "2. Navigate to Patients section"
echo "3. Click the View button (eye icon) on any patient"
echo "4. Modal should show: 'View Patient Details' (NOT 'Edit Patient')"
echo "5. All fields should be disabled/grayed out"
echo ""
