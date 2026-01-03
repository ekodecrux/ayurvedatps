#!/bin/bash
# Deployment script for Patient View Mode Fix (v2.4.9.4)
# Run this on the production server: bash deploy-patient-view-fix.sh

set -e

echo "=========================================="
echo "Deploying Patient View Mode Fix (v2.4.9.4)"
echo "=========================================="

# Navigate to project directory
cd /var/www/ayurveda

# Check current branch
echo ""
echo "Current git status:"
git status

# Pull latest changes from GitHub
echo ""
echo "Pulling latest code from GitHub..."
git pull origin main

# Copy the updated app.js to dist
echo ""
echo "Copying updated app.js to dist/static/..."
cp public/static/app.js dist/static/app.js

# Verify the file was copied
echo ""
echo "Verifying deployment..."
if grep -q "async function viewPatient(id)" dist/static/app.js; then
    echo "✅ File copied successfully"
    
    # Check if it has the new code
    if grep -q "showPatientModal(res.data.data, true)" dist/static/app.js; then
        echo "✅ New viewPatient code detected"
    else
        echo "⚠️  Warning: New code not found in deployed file"
    fi
else
    echo "❌ Error: File not copied properly"
    exit 1
fi

# Restart PM2 to clear any cache
echo ""
echo "Restarting PM2 process..."
pm2 restart ayurveda-clinic

echo ""
echo "=========================================="
echo "Deployment completed!"
echo "=========================================="
echo ""
echo "Please clear your browser cache or hard refresh (Ctrl+Shift+R)"
echo ""
echo "Test the fix:"
echo "1. Go to Patients section"
echo "2. Click the View button (eye icon)"
echo "3. Modal should open with 'View Patient Details' title"
echo "4. All fields should be disabled (read-only)"
echo ""
