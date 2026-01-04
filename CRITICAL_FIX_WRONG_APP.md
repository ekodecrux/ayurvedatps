# 🚨 CRITICAL FIX - Wrong Application Being Served

## Problem
The server at https://tpsdhanvantariayurveda.in is serving a **MySchool AI Assistant** chatbot instead of the **TPS DHANVANTARI AYURVEDA** clinic management system.

This is a deployment error - the wrong `_worker.js` file is being served.

---

## 🔥 IMMEDIATE FIX REQUIRED

### Step 1: Connect to Server
```bash
ssh root@88.222.244.84
```
Password: `Yourkpo@202425`

### Step 2: Check Current Files
```bash
cd /var/www/ayurveda
ls -lh dist/_worker.js
head -20 dist/_worker.js
```

### Step 3: Download CORRECT Files from GitHub
```bash
cd /var/www/ayurveda

# Backup the wrong file
mv dist/_worker.js dist/_worker.js.wrong.backup

# Download the CORRECT TPS Dhanvantari Ayurveda app
curl -L -o dist/_worker.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js

# Also update app.js
curl -L -o dist/static/app.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js

# And styles
curl -L -o dist/static/styles.css https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css
```

### Step 4: Verify Downloaded Files
```bash
# Check file size (should be ~146KB)
ls -lh dist/_worker.js

# Check content (should say TPS DHANVANTARI AYURVEDA)
head -30 dist/_worker.js | grep -i "dhanvantari\|ayurveda\|clinic"
```

### Step 5: Restart PM2
```bash
pm2 restart ayurveda-clinic
pm2 logs ayurveda-clinic --nostream --lines 20
```

### Step 6: Clear Nginx Cache (if applicable)
```bash
# Check if nginx is caching
systemctl status nginx

# Reload nginx
nginx -t && nginx -s reload
```

### Step 7: Test
```bash
curl http://localhost:3001/ | head -20
```

Should show: `TPS DHANVANTARI AYURVEDA` NOT `MySchool`

---

## 🎯 Complete One-Command Fix

Copy-paste this entire command:

```bash
ssh root@88.222.244.84 << 'ENDSSH'
cd /var/www/ayurveda
echo "🚨 FIXING DEPLOYMENT - Removing MySchool chatbot..."
mv dist/_worker.js dist/_worker.js.wrong.backup
echo "⬇️ Downloading CORRECT TPS Dhanvantari Ayurveda files..."
curl -L -s -o dist/_worker.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js
curl -L -s -o dist/static/app.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js
curl -L -s -o dist/static/styles.css https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css
echo "📊 File sizes:"
ls -lh dist/_worker.js dist/static/app.js
echo "🔍 Verifying content..."
head -30 dist/_worker.js | grep -i "ayurveda" && echo "✅ CORRECT: TPS Dhanvantari file detected!" || echo "❌ WRONG: Still wrong file!"
echo "🔄 Restarting PM2..."
pm2 restart ayurveda-clinic
sleep 2
pm2 status ayurveda-clinic
echo "🧪 Testing..."
curl -s http://localhost:3001/ | head -20 | grep -i "ayurveda" && echo "✅ SUCCESS!" || echo "❌ Still serving wrong app!"
echo "✅ Fix complete! Test at: https://tpsdhanvantariayurveda.in"
ENDSSH
```

---

## 🔍 Root Cause Analysis

The issue is likely one of:

1. **Wrong project directory**: The app is being served from a MySchool project folder
2. **Wrong _worker.js**: The Cloudflare Worker file is from the wrong project
3. **Nginx misconfiguration**: Nginx is proxying to the wrong backend
4. **PM2 pointing to wrong script**: The PM2 process is running the wrong application

---

## ✅ Verification After Fix

### 1. Check Homepage
```bash
curl https://tpsdhanvantariayurveda.in/ | grep -i "dhanvantari"
```

Should return: `TPS DHANVANTARI AYURVEDA`

### 2. Check in Browser
1. Open: https://tpsdhanvantariayurveda.in
2. Clear cache: Ctrl+Shift+R
3. Should see: **TPS DHANVANTARI AYURVEDA** header
4. Should see: Login form or Dashboard
5. Should NOT see: MySchool AI Assistant

### 3. Login Test
- Email: Shankaranherbaltreatment@gmail.com
- Password: 123456

Should show: Dashboard with patients, appointments, etc.

---

## 🚨 If Fix Doesn't Work

### Check PM2 Configuration
```bash
ssh root@88.222.244.84
cd /var/www/ayurveda
cat ecosystem.config.cjs
```

Should show:
```javascript
name: 'ayurveda-clinic',
script: './start-app.sh' or 'wrangler pages dev dist'
cwd: '/var/www/ayurveda'
```

### Check what PM2 is running
```bash
pm2 describe ayurveda-clinic
```

### Check Nginx config
```bash
cat /etc/nginx/sites-available/tpsdhanvantari
```

Should show:
```
server_name tpsdhanvantariayurveda.in;
proxy_pass http://127.0.0.1:3001;
```

---

## 📞 Support

This is a critical deployment error. The correct TPS Dhanvantari Ayurveda application files are in:
- **GitHub**: https://github.com/ekodecrux/ayurvedatps
- **Commit**: 248edd3

The MySchool chatbot should NOT be there.

---

## 🎯 Summary

**Problem**: Wrong application (MySchool chatbot) being served
**Cause**: Wrong `_worker.js` file deployed
**Fix**: Download correct files from GitHub and restart PM2
**Time**: ~2 minutes

**Run the One-Command Fix above to resolve immediately!** 🚀
