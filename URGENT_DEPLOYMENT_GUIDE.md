# 🚨 URGENT: TPS Dhanvantari Ayurveda - Deployment Guide

## Issue Status: ✅ **VERIFIED - NO BUG EXISTS**

The Patient View mode is **already correctly implemented**. No code changes needed.

See: [PATIENT_VIEW_MODE_VERIFICATION.md](./PATIENT_VIEW_MODE_VERIFICATION.md) for full details.

---

## Current Deployment Status

### What's Ready:
- ✅ Mobile responsive design (3-dot menu, full-width layout)
- ✅ Patient view-only mode correctly implemented
- ✅ All features tested and working
- ✅ Build completed: dist/_worker.js (146.29 kB)
- ✅ Code pushed to GitHub: https://github.com/ekodecrux/ayurvedatps

### What Needs Deployment:
- 🔄 Production server (88.222.244.84) serving wrong app (MySchool chatbot)
- 🔄 Need to upload built files to production

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Quick SSH Deployment (RECOMMENDED)

**Copy and paste this complete script:**

```bash
ssh root@88.222.244.84 << 'ENDSSH'
cd /var/www/ayurveda

# 1. Backup existing files
echo "📦 Backing up current files..."
mkdir -p backups
if [ -f dist/_worker.js ]; then
  cp dist/_worker.js backups/_worker.js.$(date +%Y%m%d-%H%M%S)
fi

# 2. Create directories
mkdir -p dist/static

# 3. Download files from GitHub
echo "⬇️ Downloading from GitHub..."
curl -L -o dist/_worker.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js
curl -L -o dist/_routes.json https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_routes.json
curl -L -o dist/static/app.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js
curl -L -o dist/static/styles.css https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css

# 4. Create ecosystem.config.cjs if missing
if [ ! -f ecosystem.config.cjs ]; then
  echo "📝 Creating PM2 config..."
  cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ayurveda-clinic',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3001',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
EOF
fi

# 5. Restart service
echo "🔄 Restarting service..."
pm2 delete ayurveda-clinic 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

pm2 start ecosystem.config.cjs
pm2 save

# 6. Wait and check
sleep 3
pm2 status ayurveda-clinic

# 7. Test
echo ""
echo "🧪 Testing service..."
if curl -s http://localhost:3001/ | head -30 | grep -i "dhanvantari\|ayurveda" > /dev/null; then
  echo "✅ SUCCESS: TPS Dhanvantari Ayurveda is running!"
else
  echo "❌ WARNING: Service may not be running correctly"
  echo "Logs:"
  pm2 logs ayurveda-clinic --nostream --lines 10
fi

echo ""
echo "🎉 Deployment Complete!"
echo "Test: https://tpsdhanvantariayurveda.in"
ENDSSH
```

**Password when prompted:** `Yourkpo@202425`

---

### Option 2: Manual SFTP Upload

**Use WinSCP or FileZilla:**

1. **Connection:**
   - Host: 88.222.244.84
   - Port: 22
   - User: root
   - Password: Yourkpo@202425

2. **Upload these files:**
   - Local: `/home/user/webapp/dist/_worker.js` → Remote: `/var/www/ayurveda/dist/_worker.js`
   - Local: `/home/user/webapp/dist/static/app.js` → Remote: `/var/www/ayurveda/dist/static/app.js`
   - Local: `/home/user/webapp/public/static/styles.css` → Remote: `/var/www/ayurveda/dist/static/styles.css`
   - Local: `/home/user/webapp/dist/_routes.json` → Remote: `/var/www/ayurveda/dist/_routes.json`

3. **SSH to server and restart:**
   ```bash
   ssh root@88.222.244.84
   cd /var/www/ayurveda
   pm2 delete ayurveda-clinic
   fuser -k 3001/tcp
   pm2 start ecosystem.config.cjs
   pm2 save
   ```

---

### Option 3: Alternative Tar.gz Upload

**Package is ready:** `tps-ayurveda-deployment-20260104-194716.tar.gz` (172K)

**Steps:**
1. Download package from sandbox (contact support)
2. Upload to `/var/www/ayurveda/` via SFTP
3. SSH to server:
   ```bash
   ssh root@88.222.244.84
   cd /var/www/ayurveda
   tar -xzf tps-ayurveda-deployment-20260104-194716.tar.gz
   pm2 restart ayurveda-clinic
   ```

---

## 🧪 POST-DEPLOYMENT VERIFICATION

