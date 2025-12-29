#!/bin/bash

# Production Fix Script for Ayurveda Clinic
# This script will help diagnose and fix common production issues

set -e

echo "🏥 Ayurveda Clinic - Production Fix Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check database exists
echo "Step 1: Checking D1 database..."
echo ""
npx wrangler d1 list | grep -q "ayurveda-db-prod" && echo -e "${GREEN}✓ Database 'ayurveda-db-prod' exists${NC}" || echo -e "${RED}✗ Database not found. Create it first!${NC}"
echo ""

# Step 2: List existing tables
echo "Step 2: Checking tables in production database..."
echo ""
TABLES=$(npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name" 2>/dev/null || echo "")

if [ -z "$TABLES" ]; then
  echo -e "${RED}✗ No tables found or cannot connect to database${NC}"
  echo ""
  echo "REQUIRED TABLES:"
  echo "  - admin_users"
  echo "  - sessions"
  echo "  - patients"
  echo "  - herbs_routes"
  echo "  - medicines_tracking"
  echo "  - payment_collections"
  echo ""
  echo "Run migrations: npx wrangler d1 migrations apply ayurveda-db-prod --remote"
else
  echo "$TABLES"
  echo ""
  echo -e "${GREEN}✓ Tables found${NC}"
fi
echo ""

# Step 3: Check admin user
echo "Step 3: Checking admin user..."
echo ""
ADMIN=$(npx wrangler d1 execute ayurveda-db-prod --remote --command="SELECT email, name FROM admin_users LIMIT 1" 2>/dev/null || echo "")

if echo "$ADMIN" | grep -q "tpsdhanvantari@gmail.com"; then
  echo -e "${GREEN}✓ Admin user exists${NC}"
  echo "  Email: tpsdhanvantari@gmail.com"
  echo "  Password: 123456"
else
  echo -e "${RED}✗ Admin user not found${NC}"
  echo ""
  echo "Creating admin user..."
  npx wrangler d1 execute ayurveda-db-prod --remote --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', datetime('now'), datetime('now'))" 2>/dev/null && echo -e "${GREEN}✓ Admin user created${NC}" || echo -e "${RED}✗ Failed to create admin user${NC}"
fi
echo ""

# Step 4: Check wrangler.jsonc
echo "Step 4: Checking wrangler.jsonc configuration..."
echo ""
if grep -q "REPLACE_WITH_YOUR_DATABASE_ID" wrangler.jsonc; then
  echo -e "${RED}✗ Database ID not configured in wrangler.jsonc${NC}"
  echo ""
  echo "Get your database ID:"
  echo "  npx wrangler d1 list"
  echo ""
  echo "Then edit wrangler.jsonc and replace REPLACE_WITH_YOUR_DATABASE_ID with the actual ID"
else
  echo -e "${GREEN}✓ Database ID configured${NC}"
fi
echo ""

# Step 5: D1 Binding Check
echo "Step 5: D1 Binding to Pages"
echo ""
echo -e "${YELLOW}⚠ CRITICAL: You must bind D1 database to Pages!${NC}"
echo ""
echo "Dashboard Method (EASIEST):"
echo "  1. Go to: https://dash.cloudflare.com"
echo "  2. Workers & Pages → ayurveda-clinic → Settings"
echo "  3. Functions → D1 database bindings → Add binding"
echo "  4. Variable name: DB"
echo "  5. D1 database: ayurveda-db-prod"
echo "  6. Save"
echo ""

# Step 6: Deployment check
echo "Step 6: Recent deployments"
echo ""
npx wrangler pages deployment list ayurveda-clinic --limit=3 2>/dev/null || echo -e "${RED}✗ Cannot check deployments${NC}"
echo ""

# Summary
echo "=========================================="
echo "Summary:"
echo ""
echo "If all checks pass, test login at:"
echo "  https://ayurveda-clinic.pages.dev"
echo ""
echo "Login credentials:"
echo "  Email: tpsdhanvantari@gmail.com"
echo "  Password: 123456"
echo ""
echo "If login fails:"
echo "  1. Verify D1 binding in Cloudflare dashboard"
echo "  2. Redeploy: npm run build && npx wrangler pages deploy dist --project-name ayurveda-clinic"
echo "  3. Clear browser cache (Ctrl+Shift+Delete)"
echo "  4. Check deployment logs: npx wrangler pages deployment tail ayurveda-clinic"
echo ""
echo "Need more help? Check PRODUCTION_DEPLOYMENT_FIX.md"
echo ""
