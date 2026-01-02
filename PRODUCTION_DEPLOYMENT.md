# 🚀 PRODUCTION DEPLOYMENT GUIDE - TPS DHANVANTARI v2.3.0

## ⚠️ API Token Permissions Issue

The current Cloudflare API token doesn't have the required permissions for automated deployment. You'll need to deploy manually via the Cloudflare Dashboard.

---

## 📦 **DEPLOYMENT PACKAGE READY**

**Download**: https://www.genspark.ai/api/files/s/F6zeablq  
**Version**: 2.3.0  
**Status**: ✅ PRODUCTION READY  
**Features**: Side-by-side medicine schedule, additional phones, address fields

---

## 🔧 **MANUAL DEPLOYMENT STEPS**

### **Step 1: Download and Extract**

1. Download the package: https://www.genspark.ai/api/files/s/F6zeablq
2. Extract the tar.gz file:
   ```bash
   tar -xzf tps-dhanvantari-v2.3.0-final.tar.gz
   cd webapp
   ```

---

### **Step 2: Login to Cloudflare Dashboard**

1. Go to: https://dash.cloudflare.com
2. Login with: parimi.prasad@gmail.com
3. Navigate to: **Workers & Pages** → **Pages**
4. Find project: **ayurveda-clinic**

---

### **Step 3: Create New Deployment**

1. Click on **ayurveda-clinic** project
2. Go to **Deployments** tab
3. Click **Create deployment** button
4. **Upload** the following files from the `dist/` folder:
   - `_worker.js` (139.80 kB)
   - `_routes.json`
   - `static/` folder (all files inside)

---

### **Step 4: Verify D1 Database Binding**

Before deploying, ensure D1 database is bound:

1. In **ayurveda-clinic** project settings
2. Go to **Settings** → **Functions**
3. Check **D1 database bindings**:
   - **Variable name**: `DB`
   - **D1 database**: `ayurveda-db`
   - **Database ID**: `7ce3cb22-22c5-42e1-87f7-d53b533df18c`

4. If not configured, add the binding:
   - Click **Add binding**
   - Variable name: `DB`
   - Select D1 database: `ayurveda-db`
   - Save

---

### **Step 5: Deploy**

1. After uploading files, click **Save and Deploy**
2. Wait for deployment to complete (usually 30-60 seconds)
3. You'll get a deployment URL

---

### **Step 6: Verify Production URLs**

Your production site should be live at:
- **Primary**: https://ayurveda-clinic.pages.dev
- **Custom Domain** (if configured): https://tpsdhanvantariayurveda.com

---

### **Step 7: Test Production Deployment**

1. **Open** the production URL
2. **Clear cache**: `Ctrl + Shift + R` (or `Cmd + Shift + R`)
3. **Login**: admin@tpsdhanvantari.com / admin123
4. **Test** the following:

#### Test Checklist
- [ ] Login works
- [ ] Dashboard loads
- [ ] Patient management (add/edit/view)
- [ ] Additional phone numbers show in View
- [ ] Address fields show in View
- [ ] Herbs & Routes - Side-by-side medicine schedule layout
- [ ] Medicine checkboxes toggle dropdowns
- [ ] Edit loads current data
- [ ] Print shows phones and address
- [ ] CSV/Excel export works

---

## 🔐 **ALTERNATIVE: Fix API Token Permissions**

If you want to enable automated deployments, update your Cloudflare API token permissions:

### Required Permissions
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Edit the API token
3. Add these permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **User** → **User Details** → **Read**
   - **User** → **Memberships** → **Read**
4. Save and update the token

