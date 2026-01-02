# 🚀 TPS DHANVANTARI v2.3.0 - Complete Deployment Guide

## 📦 Package Download

**Complete Codebase**: https://www.genspark.ai/api/files/s/4R80zHaV  
**Size**: 4.0 MB  
**Version**: v2.3.0  
**Status**: ✅ Production Ready  
**Verified**: ✅ Working in Sandbox

---

## 📋 Table of Contents

1. [Quick Start (5 Minutes)](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Wrangler CLI Deployment](#wrangler-deployment)
5. [Database Setup](#database-setup)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start (5 Minutes) {#quick-start}

```bash
# 1. Download and extract
wget https://www.genspark.ai/api/files/s/4R80zHaV -O tps-dhanvantari-v2.3.0.tar.gz
tar -xzf tps-dhanvantari-v2.3.0.tar.gz
cd home/user/webapp

# 2. Login to Cloudflare
npx wrangler login

# 3. Deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic

# 4. Done! Visit https://tpsdhanvantariayurveda.com
```

---

## 💻 System Requirements {#system-requirements}

### **Required**
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Cloudflare Account**: Free tier is sufficient
- **Internet Connection**: For deployment

### **Check Your System**
```bash
node --version    # Should show v18.x or higher
npm --version     # Should show v9.x or higher
```

### **Install Node.js (if needed)**

**Ubuntu/Debian**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS**:
```bash
brew install node@20
```

**Windows**:
Download from https://nodejs.org/

---

## 📥 Installation {#installation}

### **Step 1: Download Package**

```bash
# Using wget
wget https://www.genspark.ai/api/files/s/4R80zHaV -O tps-dhanvantari-v2.3.0.tar.gz

# OR using curl
curl -L https://www.genspark.ai/api/files/s/4R80zHaV -o tps-dhanvantari-v2.3.0.tar.gz
```

### **Step 2: Extract**

```bash
# Extract the archive
tar -xzf tps-dhanvantari-v2.3.0.tar.gz

# Navigate to project directory
cd home/user/webapp

# Verify extraction
ls -la
```

### **Step 3: Verify Package Contents**

```bash
# Check directory structure
tree -L 2 .

# Should show:
# .
# ├── dist/                 # Production build (DEPLOY THIS)
# ├── src/                  # Source code
# ├── public/               # Static assets
# ├── migrations/           # Database migrations
# ├── wrangler.jsonc        # Cloudflare config
# ├── package.json          # Dependencies
# ├── vite.config.ts        # Build config
# └── README.md             # Documentation
```

---

## 🚀 Wrangler CLI Deployment {#wrangler-deployment}

### **Method 1: Using npx (Recommended - No Installation)**

```bash
# Step 1: Navigate to project directory
cd home/user/webapp

# Step 2: Login to Cloudflare
npx wrangler login

# This will:
# 1. Open your browser
# 2. Ask you to authorize wrangler
# 3. Save authentication token
# 4. Show: "Successfully logged in"

# Step 3: Verify authentication
npx wrangler whoami

# Should show:
# Getting User settings...
# 👋 You are logged in...
# Account Name: Parimi.prasad@gmail.com's Account

# Step 4: Deploy to production
npx wrangler pages deploy dist --project-name ayurveda-clinic

# You should see:
# ⛅️ wrangler 4.55.0
# 🌍 Uploading... (10 files)
# ✨ Success! Uploaded 10 files
# ✨ Deployment complete!
# 🌐 https://ayurveda-clinic.pages.dev
# 🌐 https://tpsdhanvantariayurveda.com
```

### **Method 2: Using Global Wrangler Installation**

```bash
# Step 1: Install wrangler globally
npm install -g wrangler

# Step 2: Verify installation
wrangler --version
# Should show: 4.55.0 or higher

# Step 3: Login
wrangler login

# Step 4: Deploy
wrangler pages deploy dist --project-name ayurveda-clinic
```

### **Method 3: Using API Token (For CI/CD)**

```bash
# Step 1: Set environment variable
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# Get token from: https://dash.cloudflare.com/profile/api-tokens

# Step 2: Verify
npx wrangler whoami

# Step 3: Deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

---

## 🗄️ Database Setup {#database-setup}

The package includes a pre-configured Cloudflare D1 database setup.

### **Production Database (Already Created)**

**Database Details**:
- **Name**: `ayurveda-clinic-production`
- **Database ID**: `7ce3cb22-22c5-42e1-87f7-d53b533df18c`
- **Binding**: `DB`
- **Type**: Cloudflare D1 (SQLite)

### **Verify Database Binding**

```bash
# Check wrangler.jsonc
cat wrangler.jsonc

# Should show:
# {
#   "name": "ayurveda-clinic",
#   "d1_databases": [
#     {
#       "binding": "DB",
#       "database_name": "ayurveda-clinic-production",
#       "database_id": "7ce3cb22-22c5-42e1-87f7-d53b533df18c"
#     }
#   ]
# }
```

### **Apply Migrations (if needed)**

```bash
# List migrations
ls migrations/

# Should show:
# 0001_initial_schema.sql
# 0002_add_patients_table.sql
# 0003_add_prescriptions_table.sql
# ... (11 migration files)

# Apply all migrations to production
npx wrangler d1 migrations apply ayurveda-clinic-production

# Verify migration status
npx wrangler d1 migrations list ayurveda-clinic-production
```

### **Local Development Database**

```bash
# For local testing, use --local flag
npx wrangler pages dev dist --d1=ayurveda-clinic-production --local --port 3000

# Apply migrations locally
npx wrangler d1 migrations apply ayurveda-clinic-production --local

# Execute SQL locally
npx wrangler d1 execute ayurveda-clinic-production --local --command="SELECT COUNT(*) FROM patients"
```

---

## ✅ Verification {#verification}

### **Step 1: Check Deployment Status**

```bash
# Get deployment info
npx wrangler pages deployment list --project-name ayurveda-clinic

# Should show recent deployment with status: "Success"
```

### **Step 2: Test URLs**

```bash
# Test production domain
curl -I https://tpsdhanvantariayurveda.com
# Should return: HTTP/2 200

# Test Cloudflare Pages domain
curl -I https://ayurveda-clinic.pages.dev
# Should return: HTTP/2 200

# Check app.js version
curl https://tpsdhanvantariayurveda.com | grep "app.js"
# Should show: app.js?v=2.3.0
```

### **Step 3: Browser Verification**

1. **Open**: https://tpsdhanvantariayurveda.com
2. **Clear Cache**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Login**: 
   - Email: `admin@tpsdhanvantari.com`
   - Password: `admin123`
4. **Check Features**:
   - ✅ Dashboard loads with stats
   - ✅ Patients → Add Patient → Additional phone numbers
   - ✅ Patients → Add Patient → Full address fields (8 fields)
   - ✅ Herbs & Routes → Add Medicine → Side-by-side layout
   - ✅ Medicine Schedule → Before/After columns
   - ✅ Checkbox toggles quantity dropdowns
   - ✅ Edit loads current data
   - ✅ View/Print shows all data

### **Step 4: Developer Console Check**

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Verify:
   - ✅ No red errors
   - ✅ Service Worker v2.3.0 registered
   - ✅ app.js?v=2.3.0 loaded
4. Go to **Network** tab
5. Reload page
6. Verify:
   - ✅ All resources load with 200 status
   - ✅ API calls return success

---

## 🐛 Troubleshooting {#troubleshooting}

### **Issue 1: Authentication Error**

**Symptoms**:
```
✘ [ERROR] Authentication error [code: 10000]
```

**Solution**:
```bash
# Logout and login again
npx wrangler logout
npx wrangler login

# OR use API token
export CLOUDFLARE_API_TOKEN="your-token"
npx wrangler whoami
```

---

### **Issue 2: Project Not Found**

**Symptoms**:
```
✘ [ERROR] Project "ayurveda-clinic" not found
```

**Solution**:
```bash
# List all your Pages projects
npx wrangler pages project list

# Create project if it doesn't exist
npx wrangler pages project create ayurveda-clinic --production-branch main

# Then deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

---

### **Issue 3: dist/ Not Found**

**Symptoms**:
```
✘ [ERROR] Directory not found: dist
```

**Solution**:
```bash
# Check current directory
pwd

# Should be: /path/to/home/user/webapp

# Verify dist exists
ls -la dist/

# If dist doesn't exist, you're in wrong directory
cd home/user/webapp
ls -la dist/
```

---

### **Issue 4: Old Version Showing After Deployment**

**Symptoms**:
- Deployment succeeds but old version shows
- Features not appearing

**Solution**:
```bash
# Clear browser cache
# Chrome/Firefox: Ctrl+Shift+Delete
# Or hard refresh: Ctrl+Shift+R

# Check Service Worker
# F12 → Application → Service Workers → Unregister

# Verify new version deployed
curl https://tpsdhanvantariayurveda.com | grep "app.js"
# Should show: app.js?v=2.3.0
```

---

### **Issue 5: Database Not Connected**

**Symptoms**:
- API calls fail with 500 error
- "DB is not defined" errors

**Solution**:
```bash
# Verify D1 binding in Cloudflare Dashboard
# 1. Go to: https://dash.cloudflare.com
# 2. Workers & Pages → ayurveda-clinic → Settings → Bindings
# 3. Check D1 database binding exists:
#    Variable name: DB
#    D1 database: ayurveda-clinic-production

# Apply migrations
npx wrangler d1 migrations apply ayurveda-clinic-production

# Test database
npx wrangler d1 execute ayurveda-clinic-production --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

### **Issue 6: Deployment Timeout**

**Symptoms**:
```
Error: context deadline exceeded
```

**Solution**:
```bash
# Try deploying with smaller batches
# Method 1: Rebuild first
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic

# Method 2: Use manual upload
# Go to: https://dash.cloudflare.com
# Workers & Pages → ayurveda-clinic → Deployments
# Click "Create deployment" → Upload dist/ folder
```

---

## 📁 Package Structure

```
home/user/webapp/
├── dist/                              # Production build (DEPLOY THIS)
│   ├── _worker.js                     # Main application (139.80 KB)
│   ├── _routes.json                   # Routing configuration
│   └── static/                        # Static assets
│       ├── app.js                     # Frontend JavaScript
│       ├── styles.css                 # Custom styles
│       ├── manifest.json              # PWA manifest
│       ├── sw.js                      # Service Worker v2.3.0
│       └── icons/                     # App icons
│           ├── icon-192x192.png
│           └── icon-512x512.png
│
├── src/                               # Source code
│   ├── index.tsx                      # Main Hono app
│   └── routes/                        # API routes (if any)
│
├── public/                            # Static source files
│   └── static/                        # Source for dist/static/
│       ├── app.js                     # Frontend source
│       ├── styles.css                 # Style source
│       ├── manifest.json              # PWA manifest
│       └── sw.js                      # Service Worker source
│
├── migrations/                        # D1 database migrations
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_patients_table.sql
│   ├── 0003_add_prescriptions_table.sql
│   ├── 0004_add_medicines_table.sql
│   ├── 0005_add_appointments_table.sql
│   ├── 0006_add_reminders_table.sql
│   ├── 0007_add_additional_phones.sql
│   ├── 0008_add_address_fields.sql
│   ├── 0009_add_medicine_dosage.sql
│   ├── 0010_add_payment_fields.sql
│   └── 0011_add_indexes.sql
│
├── .git/                              # Git repository
├── .gitignore                         # Git ignore rules
├── wrangler.jsonc                     # Cloudflare Pages config
├── package.json                       # Dependencies and scripts
├── package-lock.json                  # Dependency lock file
├── vite.config.ts                     # Vite build configuration
├── tsconfig.json                      # TypeScript config
├── ecosystem.config.cjs               # PM2 config (for local dev)
├── seed.sql                           # Sample data
├── README.md                          # Project documentation
├── MANUAL_DEPLOYMENT_GUIDE.md         # Manual deployment guide
├── DEPLOYMENT_SUCCESS.md              # Previous deployment log
└── COMPLETE_DEPLOYMENT_GUIDE.md       # This file
```

---

## 🎨 Features Included

### **Patient Management**
- ✅ Add/Edit/Delete patients
- ✅ **Multiple phone numbers** (unlimited additional phones)
- ✅ **8 detailed address fields**:
  - H.No / Door No
  - Street
  - Apartment/Building
  - Area/Locality
  - District
  - State/Province
  - Pin Code / Zip
  - Complete Address (textarea)
- ✅ Patient search and filtering
- ✅ CSV/Excel export

### **Herbs & Routes (Prescriptions)**
- ✅ Create/Edit/Delete prescriptions
- ✅ **Side-by-side medicine schedule** (Before | After)
- ✅ **8 dosage time slots**:
  - Morning (Before/After)
  - Afternoon (Before/After)
  - Evening (Before/After)
  - Night (Before/After)
- ✅ **Quantity dropdowns** (1-5) with checkbox enable/disable
- ✅ Multiple medicines per course
- ✅ Multiple courses per prescription
- ✅ Payment tracking
- ✅ Print-friendly view

### **Appointments**
- ✅ Schedule appointments
- ✅ Status tracking (Scheduled/Completed/Cancelled)
- ✅ Calendar view
- ✅ Patient linking

### **Reminders**
- ✅ WhatsApp reminders (with configuration)
- ✅ Follow-up tracking
- ✅ Automatic reminder scheduling

### **PWA (Progressive Web App)**
- ✅ Install on mobile/desktop
- ✅ Offline mode
- ✅ Service Worker v2.3.0
- ✅ Cache management
- ✅ Fast loading

### **Exports**
- ✅ CSV export (patients, prescriptions)
- ✅ Excel export
- ✅ PDF print (prescriptions)

---

## 🔧 Configuration

### **wrangler.jsonc**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "ayurveda-clinic",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ayurveda-clinic-production",
      "database_id": "7ce3cb22-22c5-42e1-87f7-d53b533df18c"
    }
  ]
}
```

### **package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "wrangler pages dev dist",
    "deploy": "npm run build && wrangler pages deploy dist --project-name ayurveda-clinic",
    "db:migrate": "wrangler d1 migrations apply ayurveda-clinic-production",
    "db:migrate:local": "wrangler d1 migrations apply ayurveda-clinic-production --local"
  }
}
```

---

## 🔗 Important URLs

### **Production**
- **Primary Domain**: https://tpsdhanvantariayurveda.com
- **Cloudflare Pages**: https://ayurveda-clinic.pages.dev
- **Branch Deployments**: https://[branch].ayurveda-clinic.pages.dev

### **Development**
- **Sandbox**: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai
- **Local**: http://localhost:3000

### **Cloudflare Dashboard**
- **Workers & Pages**: https://dash.cloudflare.com
- **D1 Database**: https://dash.cloudflare.com → Storage → D1
- **Analytics**: https://dash.cloudflare.com → Analytics
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens

---

## 🔐 Credentials

### **Admin Login**
- **Email**: admin@tpsdhanvantari.com
- **Password**: admin123

### **Database**
- **Name**: ayurveda-clinic-production
- **ID**: 7ce3cb22-22c5-42e1-87f7-d53b533df18c
- **Type**: Cloudflare D1 (SQLite)

---

## 📊 Version Information

- **Version**: v2.3.0
- **Build Date**: January 2, 2026
- **Vite**: v6.4.1
- **Hono**: v4.0.0
- **Wrangler**: v4.55.0
- **Service Worker**: v2.3.0
- **App.js**: v2.3.0

---

## 🎯 Deployment Checklist

### **Pre-Deployment**
- [ ] Node.js v18+ installed
- [ ] Cloudflare account created
- [ ] Package downloaded and extracted
- [ ] Wrangler installed or using npx

### **Deployment**
- [ ] Logged in to Cloudflare (`wrangler login`)
- [ ] In correct directory (`home/user/webapp`)
- [ ] dist/ folder exists
- [ ] Run deployment command
- [ ] Deployment succeeds

### **Post-Deployment**
- [ ] Production URL returns HTTP 200
- [ ] Login works
- [ ] Dashboard loads
- [ ] Patient features work
- [ ] Medicine schedule shows side-by-side
- [ ] Additional phones work
- [ ] Address fields work
- [ ] Edit loads data correctly
- [ ] View/Print show all data
- [ ] No console errors

---

## 📞 Support

### **Common Commands**
```bash
# Check wrangler version
npx wrangler --version

