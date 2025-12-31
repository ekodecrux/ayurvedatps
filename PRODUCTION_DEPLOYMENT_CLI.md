# Production Deployment via CLI - Step by Step

## ✅ PRE-DEPLOYMENT CHECKLIST

### Current Status
- ✅ Code is complete and tested
- ✅ All features working (Dashboard, Patients, Appointments, Herbs, Reminders, Settings, Reports)
- ✅ Build successful (186.98 kB)
- ✅ GitHub updated (branch: `pwa-mobile-app-exact-design`, commit: `2f7fe73`)
- ✅ Service Worker configured
- ✅ PWA manifest ready
- ✅ Error handling added

---

## 🚀 PRODUCTION DEPLOYMENT STEPS

### Method 1: Wrangler CLI (Recommended - Direct API)

#### Step 1: Verify Build
```bash
cd /home/user/webapp
npm run build
```

**Expected output:**
```
✓ 40 modules transformed.
dist/_worker.js  186.98 kB
✓ built in 700ms
```

#### Step 2: Verify Wrangler Authentication
```bash
npx wrangler whoami
```

**Expected output:**
```
You are logged in with an User API Token
Account: Parimi.prasad@gmail.com's Account
Account ID: df062639da601bcc1a52d074c1a2be12
```

**If authentication fails:**
```bash
# Set your API token
export CLOUDFLARE_API_TOKEN="your-token-here"

# Verify again
npx wrangler whoami
```

#### Step 3: List Existing Projects
```bash
npx wrangler pages project list
```

**Expected output:**
```
ayurveda-clinic
```

#### Step 4: Deploy to Production
```bash
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main
```

**This command will:**
1. Upload files from `dist/` folder (186 KB)
2. Deploy to your existing `ayurveda-clinic` project
3. Use `main` as the production branch
4. Generate deployment URLs

**Expected output:**
```
✨ Success! Uploaded 15 files (2.5 seconds)

✨ Deployment complete! Take a peek over at
   https://ayurveda-clinic.pages.dev
   https://main.ayurveda-clinic.pages.dev
```

#### Step 5: Verify Deployment
```bash
# Test the production URL
curl https://ayurveda-clinic.pages.dev

# Test the PWA route
curl https://ayurveda-clinic.pages.dev/pwa

# Test API health (if you have a health endpoint)
curl https://ayurveda-clinic.pages.dev/api/stats
```

---

### Method 2: GitHub Auto-Deploy (One-Time Setup)

If Wrangler CLI fails due to API token issues, use GitHub connection:

#### Step 1: Connect via Dashboard
```
1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → ayurveda-clinic
3. Settings → Builds & deployments
4. Click "Connect a Git repository"
5. Select GitHub → ekodecrux/ayurvedatps
6. Branch: pwa-mobile-app-exact-design
7. Build command: npm run build
8. Output directory: dist
9. Save and Deploy
```

#### Step 2: Future Deployments (Just Git Push)
```bash
cd /home/user/webapp

# Make changes...
git add -A
git commit -m "Your changes"
git push origin pwa-mobile-app-exact-design

# Cloudflare automatically deploys in 2-3 minutes
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: "Authentication error [code: 10000]"

**Problem:** API token doesn't have required permissions

**Solution:**
```bash
# Create new API token with these permissions:
# - Account: Cloudflare Pages - Edit
# - Zone: Zone - Read

# Set the token
export CLOUDFLARE_API_TOKEN="your-new-token"
echo 'export CLOUDFLARE_API_TOKEN="your-new-token"' >> ~/.bashrc
source ~/.bashrc

# Test
npx wrangler whoami
```

### Issue 2: "Project not found"

**Problem:** Project doesn't exist or wrong name

**Solution:**
```bash
# List all projects
npx wrangler pages project list

# Use the exact name from the list
npx wrangler pages deploy dist --project-name YOUR_EXACT_PROJECT_NAME
```

### Issue 3: "Invalid API Token [code: 1000]"

**Problem:** Token is malformed or expired

**Solution:**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Delete the old token
3. Create new token using "Edit Cloudflare Pages" template
4. Copy the new token
5. Set it as environment variable

### Issue 4: Build Fails

**Problem:** Build process encounters errors

**Solution:**
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build

# Check for errors
npm run build 2>&1 | tee build.log
```

### Issue 5: Deployment Takes Too Long

**Problem:** Large files or network issues

**Solution:**
```bash
# Check dist size
du -sh dist/
ls -lh dist/

# Optimize if needed
npm run build -- --minify

# Deploy with verbose logging
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main --verbose
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Step 1: Test Production URLs
```bash
# Main production URL
curl -I https://ayurveda-clinic.pages.dev

# PWA route
curl -I https://ayurveda-clinic.pages.dev/pwa

# Service Worker
curl -I https://ayurveda-clinic.pages.dev/pwa-sw.js

# Manifest
curl -I https://ayurveda-clinic.pages.dev/pwa-manifest.json

