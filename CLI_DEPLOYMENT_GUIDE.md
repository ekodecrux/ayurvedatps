# CLI-Based Production Deployment Guide (No Token Issues)

## 🎯 THREE DEPLOYMENT METHODS

Choose the method that works best for you:

---

## METHOD 1: Deploy from Local Machine (RECOMMENDED)

This is the easiest and most reliable method.

### Requirements:
- Node.js installed on your local computer
- Terminal/Command Prompt access

### Steps:

#### 1. Download Project
Download from: https://www.genspark.ai/api/files/s/90pzw2nO

Or clone from GitHub:
```bash
git clone https://github.com/ekodecrux/ayurvedatps.git
cd ayurvedatps
git checkout pwa-mobile-app-exact-design
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Build Project
```bash
npm run build
```

#### 4. Login to Cloudflare (One-Time)
```bash
npx wrangler login
```

This opens your browser. Login with:
- Email: Parimi.prasad@gmail.com
- Password: Yourkpo@202425
- Click "Allow" to authorize

#### 5. Deploy to Production
```bash
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main
```

#### 6. Done!
Your PWA is live at: https://ayurveda-clinic.pages.dev

---

## METHOD 2: Using Deploy Script (With Valid API Token)

### Step 1: Get a Valid API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit Cloudflare Pages"
4. Create and copy the token

### Step 2: Set Token
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

### Step 3: Run Deploy Script

**On Local Machine:**
```bash
cd ayurvedatps
npm install
chmod +x deploy-direct.sh
./deploy-direct.sh
```

**From Downloaded Package:**
1. Extract the downloaded file
2. Navigate to the folder
3. Run the commands above

---

## METHOD 3: GitHub Auto-Deploy (Set Once, Deploy Forever)

This is the BEST long-term solution - deploy by just pushing to GitHub!

### One-Time Setup (5 minutes):

#### 1. Go to Cloudflare Dashboard
```
https://dash.cloudflare.com/
Login: Parimi.prasad@gmail.com / Yourkpo@202425
```

#### 2. Navigate to Your Project
```
Workers & Pages → ayurveda-clinic → Settings
```

#### 3. Connect GitHub
- Click "Builds & deployments"
- Click "Connect repository" or "Configure production deployments"
- Select GitHub
- Authorize Cloudflare Pages
- Select repository: ekodecrux/ayurvedatps
- Select branch: pwa-mobile-app-exact-design

#### 4. Configure Build
```
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
Node.js version: 18
```

#### 5. Save and Deploy
- Click "Save and Deploy"
- First deployment takes 3-5 minutes
- Future deployments happen automatically on every git push!

### Future Deployments (Just Git Push):
```bash
cd ayurvedatps
# Make changes...
git add .
git commit -m "Your changes"
git push origin pwa-mobile-app-exact-design
```

Cloudflare automatically deploys in 2-3 minutes! ✨

---

## 🔧 TROUBLESHOOTING

### Issue: "wrangler: command not found"

**Solution:**
```bash
npm install -g wrangler
# Or use npx:
npx wrangler --version
```

### Issue: "Authentication error"

**Solution:**
```bash
# Clear old credentials
rm -rf ~/.wrangler
# Login again
npx wrangler login
```

### Issue: "Project not found"

**Solution:**
```bash
# List your projects
npx wrangler pages project list
# Use exact name from list
npx wrangler pages deploy dist --project-name YOUR_EXACT_NAME
```

### Issue: "npm: command not found"

**Solution:**
Install Node.js from https://nodejs.org/

### Issue: "Permission denied: ./deploy-direct.sh"

**Solution:**
```bash
chmod +x deploy-direct.sh
./deploy-direct.sh
```

---

## 📦 DEPLOYMENT PACKAGE CONTENTS

When you download the package, you get:

```
ayurvedatps/
├── src/              # Source code
├── public/           # Static assets
├── dist/             # Production build (created by npm run build)
├── package.json      # Dependencies
├── wrangler.jsonc    # Cloudflare config
├── deploy-direct.sh  # Deployment script
└── README.md         # Documentation
```

---

## ✅ VERIFICATION STEPS

After deployment, verify:

### 1. Check Deployment Status
```bash
npx wrangler pages deployment list --project-name ayurveda-clinic
```

### 2. Test Production URL
```bash
curl https://ayurveda-clinic.pages.dev
```

### 3. Test PWA
Open in browser:
```
https://ayurveda-clinic.pages.dev/pwa
```

Login:
```
Email: tpsdhanvantari@gmail.com
Password: 123456
```

### 4. Test Features
- ✅ Dashboard loads
- ✅ Patients CRUD works
- ✅ Appointments CRUD works
- ✅ Settings opens (3-dot menu)
- ✅ Reports opens (3-dot menu)
- ✅ PWA installs on mobile

---

## 🌐 PRODUCTION URLS

After successful deployment:

### Main URLs:
```
https://ayurveda-clinic.pages.dev
https://ayurveda-clinic.pages.dev/pwa
```

### Branch URL:
```
https://main.ayurveda-clinic.pages.dev
```

### API Endpoints:
```
https://ayurveda-clinic.pages.dev/api/stats
https://ayurveda-clinic.pages.dev/api/patients
https://ayurveda-clinic.pages.dev/api/appointments
```

---

## 📱 SHARE WITH USERS

### Direct PWA Link:
```
https://ayurveda-clinic.pages.dev/pwa
```

### For Mobile Install:
1. Open the URL on phone
2. Android Chrome: Menu → "Add to Home screen"
3. iPhone Safari: Share → "Add to Home Screen"

### QR Code:
Generate at: https://www.qr-code-generator.com/
URL: https://ayurveda-clinic.pages.dev/pwa

---

## 🔄 ROLLBACK (If Needed)

If deployment has issues:

### View Deployment History:
```bash
npx wrangler pages deployment list --project-name ayurveda-clinic
```

### Rollback to Previous:
```bash
npx wrangler pages deployment rollback DEPLOYMENT_ID --project-name ayurveda-clinic
```

### Or via Dashboard:
1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → ayurveda-clinic → Deployments
3. Click previous deployment → "Rollback to this deployment"

---

## 🎯 RECOMMENDED METHOD

**For your situation, I recommend METHOD 3 (GitHub Auto-Deploy):**

✅ One-time 5-minute setup
✅ No API token headaches
✅ Deploy by just pushing code
✅ Automatic builds on every commit
✅ Preview deployments for branches
✅ Easy rollbacks
✅ Professional workflow

**Setup GitHub integration once, never worry about deployment again!**

---

## 📞 NEXT STEPS

Choose ONE method:

1. **"Use Method 1"** - I'll guide you through local deployment
2. **"Use Method 2"** - I'll help you get a valid API token
3. **"Use Method 3"** - I'll guide you through GitHub setup (RECOMMENDED)

---

**Which method would you like to use?** 🚀