# Check login status
npx wrangler whoami

# List Pages projects
npx wrangler pages project list

# View deployments
npx wrangler pages deployment list --project-name ayurveda-clinic

# View logs
npx wrangler pages deployment tail --project-name ayurveda-clinic

# Test database
npx wrangler d1 execute ayurveda-clinic-production --command="SELECT COUNT(*) FROM patients"
```

### **Useful Links**
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **D1 Database Docs**: https://developers.cloudflare.com/d1/
- **Hono Framework**: https://hono.dev/

---

## 🚀 Quick Deployment (One Command)

```bash
wget https://www.genspark.ai/api/files/s/4R80zHaV -O tps-dhanvantari.tar.gz && \
tar -xzf tps-dhanvantari.tar.gz && \
cd home/user/webapp && \
npx wrangler login && \
npx wrangler pages deploy dist --project-name ayurveda-clinic && \
echo "✅ Deployment Complete! Visit https://tpsdhanvantariayurveda.com"
```

---

## ✨ Success!

After successful deployment:

1. **Visit**: https://tpsdhanvantariayurveda.com
2. **Clear Cache**: Ctrl+Shift+R
3. **Login**: admin@tpsdhanvantari.com / admin123
4. **Test**: All features should work perfectly!

**Questions?** Check the troubleshooting section or verify against the working sandbox: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai

---

**Last Updated**: January 2, 2026  
**Version**: v2.3.0  
**Status**: Production Ready ✅
