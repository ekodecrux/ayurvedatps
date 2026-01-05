# 🚀 Manual Deployment Steps for Hostinger VPS

## Prerequisites
- SSH access to VPS: root@88.222.244.84
- Git configured on VPS
- Node.js and npm installed
- PM2 installed

---

## Step-by-Step Deployment Process

### Step 1: Connect to VPS
```bash
ssh root@88.222.244.84
```

**Expected Output:**
```
Welcome to Ubuntu...
Last login: ...
```

---

### Step 2: Navigate to Application Directory
```bash
cd /var/www/ayurveda
```

**Verify you're in the right directory:**
```bash
pwd
ls -la
```

**Expected Output:**
```
/var/www/ayurveda
total 48
drwxr-xr-x  8 root root 4096 Jan  5 10:00 .
drwxr-xr-x  3 root root 4096 Jan  3 10:00 ..
drwxr-xr-x  8 root root 4096 Jan  5 10:00 .git
-rw-r--r--  1 root root  123 Jan  5 10:00 package.json
drwxr-xr-x  2 root root 4096 Jan  5 10:00 src
...
```

---

### Step 3: Create Backup (IMPORTANT!)
```bash
mkdir -p backups
```

```bash
cp dist/static/app.js backups/app.js.backup-$(date +%Y%m%d-%H%M%S)
```

**Verify backup was created:**
```bash
ls -lht backups/ | head -3
```

**Expected Output:**
```
total 1.5M
-rw-r--r-- 1 root root 748K Jan  5 14:30 app.js.backup-20260105-143000
-rw-r--r-- 1 root root 745K Jan  4 10:15 app.js.backup-20260104-101500
```

---

### Step 4: Check Git Status
```bash
git status
```

**Expected Output:**
```
On branch main
Your branch is behind 'origin/main' by X commits...
```

---

### Step 5: Pull Latest Changes from GitHub
```bash
git pull origin main
```

**Expected Output:**
```
remote: Enumerating objects: 15, done.
remote: Counting objects: 100% (15/15), done.
remote: Compressing objects: 100% (8/8), done.
remote: Total 10 (delta 7), reused 9 (delta 6), pack-reused 0
Unpacking objects: 100% (10/10), done.
From https://github.com/ekodecrux/ayurvedatps
 * branch            main       -> FETCH_HEAD
   a879b2c..5707452  main       -> origin/main
Updating a879b2c..5707452
Fast-forward
 public/static/app.js | 16 ++++++++++------
 1 file changed, 10 insertions(+), 6 deletions(-)
```

**If there are conflicts:**
```bash
# Stash local changes
git stash

# Pull again
git pull origin main

# If you need local changes back
git stash pop
```

---

### Step 6: Rebuild the Application
```bash
npm run build
```

**Expected Output:**
```
> build
> vite build

vite v6.4.1 building SSR bundle for production...
transforming...
✓ 40 modules transformed.
rendering chunks...
dist/_worker.js  148.12 kB
✓ built in 625ms
```

**Verify build completed:**
```bash
ls -lh dist/static/app.js
```

**Expected Output:**
```
-rw-r--r-- 1 root root 748K Jan  5 14:35 dist/static/app.js
```

---

### Step 7: Restart PM2 Service
```bash
pm2 restart ayurveda-clinic
```

**Expected Output:**
```
Use --update-env to update environment variables
[PM2] Applying action restartProcessId on app [ayurveda-clinic](ids: [ 0 ])
[PM2] [ayurveda-clinic](0) ✓
```

---

### Step 8: Check PM2 Status
```bash
pm2 status
```

**Expected Output:**
```
┌────┬────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name               │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ ayurveda-clinic    │ default     │ N/A     │ fork    │ 12345    │ 5s     │ 1    │ online    │ 0%       │ 75.2mb   │ root     │ disabled │
└────┴────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

**✅ STATUS SHOULD BE: "online"**

---

### Step 9: Check Application Logs
```bash
pm2 logs ayurveda-clinic --lines 20 --nostream
```

**Expected Output:**
```
[TAILING] Tailing last 20 lines for [ayurveda-clinic] process
/root/.pm2/logs/ayurveda-clinic-out-0.log last 20 lines:
0|ayurveda | [wrangler:info] Ready on http://0.0.0.0:3001
0|ayurveda | [wrangler:info] - http://127.0.0.1:3001
0|ayurveda | [wrangler:info] - http://88.222.244.84:3001
```

**✅ LOOK FOR: "Ready on http://0.0.0.0:3001"**

---

### Step 10: Test Application Locally on VPS
```bash
curl -I http://localhost:3001
```

**Expected Output:**
```
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
...
```

**✅ STATUS SHOULD BE: "200 OK"**

---

### Step 11: Test Full Response
```bash
curl http://localhost:3001 | head -20
```

**Expected Output:**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TPS DHANVANTARI AYURVEDA - Management System</title>
    ...
```

---

## ✅ Post-Deployment Verification

### From Your Local Machine:

1. **Test Direct IP:**
   ```bash
   curl -I http://88.222.244.84:3001
   ```

2. **Open in Browser:**
   - Direct IP: http://88.222.244.84:3001
   - Domain: https://tpsdhanvantariayurveda.in/

3. **Login and Test:**
   - Email: Shankaranherbaltreatment@gmail.com
   - Password: 123456

4. **Verify the Fix:**
   - Go to: Herbs & Roots → Add New
   - Add 4 medicines to ONE course
   - Payment: ₹10,000
   - Click View/Print
   - **Verify:** Total = ₹10,000 (NOT ₹40,000) ✅

---

## 🔄 Rollback Procedure (If Needed)

### Step 1: List Available Backups
```bash
cd /var/www/ayurveda
ls -lht backups/ | head -5
```

### Step 2: Copy Backup Name
Example: `app.js.backup-20260105-143000`

### Step 3: Restore Backup
```bash
cp backups/app.js.backup-20260105-143000 dist/static/app.js
```

### Step 4: Restart Service
```bash
pm2 restart ayurveda-clinic
```

### Step 5: Verify Rollback
```bash
pm2 status
curl -I http://localhost:3001
```

---

## 📊 Deployment Checklist

Before deployment:
- [ ] Backed up current version
- [ ] Verified Git repository is accessible
- [ ] Confirmed PM2 is running

During deployment:
- [ ] Git pull successful (no conflicts)
- [ ] Build completed successfully
- [ ] PM2 restart successful
- [ ] Application status shows "online"

After deployment:
- [ ] Application accessible via IP
- [ ] Application accessible via domain
- [ ] Login works correctly
- [ ] Payment fix verified (4 medicines = ₹10,000)
- [ ] No errors in PM2 logs

---

## ❌ Troubleshooting

### Issue 1: Git Pull Fails
```bash
# Check remote
git remote -v

# If authentication fails, re-add remote
git remote remove origin
git remote add origin https://github.com/ekodecrux/ayurvedatps.git
git pull origin main
```

### Issue 2: Build Fails
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue 3: PM2 Shows Status "errored"
```bash
# Check logs for errors
pm2 logs ayurveda-clinic --err --lines 50

# Delete and restart
pm2 delete ayurveda-clinic
pm2 start ecosystem.config.cjs
```

### Issue 4: Port 3001 Already in Use
```bash
# Kill process on port 3001
fuser -k 3001/tcp

# Or stop all PM2 processes
pm2 delete all
pm2 start ecosystem.config.cjs
```

### Issue 5: Application Returns 404
```bash
# Verify dist directory exists
ls -la dist/

# Rebuild if needed
npm run build

# Restart PM2
pm2 restart ayurveda-clinic
```

---

## 📞 Support Information

- **VPS Host:** 88.222.244.84
- **VPS User:** root
- **App Path:** /var/www/ayurveda
- **PM2 App Name:** ayurveda-clinic
- **Production URL:** https://tpsdhanvantariayurveda.in/
- **Direct IP:** http://88.222.244.84:3001
- **GitHub Repo:** https://github.com/ekodecrux/ayurvedatps
- **Backup Package:** https://www.genspark.ai/api/files/s/CgWYQnA7

---

## 🎯 Summary

**Deployment Time:** ~5-10 minutes (manual)
**Downtime:** < 5 seconds (PM2 restart only)
**Risk Level:** LOW (backup created before deployment)
**Rollback Time:** < 1 minute

---

**Version:** v2.5.1 (Critical Payment Fix)
**Date:** January 5, 2026
**Status:** Production Ready

