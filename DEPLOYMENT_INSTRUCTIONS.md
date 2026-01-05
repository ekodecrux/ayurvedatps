# 🚀 VPS Deployment Instructions - Payment Module Fixes v2.5.0

## Quick Reference
- **VPS IP**: 88.222.244.84
- **User**: root
- **Password**: Yourkpo@202526
- **App Path**: /var/www/ayurveda
- **PM2 App Name**: ayurveda-clinic

---

## Option 1: Automated Deployment (If SSH works)

### Step 1: Setup SSH Key (One-time)
```bash
# On your local machine
ssh-copy-id root@88.222.244.84
# Enter password when prompted: Yourkpo@202526
```

### Step 2: Run Deployment Script
```bash
cd /home/user/webapp
./deploy-to-vps.sh
```

---

## Option 2: Manual Deployment (Recommended for this session)

### Step 1: Access VPS
```bash
ssh root@88.222.244.84
# Password: Yourkpo@202526
```

### Step 2: Navigate to Application Directory
```bash
cd /var/www/ayurveda
```

### Step 3: Create Backup
```bash
mkdir -p backups
cp dist/static/app.js backups/app.js.backup-$(date +%Y%m%d_%H%M%S)
```

### Step 4: Pull Latest Changes from GitHub
```bash
git pull origin main
```

### Step 5: Build Application
```bash
npm run build
```

### Step 6: Restart PM2 Service
```bash
pm2 restart ayurveda-clinic
pm2 status
```

### Step 7: Verify Deployment
```bash
# Check if application is running
curl http://localhost:3001

# Check PM2 logs
pm2 logs ayurveda-clinic --lines 20 --nostream
```

---

## Option 3: SCP File Transfer (Delta Changes Only)

### From Local Machine:
```bash
# Copy only the changed file
scp /home/user/webapp/dist/static/app.js root@88.222.244.84:/var/www/ayurveda/dist/static/

# Copy documentation
scp /home/user/webapp/PAYMENT_MODULE_FIXES_v2.5.0.md root@88.222.244.84:/var/www/ayurveda/
```

### Then SSH and Restart:
```bash
ssh root@88.222.244.84
cd /var/www/ayurveda
pm2 restart ayurveda-clinic
```

---

## Verification Steps

### 1. Check PM2 Status
```bash
pm2 status ayurveda-clinic
```

Expected output:
```
┌─────┬────────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name               │ mode        │ ↺       │ status  │ cpu      │
├─────┼────────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ ayurveda-clinic    │ fork        │ 0       │ online  │ 0%       │
└─────┴────────────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### 2. Test Application Endpoint
```bash
curl http://localhost:3001
# Should return HTML content
```

### 3. Check Logs for Errors
```bash
pm2 logs ayurveda-clinic --lines 50 --nostream
# Look for any error messages
```

### 4. Browser Testing
Open in browser:
- http://88.222.244.84:3001
- https://tpsdhanvantariayurveda.in/

Test payment features:
- ✅ Add new course with payment
- ✅ Check balance display shows status: (Paid), (Due), or (Credit)
- ✅ Try entering negative payment amount (should be prevented)
- ✅ Try entering zero payment amount (should show warning)
- ✅ Add payment collection
- ✅ Verify overall balance calculation

---

## Rollback Procedure (If Issues Occur)

### Quick Rollback:
```bash
ssh root@88.222.244.84
cd /var/www/ayurveda
# Find latest backup
ls -lth backups/ | head -5
# Restore backup
cp backups/app.js.backup-YYYYMMDD_HHMMSS dist/static/app.js
pm2 restart ayurveda-clinic
```

### Git Rollback:
```bash
ssh root@88.222.244.84
cd /var/www/ayurveda
git log --oneline -5
git checkout <previous-commit-hash>
npm run build
pm2 restart ayurveda-clinic
```

---

## Files Changed in This Deployment

1. **public/static/app.js** → **dist/static/app.js** (after build)
   - Enhanced calculateBalance() function
   - Improved updatePaymentSummary() function
   - Added validatePaymentAmount() function
   - Updated payment input fields with validation
   - Updated balance display logic

2. **PAYMENT_MODULE_FIXES_v2.5.0.md**
   - Complete documentation of all changes

---

## Post-Deployment Checklist

- [ ] VPS accessible via SSH
- [ ] Application directory exists: /var/www/ayurveda
- [ ] Git repository up to date
- [ ] Build completed successfully
- [ ] PM2 service restarted
- [ ] Application responding on port 3001
- [ ] No errors in PM2 logs
- [ ] Browser testing passed
- [ ] Payment features working correctly
- [ ] Balance calculations accurate
- [ ] Validation working

---

## Support & Troubleshooting

### Application Not Starting
```bash
pm2 delete ayurveda-clinic
pm2 start ecosystem.config.cjs
```

### Port 3001 Already in Use
```bash
lsof -i :3001
kill -9 <PID>
pm2 restart ayurveda-clinic
```

### Build Errors
```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## Success Indicators

✅ PM2 shows "online" status  
✅ Application responds to curl requests  
✅ Browser loads the application  
✅ Payment balance shows status labels  
✅ Negative amounts are prevented  
✅ No console errors  
✅ All payment calculations are correct  

---

**Deployment Version**: 2.5.0  
**Deployment Date**: January 5, 2026  
**Deployed By**: Automated System  
**Changes**: Payment module enhancements and fixes