### 1. Check Service Status
```bash
ssh root@88.222.244.84
pm2 status ayurveda-clinic
# Should show: status: online, uptime: 0s
```

### 2. Test Localhost
```bash
curl http://localhost:3001/ | head -30 | grep -i "TPS DHANVANTARI"
# Should output HTML with "TPS DHANVANTARI AYURVEDA"
```

### 3. Browser Tests

**Desktop:**
1. Open: https://tpsdhanvantariayurveda.in
2. Clear cache: Ctrl+Shift+Delete
3. Login: Shankaranherbaltreatment@gmail.com / 123456
4. Verify: Green header with "TPS DHANVANTARI AYURVEDA"
5. Test: Patients → Click "View" (eye icon) on any patient
6. Verify: Modal title "View Patient Details"
7. Verify: All fields disabled, Save button hidden

**Mobile:**
1. Open DevTools: F12
2. Toggle device mode: Ctrl+Shift+M
3. Select: iPhone 12 Pro
4. Hard refresh: Ctrl+Shift+R
5. Verify: 3-dot menu (⋮) in top-right
6. Tap 3-dot menu
7. Verify: Menu slides in from right with all nav items
8. Test: Patients → Export buttons in 3 columns
9. Verify: No whitespace gaps on right/bottom

---

## 📋 TEST CHECKLIST

### Patient View Mode (Priority):
- [ ] Click "View" button (eye icon) on patient list
- [ ] Modal title shows "View Patient Details"
- [ ] All input fields are disabled (grayed out)
- [ ] Save button is hidden
- [ ] "Add Disease" button is disabled
- [ ] "Add Phone" button is disabled
- [ ] All "Remove" buttons are hidden
- [ ] Close button works
- [ ] Click "Edit" button to verify fields become editable

### Mobile Responsiveness:
- [ ] 3-dot menu visible on mobile (≤1024px)
- [ ] Menu slides in from right when tapped
- [ ] All navigation items visible in menu
- [ ] Export buttons in 3-column layout
- [ ] No whitespace gaps
- [ ] All buttons ≥44px (touch-friendly)
- [ ] Content fills screen width

---

## 🛟 TROUBLESHOOTING

### Issue: Still showing MySchool chatbot
**Solution:**
```bash
ssh root@88.222.244.84
cat /var/www/ayurveda/dist/_worker.js | head -100 | grep -i "myschool\|chatbot"
# If found, files weren't uploaded correctly. Re-download from GitHub.
```

### Issue: PM2 process not starting
**Solution:**
```bash
pm2 logs ayurveda-clinic --nostream --lines 50
# Check for errors. Common issues:
# - Port 3001 already in use: fuser -k 3001/tcp
# - Wrangler not installed: npm install -g wrangler
```

### Issue: 404 errors on page
**Solution:**
```bash
ls -lh /var/www/ayurveda/dist/_worker.js
ls -lh /var/www/ayurveda/dist/static/app.js
# Verify files exist and have reasonable sizes (~146KB and ~141KB)
```

---

## 📞 SUPPORT INFORMATION

- **GitHub:** https://github.com/ekodecrux/ayurvedatps
- **Latest Commit:** 18638ee
- **Version:** v2.5.1
- **Production URL:** https://tpsdhanvantariayurveda.in
- **Direct IP:** http://88.222.244.84:3001
- **Login:** Shankaranherbaltreatment@gmail.com / 123456

---

## 📝 DEPLOYMENT LOG

| Date | Action | Status | Notes |
|------|--------|--------|-------|
| 2026-01-04 | Mobile responsive design | ✅ Complete | 3-dot menu, full-width layout |
| 2026-01-04 | Patient view mode verification | ✅ Verified | No bug - already correctly implemented |
| 2026-01-04 | Build completed | ✅ Complete | dist/_worker.js 146.29 kB |
| 2026-01-04 | Code pushed to GitHub | ✅ Complete | Commit 18638ee |
| 2026-01-04 | Awaiting production deploy | 🔄 Pending | Need SSH access or SFTP |

---

## 🎯 SUMMARY

**Status:** Code is ready, tested, and pushed to GitHub. Implementation is correct.

**Action Required:** Upload built files to production server using one of the three deployment options above.

**Expected Result:** 
- ✅ TPS Dhanvantari Ayurveda app running
- ✅ Patient view mode working correctly (read-only)
- ✅ Mobile responsive with 3-dot menu
- ✅ No MySchool chatbot

**Time Estimate:** 5-10 minutes

---

**Need Help?** Refer to the troubleshooting section or check PM2 logs.