Then you can deploy via CLI:
```bash
cd /home/user/webapp
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

---

## 📊 **DEPLOYMENT VERIFICATION**

After deployment, verify these URLs return the correct version:

### Check Service Worker Version
1. Open production URL
2. Press `F12` → **Application** tab
3. Click **Service Workers**
4. Version should show: `ayurveda-clinic-v2.3.0`

### Check JavaScript Version
1. Press `F12` → **Network** tab
2. Reload page
3. Find `app.js` in network requests
4. URL should show: `app.js?v=2.3.0`

### Test Medicine Schedule Layout
1. Go to **Herbs & Routes** → **New Record**
2. Add medicine
3. Medicine Schedule should show **two columns side-by-side**
4. "Before" on left, "After" on right

---

## 🎯 **WHAT'S DEPLOYED**

### Features
- ✅ Side-by-side Before/After medicine schedule layout
- ✅ Additional phone numbers (add/remove)
- ✅ Detailed address fields (8 fields)
- ✅ View modal shows phones & address
- ✅ Print shows phones & address
- ✅ Edit loads current data
- ✅ Checkbox toggles enable/disable quantity dropdowns
- ✅ All CRUD operations
- ✅ CSV/Excel/PDF export
- ✅ PWA support

### Version Info
- **Version**: 2.3.0
- **Service Worker**: ayurveda-clinic-v2.3.0
- **JavaScript**: app.js?v=2.3.0
- **Build Size**: 139.80 kB (worker)
- **Build Date**: January 2, 2026

---

## 📝 **DATABASE SETUP (If Needed)**

If this is a fresh deployment or database needs setup:

### 1. Apply Migrations (Production)
```bash
npx wrangler d1 migrations apply ayurveda-db
```

### 2. Seed Data (Optional)
```bash
npx wrangler d1 execute ayurveda-db --file=./seed.sql
```

### 3. Verify Database
```bash
npx wrangler d1 execute ayurveda-db --command="SELECT COUNT(*) FROM patients"
```

---

## 🔗 **QUICK REFERENCE**

### URLs
- **Sandbox**: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai
- **Production**: https://ayurveda-clinic.pages.dev
- **Custom**: https://tpsdhanvantariayurveda.com
- **Dashboard**: https://dash.cloudflare.com

### Login Credentials
- **Email**: admin@tpsdhanvantari.com
- **Password**: admin123

### Package
- **Download**: https://www.genspark.ai/api/files/s/F6zeablq
- **Size**: 4.0 MB
- **Version**: 2.3.0

---

## 🚨 **TROUBLESHOOTING**

### Issue: "Authentication error" during deployment
**Solution**: Deploy manually via Cloudflare Dashboard (see steps above)

### Issue: Old layout still showing after deployment
**Solution**: Clear browser cache (`Ctrl + Shift + R`)

### Issue: Database errors in production
**Solution**: Verify D1 binding in Settings → Functions

### Issue: Static files not loading
**Solution**: Ensure `static/` folder uploaded correctly

### Issue: Service Worker not updating
**Solution**: 
1. Unregister old service worker (F12 → Application → Service Workers)
2. Clear cache
3. Hard refresh

---

## ✅ **POST-DEPLOYMENT CHECKLIST**

After deployment completes:

- [ ] Production URL loads successfully
- [ ] Login works
- [ ] Dashboard shows correct data
- [ ] Side-by-side medicine schedule layout visible
- [ ] Additional phones display in View/Print
- [ ] Address fields display in View/Print
- [ ] Edit functionality works
- [ ] CSV/Excel export works
- [ ] Service Worker version is v2.3.0
- [ ] JavaScript version is v2.3.0
- [ ] All features tested and working

---

## 🎉 **DEPLOYMENT SUMMARY**

**Package**: Ready for manual deployment  
**URL**: https://www.genspark.ai/api/files/s/F6zeablq  
**Method**: Manual upload via Cloudflare Dashboard  
**Reason**: API token lacks Pages permissions  
**Status**: ✅ BUILD COMPLETE - READY TO DEPLOY  

**Next Step**: Follow the manual deployment steps above or update API token permissions for automated deployment.

---

**Version 2.3.0 - TPS DHANVANTARI AYURVEDA**  
*Production Ready - Manual Deployment Required* 🚀

