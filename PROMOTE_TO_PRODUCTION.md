# Promote Preview Deployment to Production

## Problem
- Deployments are showing as "Preview" instead of "Production"
- Custom domain (tpsdhanvantariayurveda.com) is not working
- App only works on preview URLs (like herbs-routes-working.ayurveda-clinic.pages.dev)

## Why This Happens
When deploying via `wrangler pages deploy` without Git integration:
- Deployments go to "Preview" environment by default
- Custom domains only work with "Production" deployments
- You need to manually promote Preview → Production

---

## ✅ Solution 1: Promote via Cloudflare Dashboard (EASIEST)

### Steps:

1. **Go to Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com/
   - Login with your account

2. **Navigate to Your Pages Project**
   - Click **Workers & Pages**
   - Click **ayurveda-clinic**

3. **Go to Deployments Tab**
   - You'll see a list of deployments
   - Find the most recent one (at the top)
   - It should show **"Preview"** badge

4. **Promote to Production**
   - Click on the deployment (the one with Preview badge)
   - Look for **"Promote to Production"** button
   - Click it
   - Confirm the promotion

5. **Wait 2-3 Minutes**
   - The deployment will be promoted to production
   - Your custom domain will start working
   - You'll see a **"Production"** badge on that deployment

### Visual Guide:
```
Deployments Tab
├── Latest Deployment (Preview) ← Click this
│   ├── View Details
│   ├── Deployment ID: xxxxx
│   └── [Promote to Production] ← Click this button
```

---

## ✅ Solution 2: Deploy Directly to Production (CLI)

Instead of promoting, deploy directly to production with `--branch main`:

```bash
# Build the app
npm run build

# Deploy to production (not preview)
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main
```

The `--branch main` flag tells Cloudflare to deploy to **production** instead of preview.

---

## ✅ Solution 3: Connect to GitHub (RECOMMENDED for Future)

This is the best long-term solution - automatic deployments on every push.

### Steps:

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com/
   - Workers & Pages → ayurveda-clinic

2. **Connect to Git**
   - Go to **Settings** tab
   - Look for **"Connect to Git"** or **"Source"** section
   - Click **"Connect repository"**

3. **Authorize GitHub**
   - Select **GitHub**
   - Authorize Cloudflare Pages to access your GitHub
   - Select repository: **ekodecrux/ayurvedatps**
   - Select branch: **main** (as production branch)

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave empty or `/`)
   - Click **Save**

5. **Automatic Deployments**
   - Every time you push to `main` branch → Production deployment
   - Every time you push to other branches → Preview deployment
   - No need to manually deploy anymore!

---

## 🧪 After Promoting to Production

### Test These URLs:

1. **Production URL (should work now)**:
   ```
   https://ayurveda-clinic.pages.dev
   ```

2. **Custom Domain (should work after SSL is fixed)**:
   ```
   https://tpsdhanvantariayurveda.com
   https://www.tpsdhanvantariayurveda.com
   ```

3. **Login Credentials**:
   - Email: tpsdhanvantari@gmail.com
   - Password: 123456

### Check Deployment Status:
```bash
npx wrangler pages deployment list --project-name ayurveda-clinic
```

You should see:
- **Production** deployment (promoted one)
- **Preview** deployments (older ones)

---

## 🔍 How to Verify

### In Cloudflare Dashboard:

1. **Check Production Deployment**:
   - Workers & Pages → ayurveda-clinic → Deployments
   - Top deployment should have **"Production"** badge
   - URL should be: `https://ayurveda-clinic.pages.dev`

2. **Check Custom Domains**:
   - Workers & Pages → ayurveda-clinic → Custom domains
   - Should show: `tpsdhanvantariayurveda.com` with **"Active"** status

### Via CLI:
```bash
# List deployments
npx wrangler pages deployment list --project-name ayurveda-clinic

# You should see something like:
# Production: <deployment-id> (https://ayurveda-clinic.pages.dev)
# Preview: <deployment-id> (https://xxx.ayurveda-clinic.pages.dev)
```

---

## 🎯 Quick Action Plan

### Option A: Promote Existing Deployment (FASTEST - 2 minutes)
1. Dashboard → ayurveda-clinic → Deployments
2. Click latest deployment
3. Click "Promote to Production"
4. Wait 2 minutes
5. Test: https://ayurveda-clinic.pages.dev

### Option B: Deploy with Production Flag (5 minutes)
```bash
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main
```

### Option C: Connect to GitHub (10 minutes, best long-term)
1. Dashboard → ayurveda-clinic → Settings
2. Connect to Git → GitHub → ekodecrux/ayurvedatps
3. Set production branch: main
4. Save
5. Push to GitHub triggers auto-deploy

---

## 📊 Understanding Deployments

### Preview vs Production:

| Type | URL Pattern | When Used | Custom Domain |
|------|-------------|-----------|---------------|
| **Production** | `https://ayurveda-clinic.pages.dev` | Main branch / Promoted | ✅ Works |
| **Preview** | `https://xxx.ayurveda-clinic.pages.dev` | Other branches / Direct deploy | ❌ Doesn't work |

### Custom Domain Behavior:
- ✅ Custom domains (tpsdhanvantariayurveda.com) **only** point to **Production**
- ❌ Custom domains **do not** point to **Preview** deployments
- 🔧 That's why your domain isn't working - deployment is in Preview mode!

---

## 🆘 Still Not Working?

After promoting to production, if it still doesn't work:

1. **Check deployment status**:
   ```bash
   npx wrangler pages deployment list --project-name ayurveda-clinic
   ```

2. **Check D1 binding**:
   - Dashboard → ayurveda-clinic → Settings → Functions
   - Ensure D1 binding exists: `DB` → `ayurveda-db-prod`

3. **Redeploy to production**:
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name ayurveda-clinic --branch main
   ```

---

## 📚 Summary

**The Issue**: Deployments are in Preview mode, not Production  
**The Fix**: Promote to Production (or deploy with `--branch main`)  
**The Result**: Custom domain will work, app will be live

**Start with Option A (Dashboard → Promote to Production) - it's the fastest!**
