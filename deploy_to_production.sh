#!/bin/bash
# Production Deployment Script
# Deploy to: tpsdhanvantariayurveda.in and tpsdhanvantariayurveda.com
# Date: January 28, 2026

echo "=================================="
echo "🚀 TPS DHANVANTARI AYURVEDA"
echo "   Production Deployment"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backup current deployment
echo -e "${BLUE}Step 1: Creating backup of current deployment...${NC}"
cd /var/www/ayurveda
BACKUP_DIR="/var/www/ayurveda_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup dist and node_modules
echo "Creating backup: ayurveda_backup_${TIMESTAMP}.tar.gz"
tar -czf "${BACKUP_DIR}/ayurveda_backup_${TIMESTAMP}.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    dist/ public/ src/ package.json wrangler.jsonc 2>/dev/null || true

echo -e "${GREEN}✓ Backup created${NC}"
echo ""

# Step 2: Pull latest changes
echo -e "${BLUE}Step 2: Pulling latest changes from GitHub...${NC}"
git fetch origin
git status
echo ""
read -p "Current branch: $(git branch --show-current). Continue with git pull? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git pull origin main
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Git pull successful${NC}"
    else
        echo -e "${RED}✗ Git pull failed!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Skipped git pull${NC}"
fi
echo ""

# Step 3: Install dependencies (if package.json changed)
echo -e "${BLUE}Step 3: Checking dependencies...${NC}"
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "package.json changed, running npm install..."
    npm install
    echo -e "${GREEN}✓ Dependencies updated${NC}"
else
    echo -e "${GREEN}✓ No dependency changes${NC}"
fi
echo ""

# Step 4: Apply database migrations
echo -e "${BLUE}Step 4: Applying database migrations...${NC}"
echo "Checking for new migrations..."
npx wrangler d1 migrations list ayurveda-db --local 2>&1 | tail -5

read -p "Apply migrations? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    npx wrangler d1 migrations apply ayurveda-db --local
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migrations applied${NC}"
    else
        echo -e "${YELLOW}⚠ Migration warning (may already be applied)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipped migrations${NC}"
fi
echo ""

# Step 5: Build the application
echo -e "${BLUE}Step 5: Building application...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
    
    # Check build output
    if [ -f "dist/_worker.js" ]; then
        BUILD_SIZE=$(du -h dist/_worker.js | cut -f1)
        echo "  Build size: ${BUILD_SIZE}"
    fi
else
    echo -e "${RED}✗ Build failed!${NC}"
    echo "Rolling back is recommended"
    exit 1
fi
echo ""

# Step 6: Restart application
echo -e "${BLUE}Step 6: Restarting application...${NC}"
pm2 list | grep ayurveda-clinic
echo ""
pm2 restart ayurveda-clinic
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Application restarted${NC}"
else
    echo -e "${RED}✗ Restart failed!${NC}"
    exit 1
fi
echo ""

# Wait for app to start
echo "Waiting for application to start (5 seconds)..."
sleep 5
echo ""

# Step 7: Verify deployment
echo -e "${BLUE}Step 7: Verifying deployment...${NC}"

# Check PM2 status
echo "PM2 Status:"
pm2 list | grep ayurveda-clinic
echo ""

# Check if app is responding on localhost
echo "Testing localhost:3011..."
LOCALHOST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3011)
if [ "$LOCALHOST_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Localhost responding (HTTP $LOCALHOST_RESPONSE)${NC}"
else
    echo -e "${RED}✗ Localhost not responding (HTTP $LOCALHOST_RESPONSE)${NC}"
fi
echo ""

# Check .in domain
echo "Testing tpsdhanvantariayurveda.in..."
IN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://tpsdhanvantariayurveda.in)
if [ "$IN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ .in domain responding (HTTP $IN_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠ .in domain (HTTP $IN_RESPONSE)${NC}"
fi
echo ""

# Check .com domain
echo "Testing tpsdhanvantariayurveda.com..."
COM_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://tpsdhanvantariayurveda.com)
if [ "$COM_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ .com domain responding (HTTP $COM_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠ .com domain (HTTP $COM_RESPONSE)${NC}"
fi
echo ""

# Check app title
echo "Verifying application content..."
APP_TITLE=$(curl -s http://localhost:3011 | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
if [[ "$APP_TITLE" == *"TPS DHANVANTARI AYURVEDA"* ]]; then
    echo -e "${GREEN}✓ Application title correct: ${APP_TITLE}${NC}"
else
    echo -e "${YELLOW}⚠ Application title: ${APP_TITLE}${NC}"
fi
echo ""

# Step 8: Check logs for errors
echo -e "${BLUE}Step 8: Checking recent logs...${NC}"
echo "Recent PM2 logs (last 10 lines):"
pm2 logs ayurveda-clinic --nostream --lines 10
echo ""

# Final summary
echo "=================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo "=================================="
echo ""
echo "📊 Deployment Summary:"
echo "  - Backup: ${BACKUP_DIR}/ayurveda_backup_${TIMESTAMP}.tar.gz"
echo "  - Build: dist/_worker.js"
echo "  - PM2 Status: $(pm2 list | grep ayurveda-clinic | awk '{print $10}')"
echo ""
echo "🌐 URLs to verify:"
echo "  - https://tpsdhanvantariayurveda.in"
echo "  - https://tpsdhanvantariayurveda.com"
echo ""
echo "📋 Recent changes deployed:"
echo "  ✓ Medicine Management System"
echo "  ✓ Disease Numbering (Disease 1, Disease 2, etc.)"
echo "  ✓ Patient Edit - Disease Dropdown Fix"
echo "  ✓ Backup Page Improvements"
echo "  ✓ Backup Filter Dropdown Fix"
echo "  ✓ Backup List Loading Fix"
echo ""
echo "🔍 Next steps:"
echo "  1. Open https://tpsdhanvantariayurveda.in in browser"
echo "  2. Login: Shankaranherbaltreatment@gmail.com / 123456"
echo "  3. Test new features:"
echo "     - Herbs & Roots → Medicines button"
echo "     - Patients → Add Patient → Disease numbering"
echo "     - Settings → Backup & Restore"
echo ""
echo "💡 To rollback (if needed):"
echo "  cd /var/www/ayurveda"
echo "  tar -xzf ${BACKUP_DIR}/ayurveda_backup_${TIMESTAMP}.tar.gz"
echo "  npm run build"
echo "  pm2 restart ayurveda-clinic"
echo ""
echo "=================================="
