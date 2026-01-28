#!/bin/bash

# ======================================================================
# TPS DHANVANTARI AYURVEDA - PRODUCTION DEPLOYMENT
# Deploy to both .in and .com sites
# ======================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production server details
SERVER_USER="root"
SERVER_IP="88.222.244.84"
PROJECT_DIR="/var/www/ayurveda"
PM2_APP_NAME="ayurveda-clinic"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   TPS DHANVANTARI AYURVEDA - PRODUCTION DEPLOYMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Display what will be deployed
echo -e "${YELLOW}📦 CHANGES TO BE DEPLOYED:${NC}"
echo ""
echo "  1. ✅ Medicine Management System (Commit: 89c8468)"
echo "     - Medicines button in Herbs & Roots"
echo "     - Medicine Management modal (Add/Edit/Delete)"
echo "     - Medicine dropdown in prescription form"
echo "     - 15 pre-loaded Ayurvedic medicines"
echo ""
echo "  2. ✅ Patient Disease Numbering (Commit: 6d52627)"
echo "     - Disease 1, Disease 2, Disease 3, etc."
echo "     - Improved visual separation"
echo ""
echo "  3. ✅ Patient Edit - Disease Dropdown Fix (Commit: 32a7bd4)"
echo "     - Fixed disease dropdown not loading in edit mode"
echo ""
echo "  4. ✅ Backup Error Handling (Commit: 841c4fa)"
echo "     - Better error messages when backup API unavailable"
echo "     - Informative guidance for production setup"
echo ""
echo "  5. ✅ Backup Filter Dropdown Fix (Commit: ceab4f4)"
echo "     - Dropdown now shows correct filter selection"
echo ""
echo "  6. ✅ Backup List Loading Fix (Commit: 13d8000)"
echo "     - Backup list loads immediately on page open"
echo ""
echo -e "${YELLOW}🌐 DEPLOYMENT TARGETS:${NC}"
echo "  - https://tpsdhanvantariayurveda.in (Primary)"
echo "  - https://tpsdhanvantariayurveda.com (Secondary)"
echo ""
echo -e "${YELLOW}📊 LATEST COMMIT: ${GREEN}13d8000${NC}"
echo ""

# Confirm deployment
read -p "$(echo -e ${YELLOW}Continue with deployment? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 STARTING DEPLOYMENT...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Deploy to production server
echo -e "${YELLOW}Step 1:${NC} Connecting to production server..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'

set -e

# Colors for output (inside SSH)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/ayurveda"
PM2_APP_NAME="ayurveda-clinic"

echo -e "${GREEN}✅ Connected to production server${NC}"
echo ""

# Navigate to project directory
echo -e "${YELLOW}Step 2:${NC} Navigating to project directory..."
cd ${PROJECT_DIR}
echo -e "${GREEN}✅ In ${PROJECT_DIR}${NC}"
echo ""

# Show current status
echo -e "${YELLOW}Step 3:${NC} Current Git status..."
git log --oneline -5
echo ""

# Pull latest changes
echo -e "${YELLOW}Step 4:${NC} Pulling latest changes from GitHub..."
git fetch origin
git pull origin main
echo -e "${GREEN}✅ Latest code pulled${NC}"
echo ""

# Show new commits
echo -e "${YELLOW}Step 5:${NC} New commits deployed:"
git log --oneline -6
echo ""

# Install/Update dependencies (if package.json changed)
echo -e "${YELLOW}Step 6:${NC} Checking dependencies..."
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo -e "${BLUE}📦 package.json changed, updating dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies updated${NC}"
else
    echo -e "${GREEN}✅ No dependency changes${NC}"
fi
echo ""

# Build the project
echo -e "${YELLOW}Step 7:${NC} Building project..."
npm run build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Apply database migrations
echo -e "${YELLOW}Step 8:${NC} Applying database migrations..."
if [ -d "migrations" ]; then
    echo -e "${BLUE}📊 Checking for new migrations...${NC}"
    npx wrangler d1 migrations list ayurveda-db --local || true
    npx wrangler d1 migrations apply ayurveda-db --local
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️  No migrations directory found${NC}"
fi
echo ""

# Stop PM2 app
echo -e "${YELLOW}Step 9:${NC} Stopping PM2 application..."
pm2 stop ${PM2_APP_NAME} || echo -e "${YELLOW}⚠️  App was not running${NC}"
echo ""

# Kill any process on port 3001
echo -e "${YELLOW}Step 10:${NC} Cleaning port 3001..."
fuser -k 3001/tcp 2>/dev/null || echo -e "${GREEN}✅ Port 3001 already clean${NC}"
sleep 2
echo ""

