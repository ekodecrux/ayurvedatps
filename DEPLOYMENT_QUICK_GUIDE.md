# 🚀 Quick Deployment Guide - Mobile Screen Fit v2.5.1

## ⚡ 5-Minute Deployment

### Prerequisites
- SSH access to: root@88.222.244.84
- Password: `Yourkpo@202425`

---

## 📋 Copy-Paste Commands

### Option 1: One-Line Deployment (Fastest)
```bash
ssh root@88.222.244.84 "cd /var/www/ayurveda && git pull origin main && npm run build && pm2 restart ayurveda-clinic && pm2 status"
```

**Password when prompted**: `Yourkpo@202425`

---

### Option 2: Step-by-Step (Recommended)

#### Step 1: Connect to Server
```bash
ssh root@88.222.244.84
```
**Password**: `Yourkpo@202425`

#### Step 2: Navigate to Project
```bash
cd /var/www/ayurveda
```

#### Step 3: Pull Latest Code
```bash
git pull origin main
```
**Expected**: Files updated or "Already up to date"

#### Step 4: Build Project
```bash
npm run build
```
**Wait**: ~30 seconds
**Expected**: `dist/_worker.js 146.29 kB ✓ built`

#### Step 5: Restart Service
```bash
pm2 restart ayurveda-clinic
```
**Expected**: `status: online`

#### Step 6: Verify
```bash
pm2 logs ayurveda-clinic --nostream --lines 10
```
**Expected**: Server ready on http://88.222.244.84:3001

---

## ✅ Verification Checklist

### After Deployment, Test:

1. **Open in Browser**
   - URL: https://tpsdhanvantariayurveda.in
   - Clear cache: Ctrl+Shift+R

2. **Enable Mobile View**
   - Press F12 (DevTools)
   - Click device icon (Ctrl+Shift+M)
   - Select: iPhone 12 Pro

3. **Check These Features**
   - [ ] 3-dot menu (⋮) visible in top-right
   - [ ] No gaps on right side or bottom
   - [ ] Clicking 3-dot opens menu from right
   - [ ] Menu shows all options (Dashboard, Patients, etc.)
   - [ ] Cards fill full width
   - [ ] Export buttons (CSV, Excel, PDF) in 3 columns

4. **Test Navigation**
   - [ ] Click 3-dot menu
   - [ ] Select "Patients"
   - [ ] Menu closes automatically
   - [ ] Patients page loads

5. **Test Export Buttons**
   - [ ] Go to Patients section
   - [ ] See 3 export buttons in a row
   - [ ] Click CSV button
   - [ ] File download starts

---

## 🐛 Troubleshooting

### Issue: Git pull fails
**Solution**:
```bash
cd /var/www/ayurveda
git status
git stash
git pull origin main
```

### Issue: Build fails
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: PM2 not found
**Solution**:
```bash
npm install -g pm2
cd /var/www/ayurveda
pm2 start ecosystem.config.cjs
```

### Issue: Service won't start
**Solution**:
```bash
# Check what's on port 3001
netstat -tulpn | grep 3001

# Kill any process on port 3001
fuser -k 3001/tcp

# Restart PM2
pm2 restart ayurveda-clinic
```

---

## 📱 Mobile Testing Guide

### On Desktop Browser
1. Open: https://tpsdhanvantariayurveda.in
2. Press **F12**
3. Click device toolbar icon (phone icon)
4. Select device: **iPhone 12 Pro** or **Pixel 5**
5. Clear cache: **Ctrl+Shift+R** or **Cmd+Shift+R**

### What You Should See
```
┌─────────────────────────┐
│ 🏥 TPS AYURVEDA  👤  ⋮  │ <- 3-dot menu right
├─────────────────────────┤
│ 📊 Dashboard            │
│ [Total Patients      1] │ <- Full width cards
│ [Today's Appoint.    0] │
│ [Pending Reminders   0] │
└─────────────────────────┘
   ↑ No gaps on sides/bottom
```

### On Real Phone
1. Open Safari/Chrome on phone
2. Go to: https://tpsdhanvantariayurveda.in
3. Login: Shankaranherbaltreatment@gmail.com / 123456
4. Look for 3-dot menu in top-right
5. Tap to test

---

## 🎯 Quick Status Check

After deployment, run this:
```bash
curl -I https://tpsdhanvantariayurveda.in
```

**Expected**: `HTTP/2 200`

Check service:
```bash
pm2 status ayurveda-clinic
```

**Expected**: `status: online, uptime: 0s`

---

## 📊 What Changed

| Feature | Before | After |
|---------|--------|-------|
| **Menu Type** | Hamburger ☰ (left) | 3-dot ⋮ (right) |
| **Menu Animation** | Slides from left | Slides from right |
| **Header Height** | 60px | 48px |
| **Container Padding** | 16px | 12px |
| **Export Buttons** | Stacked/grid | 3 columns |
| **Bottom Gap** | 60px | 16px |
| **Screen Fit** | Gaps on sides | Full width |

---

## 📞 Support

**GitHub**: https://github.com/ekodecrux/ayurvedatps
**Commit**: a70e002
**Version**: v2.5.1

**If you need help**:
- Check PM2 logs: `pm2 logs ayurveda-clinic --nostream`
- Check service status: `pm2 status`
- Restart service: `pm2 restart ayurveda-clinic`

---

## 🎉 Done!

After following these steps:
1. Clear browser cache
2. Test on mobile view (DevTools)
3. Verify 3-dot menu works
4. Check export buttons (3 columns)
5. Enjoy your mobile-optimized app! 📱✨

---

**Deployment Time**: ~2 minutes
**Testing Time**: ~3 minutes
**Total Time**: ~5 minutes

✅ **Ready to deploy? Start with Option 1 or Option 2 above!**
