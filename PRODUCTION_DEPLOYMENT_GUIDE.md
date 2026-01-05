# 🚀 PRODUCTION DEPLOYMENT - v2.5.1 Critical Fix

## ✅ Pre-Deployment Checklist

- [x] Code fixed and tested
- [x] Built successfully (dist/static/app.js ready)
- [x] Committed to GitHub (commit: 78aceeb)
- [x] Backup created
- [x] Documentation complete

---

## 🎯 DEPLOYMENT TO PRODUCTION

### **Method 1: Git Pull (RECOMMENDED)**

This method pulls the latest code from GitHub and rebuilds on the server.

```bash
# Step 1: Connect to your VPS
ssh root@88.222.244.84

# Step 2: Navigate to app directory
cd /var/www/ayurveda

# Step 3: Create backup (IMPORTANT!)
mkdir -p backups
cp dist/static/app.js backups/app.js.backup-$(date +%Y%m%d-%H%M%S)

# Step 4: Pull latest changes from GitHub
git pull origin main

# Step 5: Rebuild the application
npm run build

# Step 6: Restart with zero downtime
pm2 restart ayurveda-clinic

# Step 7: Verify deployment
pm2 status
pm2 logs ayurveda-clinic --lines 20 --nostream

# Step 8: Test the application
curl http://localhost:3001
```

---

### **Method 2: Direct File Transfer (ALTERNATIVE)**

If git pull doesn't work, you can directly transfer the built file:

**From your local machine (if you have the sandbox files):**

```bash
# Download from backup
wget https://www.genspark.ai/api/files/s/CgWYQnA7 -O ayurveda-v2.5.1.tar.gz
tar -xzf ayurveda-v2.5.1.tar.gz
cd webapp

# Transfer the built file
scp dist/static/app.js root@88.222.244.84:/var/www/ayurveda/dist/static/app.js

# Restart the service
ssh root@88.222.244.84 "pm2 restart ayurveda-clinic"
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

After deployment, **IMMEDIATELY** test the fix:

### **Step 1: Test the Application**

1. Open browser: **https://tpsdhanvantariayurveda.in/**
2. Login with: `Shankaranherbaltreatment@gmail.com` / `123456`
3. Go to: **Herbs & Roots** → **Add New**

### **Step 2: Create Test Prescription**

Create a prescription with these details:
- **Patient:** Any test patient
- **Course:** Single course
- **Medicines:** Add **4 medicines** to the same course
- **Payment Details:**
  - Payment Amount: **₹10,000**
  - Advance Payment: **₹2,000**

### **Step 3: Verify the Fix**

Click **"View"** or **"Print"** and verify:

| Field | Expected Value | What to Check |
|-------|----------------|---------------|
| **Total Amount** | ₹10,000 | ✅ NOT ₹40,000 |
| **Advance** | ₹2,000 | ✅ Correct |
| **Balance** | ₹8,000 | ✅ (10,000 - 2,000) |
| **Status** | "Due" | ✅ Since balance > 0 |

### **Step 4: Test Multiple Scenarios**

1. **Single Medicine:** Create course with 1 medicine, ₹10,000
   - Verify: Total = ₹10,000 ✅

2. **Two Courses:** Create 2 separate courses (₹10k and ₹15k)
   - Verify: Total = ₹25,000 ✅

3. **Four Medicines:** Create course with 4 medicines, ₹10,000
   - Verify: Total = ₹10,000 (NOT ₹40,000) ✅

---

## 🔍 MONITORING AFTER DEPLOYMENT

### **Check PM2 Status**

```bash
ssh root@88.222.244.84 "pm2 status"
```

Expected output:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ ayurveda-clinic  │ online  │ X       │ Xs       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

### **Check Application Logs**

```bash
ssh root@88.222.244.84 "pm2 logs ayurveda-clinic --lines 50 --nostream"
```

Look for:
- ✅ No error messages
- ✅ Server started successfully
- ✅ Port 3001 listening

### **Test API Endpoint**

```bash
curl http://88.222.244.84:3001
```

Should return the application HTML (not error message).

---

## 🔄 ROLLBACK PROCEDURE (If Needed)

If something goes wrong, you can quickly rollback:

```bash
# Step 1: Connect to VPS
ssh root@88.222.244.84

# Step 2: Navigate to app
cd /var/www/ayurveda

# Step 3: List available backups
ls -lht backups/

# Step 4: Restore the latest backup
cp backups/app.js.backup-YYYYMMDD-HHMMSS dist/static/app.js

# Step 5: Restart service
pm2 restart ayurveda-clinic

# Step 6: Verify rollback
pm2 status
curl http://localhost:3001
```

---

## 📊 DEPLOYMENT METRICS

| Metric | Value |
|--------|-------|
| **Version** | v2.5.1 |
| **Priority** | 🔴 CRITICAL |
| **Deployment Time** | < 2 minutes |
| **Downtime** | < 5 seconds |
| **Risk Level** | LOW |
| **Files Changed** | 1 (app.js) |
| **Rollback Time** | < 30 seconds |

---

## 🎯 SUCCESS INDICATORS

Your deployment is successful if:

- ✅ PM2 shows status "online"
- ✅ No errors in logs
- ✅ Application loads in browser
- ✅ View/Print shows ₹10,000 (not ₹40,000) for 4 medicines
- ✅ All other features work normally

---

## 📞 SUPPORT RESOURCES

| Resource | Information |
|----------|-------------|
| **Production URL** | https://tpsdhanvantariayurveda.in/ |
| **Direct IP** | http://88.222.244.84:3001 |
| **GitHub Repo** | https://github.com/ekodecrux/ayurvedatps |
| **Latest Commit** | 78aceeb (v2.5.1) |
| **Backup Package** | https://www.genspark.ai/api/files/s/CgWYQnA7 |
| **VPS Host** | 88.222.244.84 |
| **App Path** | /var/www/ayurveda |
| **PM2 App Name** | ayurveda-clinic |

---

## 🎉 DEPLOYMENT COMPLETE!

Once all verification steps pass, your critical fix is live in production!

**What was fixed:**
- ✅ Payment summary no longer multiplies by medicine count
- ✅ Correct per-course payment amounts in View/Print
- ✅ Accurate financial calculations
- ✅ Improved user trust and data integrity

---

**Date:** January 5, 2026  
**Version:** v2.5.1  
**Status:** READY FOR PRODUCTION DEPLOYMENT  
**Priority:** CRITICAL

🚀 **Go ahead and deploy with confidence!**