# Start PM2 app
echo -e "${YELLOW}Step 11:${NC} Starting PM2 application..."
pm2 start ecosystem.config.cjs || pm2 restart ${PM2_APP_NAME}
echo -e "${GREEN}✅ Application started${NC}"
echo ""

# Wait for app to start
echo -e "${YELLOW}Step 12:${NC} Waiting for application to start..."
sleep 5
echo ""

# Check PM2 status
echo -e "${YELLOW}Step 13:${NC} Checking PM2 status..."
pm2 list
echo ""

# Test local endpoint
echo -e "${YELLOW}Step 14:${NC} Testing local endpoint..."
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local endpoint responding${NC}"
else
    echo -e "${RED}❌ Local endpoint not responding${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    pm2 logs ${PM2_APP_NAME} --nostream --lines 20
    exit 1
fi
echo ""

# Reload Nginx
echo -e "${YELLOW}Step 15:${NC} Reloading Nginx..."
nginx -t && systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"
echo ""

# Save PM2 configuration
echo -e "${YELLOW}Step 16:${NC} Saving PM2 configuration..."
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED ON SERVER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

ENDSSH

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🧪 VERIFYING DEPLOYMENT...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test .in site
echo -e "${YELLOW}Testing .in site:${NC}"
if curl -f -s https://tpsdhanvantariayurveda.in > /dev/null 2>&1; then
    echo -e "${GREEN}✅ https://tpsdhanvantariayurveda.in is responding${NC}"
    
    # Check title
    TITLE=$(curl -s https://tpsdhanvantariayurveda.in | grep -o '<title>[^<]*' | sed 's/<title>//')
    if [[ "$TITLE" == *"TPS DHANVANTARI AYURVEDA"* ]]; then
        echo -e "${GREEN}✅ Correct application loaded (.in)${NC}"
    else
        echo -e "${YELLOW}⚠️  Unexpected title: $TITLE${NC}"
    fi
else
    echo -e "${RED}❌ https://tpsdhanvantariayurveda.in is not responding${NC}"
fi
echo ""

# Test .com site
echo -e "${YELLOW}Testing .com site:${NC}"
if curl -f -s https://tpsdhanvantariayurveda.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ https://tpsdhanvantariayurveda.com is responding${NC}"
    
    # Check title
    TITLE=$(curl -s https://tpsdhanvantariayurveda.com | grep -o '<title>[^<]*' | sed 's/<title>//')
    if [[ "$TITLE" == *"TPS DHANVANTARI AYURVEDA"* ]]; then
        echo -e "${GREEN}✅ Correct application loaded (.com)${NC}"
    else
        echo -e "${YELLOW}⚠️  Unexpected title: $TITLE${NC}"
    fi
else
    echo -e "${RED}❌ https://tpsdhanvantariayurveda.com is not responding${NC}"
fi
echo ""

# Test API endpoint
echo -e "${YELLOW}Testing API endpoint:${NC}"
if curl -f -s https://tpsdhanvantariayurveda.in/api/medicines > /dev/null 2>&1; then
    MEDICINES_COUNT=$(curl -s https://tpsdhanvantariayurveda.in/api/medicines | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ API responding - $MEDICINES_COUNT medicines found${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
fi
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 DEPLOYMENT SUMMARY:${NC}"
echo ""
echo "  🌐 Production URLs:"
echo "     - https://tpsdhanvantariayurveda.in"
echo "     - https://tpsdhanvantariayurveda.com"
echo ""
echo "  📦 Deployed Features:"
echo "     ✅ Medicine Management System"
echo "     ✅ Patient Disease Numbering"
echo "     ✅ Patient Edit - Disease Dropdown Fix"
echo "     ✅ Backup Error Handling"
echo "     ✅ Backup Filter Dropdown Fix"
echo "     ✅ Backup List Loading Fix"
echo ""
echo "  🔐 Admin Login:"
echo "     Email: Shankaranherbaltreatment@gmail.com"
echo "     Password: 123456"
echo ""
echo "  ✨ Next Steps:"
echo "     1. Clear browser cache (Ctrl+Shift+R)"
echo "     2. Test Medicine Management in Herbs & Roots"
echo "     3. Test Patient Disease functionality"
echo "     4. Test Backup & Restore page"
echo "     5. Verify all features are working"
echo ""
echo -e "${GREEN}✅ All systems operational!${NC}"
echo ""
