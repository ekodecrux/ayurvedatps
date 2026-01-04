#!/bin/bash
# Quick Deployment Script for Mobile Responsive Update
# TPS DHANVANTARI AYURVEDA v2.5.0

echo "================================================"
echo "🚀 TPS DHANVANTARI AYURVEDA - Mobile Update"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📥 Step 1: Pulling latest code from GitHub...${NC}"
git pull origin main

echo ""
echo -e "${BLUE}🔨 Step 2: Building application...${NC}"
npm run build

echo ""
echo -e "${BLUE}📋 Step 3: Checking built files...${NC}"
if [ -f "dist/_worker.js" ]; then
    echo -e "${GREEN}✓ dist/_worker.js exists${NC}"
    ls -lh dist/_worker.js
else
    echo -e "${YELLOW}⚠ dist/_worker.js not found${NC}"
fi

if [ -f "dist/static/app.js" ]; then
    echo -e "${GREEN}✓ dist/static/app.js exists${NC}"
    ls -lh dist/static/app.js
else
    echo -e "${YELLOW}⚠ dist/static/app.js not found${NC}"
fi

echo ""
echo -e "${BLUE}🔄 Step 4: Restarting PM2 service...${NC}"
pm2 restart ayurveda-clinic

echo ""
echo -e "${BLUE}📊 Step 5: Checking PM2 status...${NC}"
pm2 status ayurveda-clinic

echo ""
echo -e "${BLUE}📝 Step 6: Checking recent logs...${NC}"
pm2 logs ayurveda-clinic --nostream --lines 20

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}🌐 Test URLs:${NC}"
echo "   • Production: https://tpsdhanvantariayurveda.in"
echo "   • Direct IP:  http://88.222.244.84:3001"
echo ""
echo -e "${YELLOW}📱 Mobile Testing:${NC}"
echo "   1. Open Chrome DevTools (F12)"
echo "   2. Click device toolbar (Ctrl+Shift+M)"
echo "   3. Select iPhone or Android device"
echo "   4. Clear cache: Ctrl+Shift+R"
echo "   5. Look for hamburger menu (☰) in top-left"
echo ""
echo -e "${YELLOW}✨ New Features:${NC}"
echo "   • Mobile hamburger menu"
echo "   • Responsive navigation"
echo "   • Touch-optimized UI"
echo "   • Side menu with overlay"
echo ""
