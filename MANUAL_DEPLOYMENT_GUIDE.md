# 🚀 Manual Deployment Guide - TPS DHANVANTARI v2.3.0

## 📦 Deployment Package

**Download**: https://www.genspark.ai/api/files/s/1RCHQ6JI  
**Size**: 4.0 MB  
**Version**: v2.3.0  
**Status**: ✅ 100% Working (Verified in Sandbox)

---

## 🎯 Quick Deployment (5 Minutes)

### **Step 1: Download & Extract**

```bash
# Download the package
wget https://www.genspark.ai/api/files/s/1RCHQ6JI -O deployment.tar.gz

# Extract
tar -xzf deployment.tar.gz
cd home/user/webapp
```

### **Step 2: Login to Cloudflare**

1. Go to: https://dash.cloudflare.com
2. Login with: **parimi.prasad@gmail.com**
3. Navigate: **Workers & Pages** → **ayurveda-clinic**

### **Step 3: Create Deployment**

1. Click **"Create deployment"** button
2. **Upload Method**: Choose "Direct Upload"
3. **Upload Files**: 
   - Select the entire `dist/` folder OR
   - Upload individual files:
     - `dist/_worker.js` (139.80 KB)
     - `dist/_routes.json`
     - `dist/static/app.js`
     - `dist/static/styles.css`
     - `dist/static/manifest.json`
     - `dist/static/sw.js`
     - `dist/static/icons/` (all icon files)

### **Step 4: Deploy**

1. Click **"Save and Deploy"**
2. Wait 10-30 seconds for deployment
3. You'll see: **"Deployment successful"**

### **Step 5: Verify**

Visit your production URLs:
- **Primary**: https://tpsdhanvantariayurveda.com
- **Cloudflare Pages**: https://ayurveda-clinic.pages.dev

**Login**: admin@tpsdhanvantari.com / admin123

---

## 🔧 Alternative: Using Cloudflare Dashboard Upload

### **Method 1: Drag & Drop**

1. Go to: https://dash.cloudflare.com
2. Navigate: **Workers & Pages** → **ayurveda-clinic** → **Deployments**
3. Click **"Create deployment"**
4. **Drag the `dist/` folder** into the upload area
5. Click **"Deploy"**

### **Method 2: Wrangler CLI (If you have it locally)**

If you have Node.js and wrangler installed on your local machine:

```bash
# Extract the package
tar -xzf deployment.tar.gz
cd home/user/webapp

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

---

## ✅ What's Included (v2.3.0)

### **Features**
- ✅ Side-by-side medicine schedule (Before/After columns)
- ✅ Additional phone numbers (View/Edit/Print)
- ✅ Full address fields (8 fields, View/Edit/Print)
- ✅ Edit loads current data
- ✅ Checkbox toggles quantity dropdowns
- ✅ All CRUD operations
- ✅ CSV/Excel/PDF exports
- ✅ PWA offline mode
- ✅ Service Worker v2.3.0
- ✅ Cache-busting (app.js?v=2.3.0)

### **Technical Stack**
- **Framework**: Hono v4.0.0
- **Runtime**: Cloudflare Workers
- **Build**: Vite 6.4.1
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (if needed)

---

## 🔗 URLs & Credentials

### **Production URLs**
- **Primary Domain**: https://tpsdhanvantariayurveda.com
- **Cloudflare Pages**: https://ayurveda-clinic.pages.dev
- **Branch Deployment**: https://herbs-routes-working.ayurveda-clinic.pages.dev

### **Login Credentials**
- **Email**: admin@tpsdhanvantari.com
- **Password**: admin123

### **Sandbox (Reference)**
- **URL**: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai
- **Status**: ✅ Working perfectly
- **Use**: For testing before production deployment

---

## 🧪 Testing Checklist

After deployment, test these features:

### **1. Basic Access**
- [ ] Production URL loads
- [ ] Login works
- [ ] Dashboard shows stats

### **2. Patient Management**
- [ ] Add new patient
- [ ] Add additional phone numbers (multiple)
- [ ] Fill all address fields (8 fields)
- [ ] Save patient
- [ ] Edit patient (loads all data correctly)
- [ ] View patient (shows phones & address)
- [ ] Print patient (shows phones & address)

### **3. Herbs & Routes**
- [ ] Create new prescription
- [ ] Add medicine
- [ ] Medicine Schedule shows **side-by-side** (Before | After)
- [ ] Check dosage checkbox → dropdown enables
- [ ] Select quantity (1-5)
- [ ] Uncheck dosage → dropdown disables
- [ ] Save prescription
- [ ] Edit prescription (loads current data)
- [ ] View prescription (shows all medicines correctly)
- [ ] Print prescription (matches view)

### **4. Exports**
- [ ] Export patients to CSV
- [ ] Export patients to Excel
- [ ] Export prescriptions to PDF

### **5. Technical**
- [ ] Service Worker v2.3.0 active
- [ ] app.js?v=2.3.0 loaded
- [ ] No console errors
- [ ] D1 database connected
- [ ] Offline mode works (PWA)

---

## ⚠️ Important Notes

### **Cache Clearing**
After deployment, users need to **clear browser cache**:
- **Windows/Linux**: Ctrl+Shift+R
- **Mac**: Cmd+Shift+R
- **Alternative**: Open in Incognito mode

### **Database Migration**
The D1 database should already be set up with:
- **Database ID**: 7ce3cb22-22c5-42e1-87f7-d53b533df18c
- **Binding**: DB
- **Environment**: Production

If you need to run migrations:
```bash
npx wrangler d1 migrations apply ayurveda-clinic-production
```

### **Environment Variables**
No additional environment variables needed for basic deployment.

---

## 🆘 Troubleshooting

### **Issue: Deployment Shows "Authentication Error"**
**Solution**: Use manual upload via Cloudflare Dashboard instead of CLI.

### **Issue: Site Shows Old Version**
**Solution**: 
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Open in Incognito mode

### **Issue: Additional Phones Not Showing**
**Solution**: This was a cache issue. After clearing cache, it works.

### **Issue: Medicine Schedule Not Side-by-Side**
**Solution**: v2.3.0 fixed this. Clear cache to see the update.

### **Issue: D1 Database Not Connected**
**Solution**: 
1. Go to Cloudflare Dashboard
2. Workers & Pages → ayurveda-clinic → Settings → Bindings
3. Verify D1 binding:
   - Variable name: DB
   - D1 database: ayurveda-clinic-production
   - Database ID: 7ce3cb22-22c5-42e1-87f7-d53b533df18c

---

## 📞 Support

If you encounter issues:

1. **Check Sandbox First**: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai
   - If sandbox works but production doesn't → deployment issue
   - If both don't work → code issue

2. **Check Browser Console**: F12 → Console tab
   - Look for JavaScript errors
   - Check Network tab for failed requests

3. **Check Cloudflare Logs**:
   - Dashboard → Workers & Pages → ayurveda-clinic → Logs
   - Look for deployment errors or runtime errors

---

## 🎉 Success Indicators

After successful deployment, you should see:

✅ Production URL loads instantly  
✅ Login works  
✅ Dashboard shows patient stats  
✅ Side-by-side medicine schedule layout  
✅ Additional phones in View/Print  
✅ Full address in View/Print  
✅ Edit loads all current data  
✅ No JavaScript console errors  
✅ Service Worker v2.3.0 installed  
✅ Fast page loads (cached by SW)  

---

## 📁 Package Contents

```
home/user/webapp/
├── dist/                          # Production build (DEPLOY THIS)
│   ├── _worker.js                 # Main application (139.80 KB)
│   ├── _routes.json               # Routing config
│   └── static/                    # Static assets
│       ├── app.js                 # Frontend JavaScript
│       ├── styles.css             # Custom styles
│       ├── manifest.json          # PWA manifest
│       ├── sw.js                  # Service Worker v2.3.0
│       └── icons/                 # App icons
├── src/                           # Source code (reference only)
├── migrations/                    # D1 database migrations
├── wrangler.jsonc                 # Cloudflare config
├── package.json                   # Dependencies
└── README.md                      # Project documentation
```

---

## 🚀 Quick Summary

1. **Download**: https://www.genspark.ai/api/files/s/1RCHQ6JI
2. **Extract**: `tar -xzf deployment.tar.gz`
3. **Login**: https://dash.cloudflare.com
4. **Upload**: `dist/` folder to ayurveda-clinic project
5. **Test**: https://tpsdhanvantariayurveda.com
6. **Done!** 🎉

**Deployment Time**: ~5 minutes  
**Status**: Production Ready  
**Version**: v2.3.0  
**Tested**: ✅ Working in Sandbox

---

## 📝 Deployment Log

**Date**: January 2, 2026  
**Version**: v2.3.0  
**Build**: dist/_worker.js (139.80 KB)  
**Sandbox**: ✅ Verified Working  
**Production**: ⏳ Awaiting Manual Deployment  
**Method**: Manual upload via Cloudflare Dashboard  
**Reason**: API token timeout issues, manual deployment recommended  

---

**Questions?** Check the sandbox first to see how it should work: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai
