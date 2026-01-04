# 🚨 CRITICAL: MySchool Still Showing - Complete Fix Guide

## Problem
After attempting deployment, the website still shows **MySchool AI Assistant** instead of **TPS DHANVANTARI AYURVEDA**.

---

## 🎯 COMPLETE FIX - Run These Commands

### **Option 1: Complete Rebuild (RECOMMENDED)**

Copy and paste this entire block into your terminal:

```bash
ssh root@88.222.244.84 << 'ENDSCRIPT'
#!/bin/bash
set -e

echo "🚀 COMPLETE REBUILD - TPS Dhanvantari Ayurveda"
echo "=============================================="

cd /var/www/ayurveda

# Stop everything
echo "Stopping services..."
pm2 delete ayurveda-clinic 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 3

# Backup old files
echo "Backing up old files..."
mkdir -p backups
mv dist backups/dist.old.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Recreate dist structure
echo "Creating fresh dist directory..."
mkdir -p dist/static

# Download correct files
echo "Downloading TPS Dhanvantari Ayurveda files..."
curl -L -f -o dist/_worker.js \
  https://raw.githubusercontent.com/ekodecrux/ayurvedatps/afb5917/dist/_worker.js

curl -L -f -o dist/static/app.js \
  https://raw.githubusercontent.com/ekodecrux/ayurvedatps/afb5917/dist/static/app.js

curl -L -f -o dist/static/styles.css \
  https://raw.githubusercontent.com/ekodecrux/ayurvedatps/afb5917/public/static/styles.css

# Verify files
echo ""
echo "Downloaded files:"
ls -lh dist/_worker.js dist/static/app.js dist/static/styles.css

# Check content
echo ""
echo "Verifying content..."
if grep -qi "dhanvantari\|ayurveda" dist/_worker.js; then
  echo "✅ Correct TPS Dhanvantari app!"
else
  echo "❌ Wrong file downloaded!"
  exit 1
fi

# Create/verify ecosystem config
echo ""
echo "Setting up PM2 config..."
cat > ecosystem.config.cjs << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'ayurveda-clinic',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3001',
    cwd: '/var/www/ayurveda',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOFPM2

# Start service
echo ""
echo "Starting PM2 service..."
pm2 start ecosystem.config.cjs
pm2 save
sleep 5

# Test
echo ""
echo "Testing service..."
pm2 status ayurveda-clinic

if curl -s http://localhost:3001/ | grep -qi "dhanvantari"; then
  echo ""
  echo "✅ SUCCESS! TPS Dhanvantari is running!"
else
  echo ""
  echo "❌ Service started but still wrong app. Checking logs..."
  pm2 logs ayurveda-clinic --nostream --lines 20
  exit 1
fi

# Fix nginx
echo ""
echo "Reloading nginx..."
rm -f /etc/nginx/sites-enabled/demo.myschoolchatbot.in 2>/dev/null || true
nginx -t && systemctl reload nginx

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "Test at: https://tpsdhanvantariayurveda.in"
echo "Clear browser cache: Ctrl+Shift+Delete"
echo ""

ENDSCRIPT
```

---

### **Option 2: Diagnose First, Then Fix**

If Option 1 doesn't work, diagnose the issue first:

```bash
# Step 1: Connect and diagnose
ssh root@88.222.244.84

# Step 2: Run diagnosis
cd /var/www/ayurveda
pm2 list
head -30 dist/_worker.js
ls -la dist/

# Step 3: Check what's running
curl http://localhost:3001/ | head -30

# Step 4: Check PM2 logs
pm2 logs ayurveda-clinic --nostream --lines 30
```

Share the output and I'll help debug further.

---

## 🔍 Common Issues and Fixes

### **Issue 1: _worker.js is still MySchool content**

**Check:**
```bash
ssh root@88.222.244.84
head -30 /var/www/ayurveda/dist/_worker.js
```

**If it shows MySchool HTML:**
```bash
cd /var/www/ayurveda
rm dist/_worker.js
curl -L -o dist/_worker.js \
  https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js
pm2 restart ayurveda-clinic
```

---

### **Issue 2: PM2 is running from wrong directory**

**Check:**
```bash
pm2 describe ayurveda-clinic | grep cwd
```

**Should show:** `cwd: /var/www/ayurveda`

**If wrong:**
```bash
pm2 delete ayurveda-clinic
cd /var/www/ayurveda
pm2 start ecosystem.config.cjs
```

---

### **Issue 3: Multiple PM2 processes running**

**Check:**
```bash
pm2 list
```

**If you see multiple ayurveda or myschool processes:**
```bash
pm2 delete all
cd /var/www/ayurveda
pm2 start ecosystem.config.cjs
pm2 save
```

---

### **Issue 4: Nginx caching old content**

**Clear nginx cache:**
```bash
systemctl stop nginx
rm -rf /var/cache/nginx/*
systemctl start nginx
```

---

### **Issue 5: Browser caching**

**Clear browser cache:**
1. Press **Ctrl+Shift+Delete** (Chrome/Edge)
2. Select "Cached images and files"
3. Select "All time"
4. Click "Clear data"
5. Close ALL browser windows
6. Open fresh browser window
7. Go to https://tpsdhanvantariayurveda.in
8. Hard refresh: **Ctrl+Shift+R**

---

## 🧪 Verification Steps

After deployment, verify each step:

### **1. Check File on Server**
```bash
ssh root@88.222.244.84
head -50 /var/www/ayurveda/dist/_worker.js | grep -i "ayurveda\|dhanvantari"
```
**Expected:** Should show "Ayurveda" or "Dhanvantari" in the code

### **2. Check Localhost**
```bash
curl -s http://localhost:3001/ | head -50 | grep -i "ayurveda\|dhanvantari"
```
**Expected:** Should show TPS DHANVANTARI AYURVEDA in title

### **3. Check Production Domain**
```bash
curl -s https://tpsdhanvantariayurveda.in/ | head -50 | grep -i "ayurveda\|dhanvantari"
```
**Expected:** Should show TPS DHANVANTARI AYURVEDA in title

### **4. Browser Test**
- URL: https://tpsdhanvantariayurveda.in
- Clear cache and hard refresh
- Should see: Green header "TPS DHANVANTARI AYURVEDA"
- Should NOT see: Pink header "MySchool AI Assistant"

---

## 📊 Download Pre-Built Files Manually

If curl is having issues, download files directly:

1. **Go to GitHub:**
   - https://github.com/ekodecrux/ayurvedatps/tree/main/dist

2. **Download these files:**
   - `_worker.js` (146 KB)
   - `static/app.js` (141 KB)
   - `../public/static/styles.css` (12 KB)

3. **Upload via SFTP:**
   - Use FileZilla, WinSCP, or Cyberduck
   - Server: 88.222.244.84
   - User: root
   - Password: Yourkpo@202425
   - Upload to: `/var/www/ayurveda/dist/`

4. **Restart:**
   ```bash
   ssh root@88.222.244.84
   pm2 restart ayurveda-clinic
   ```

---

## 🆘 If Nothing Works

Run this diagnostic and share the output:

```bash
ssh root@88.222.244.84 << 'ENDDIAG'
echo "=== DIAGNOSTIC REPORT ==="
echo ""
echo "1. PM2 Processes:"
pm2 list
echo ""
echo "2. What's on port 3001:"
netstat -tulpn | grep 3001
echo ""
echo "3. File content:"
head -30 /var/www/ayurveda/dist/_worker.js
echo ""
echo "4. Localhost test:"
curl -s http://localhost:3001/ | head -30
echo ""
echo "5. PM2 logs:"
pm2 logs ayurveda-clinic --nostream --lines 20
echo ""
echo "=== END REPORT ==="
ENDDIAG
```

Share this output and I can provide a specific fix.

---

## 📞 Contact

**GitHub:** https://github.com/ekodecrux/ayurvedatps
**Latest Commit:** afb5917
**Server:** 88.222.244.84:3001
**Domain:** https://tpsdhanvantariayurveda.in

---

## 🎯 Expected Final Result

After successful deployment:

✅ **Homepage shows:** TPS DHANVANTARI AYURVEDA (green header)
✅ **Login page** with clinic branding
✅ **Dashboard** with patient stats
✅ **Mobile responsive** with 3-dot menu
✅ **NO MySchool** chatbot anywhere

**Run Option 1 (Complete Rebuild) above to fix the issue!** 🚀