# Static assets
curl -I https://ayurveda-clinic.pages.dev/static/pwa-app.js
```

**All should return:** `HTTP/2 200`

### Step 2: Test PWA Functionality
1. Open https://ayurveda-clinic.pages.dev/pwa in browser
2. Login with: `tpsdhanvantari@gmail.com` / `123456`
3. Test all features:
   - ✅ Dashboard loads with stats
   - ✅ Patients CRUD works
   - ✅ Appointments CRUD works
   - ✅ Herbs & Roots view works
   - ✅ Reminders work
   - ✅ Settings modal opens (3-dot menu)
   - ✅ Reports dashboard opens (3-dot menu)
   - ✅ Logout works

### Step 3: Test on Mobile
1. Open production URL on phone
2. Test PWA installation:
   - **Android Chrome:** Menu → "Add to Home screen"
   - **iPhone Safari:** Share → "Add to Home Screen"
3. Open installed PWA
4. Test offline functionality (turn off network, app should still load cached version)

---

## 🎯 QUICK DEPLOYMENT COMMANDS (Copy & Paste)

### For Local Machine with Wrangler Installed:
```bash
# 1. Clone or pull latest
git clone https://github.com/ekodecrux/ayurvedatps.git
cd ayurvedatps
git checkout pwa-mobile-app-exact-design

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Set API token
export CLOUDFLARE_API_TOKEN="your-token-here"

# 5. Deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main

# Done! Check URLs in output
```

### For Sandbox Environment:
```bash
# Already in /home/user/webapp
cd /home/user/webapp

# 1. Pull latest changes
git pull origin pwa-mobile-app-exact-design

# 2. Build
npm run build

# 3. Deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main
```

---

## 🔐 API TOKEN SETUP (If Needed)

### Create Proper API Token:
```
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit Cloudflare Pages"
4. Verify permissions:
   ✅ Account: Cloudflare Pages - Edit
   ✅ Zone: Zone - Read
5. Account Resources: Parimi.prasad@gmail.com's Account
6. Zone Resources: All zones
7. Create Token
8. Copy token immediately
```

### Set Token in Environment:
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
echo 'export CLOUDFLARE_API_TOKEN="your-token-here"' >> ~/.bashrc
source ~/.bashrc
```

---

## 📦 WHAT GETS DEPLOYED

### dist/ Folder Contents:
```
dist/
├── _worker.js          (186 KB - Main Hono app)
├── _routes.json        (54 bytes - Routing config)
├── manifest.json       (1.7 KB - PWA manifest)
├── pwa.html           (29 KB - PWA entry point)
├── sw.js              (4.6 KB - Service worker)
└── static/
    ├── app.js         (128 KB - Main app logic)
    ├── pwa-app.js     (59 KB - PWA-specific code)
    ├── styles.css     (6.4 KB - Styling)
    ├── manifest.json  (1.1 KB - Static manifest)
    ├── sw.js          (4.3 KB - Static SW)
    └── ayurveda-logo.png (97 KB - Logo)
```

**Total:** ~500 KB compressed

---

## 🌍 PRODUCTION URLS (After Deployment)

### Primary URL:
```
https://ayurveda-clinic.pages.dev
```

### Branch URL:
```
https://main.ayurveda-clinic.pages.dev
```

### PWA Direct Link:
```
https://ayurveda-clinic.pages.dev/pwa
```

### Custom Domain (Optional):
```
https://tpsdhanvantariayurveda.com
```

---

## 📱 SHARING WITH USERS

### QR Code Generation:
```bash
# Generate QR code for easy mobile access
# Use: https://www.qr-code-generator.com/
# URL: https://ayurveda-clinic.pages.dev/pwa
```

### Shortlink:
```bash
# Create a shortlink for easier sharing
# Use: Cloudflare Pages custom domain + /pwa redirect
```

---

## 🔄 ROLLBACK (If Something Goes Wrong)

### View Deployment History:
```bash
npx wrangler pages deployment list --project-name ayurveda-clinic
```

### Rollback to Previous Version:
```bash
# Find the deployment ID from the list
npx wrangler pages deployment rollback YOUR_DEPLOYMENT_ID --project-name ayurveda-clinic
```

### Or via Dashboard:
```
1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → ayurveda-clinic
3. Deployments tab
4. Click on previous deployment
5. Click "Rollback to this deployment"
```

---

## ✅ SUCCESS CRITERIA

After deployment, verify:
- ✅ Production URL loads (200 status)
- ✅ PWA installs on mobile
- ✅ Login works
- ✅ All CRUD operations work
- ✅ Settings modal opens and displays data
- ✅ Reports dashboard opens with charts
- ✅ Service Worker registers
- ✅ Offline mode works (cached pages load)
- ✅ No console errors

---

## 📞 SUPPORT

If deployment fails:
1. Check API token permissions
2. Verify project name is correct
3. Ensure build completed successfully
4. Check network connectivity
5. Try GitHub auto-deploy method instead

---

**Last Updated:** December 31, 2025
**Deployment Method:** Wrangler CLI via Cloudflare Pages
**Project:** ayurveda-clinic
**Branch:** pwa-mobile-app-exact-design (production: main)
**Status:** Ready for Production ✅
