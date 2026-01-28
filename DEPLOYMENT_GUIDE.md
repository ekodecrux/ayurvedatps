# 🚀 Production Deployment Guide

## Overview
This guide covers deploying the latest updates to both production sites:
- **Primary**: https://tpsdhanvantariayurveda.in
- **Secondary**: https://tpsdhanvantariayurveda.com

## 📦 What's Being Deployed

### 1. Medicine Management System (Commit: 89c8468)
- **Medicines Button** in Herbs & Roots section
- **Medicine Management Modal** with split view:
  - Left: Add/Edit medicine form (Name, Category, Description)
  - Right: Medicine list with search, edit, delete
- **Medicine Dropdown** in New/Edit Herbs & Roots prescription
- **15 Pre-loaded Medicines**: Triphala Churna, Ashwagandha Capsules, Brahmi Ghrita, etc.
- **Auto-updating Dropdowns**: Changes sync immediately across all forms

### 2. Patient Disease Numbering (Commit: 6d52627)
- **Disease 1, Disease 2, Disease 3**, etc. labeling
- **Visual Improvements**:
  - Disease icon (🦠) with number
  - Blue-purple gradient background
  - Remove button in header
  - Clear visual separation between diseases

### 3. Patient Edit - Disease Dropdown Fix (Commit: 32a7bd4)
- **Fixed**: Disease dropdown now loads properly in edit mode
- **Solution**: Made `showPatientModal` async and await `loadDiseases()`
- **Impact**: All 21 diseases now available in dropdown when editing patients

### 4. Backup Error Handling (Commit: 841c4fa)
- **Improved Error Messages**: Clear guidance when backup API unavailable
- **Informative UI**: Blue info box with production setup instructions
- **User-Friendly**: Explains sandbox vs production differences

### 5. Backup Filter Dropdown Fix (Commit: ceab4f4)
- **Fixed**: Dropdown now shows correct selected filter
- **Filters Available**: Recent 2, Today, Yesterday, Last 7 Days, Last 30 Days, All Backups
- **Visual Feedback**: Shows count for each filter (e.g., "Last 7 Days (6)")

### 6. Backup List Loading Fix (Commit: 13d8000)
- **Fixed**: Backup list loads immediately when opening Settings
- **Solution**: Properly await `loadBackupList()` in `loadSettings()`
- **Impact**: No more infinite "Loading backups..." spinner

## 🎯 Latest Commit
**Commit**: `13d8000` - Fix backup list not loading on initial page load  
**Branch**: `main`  
**Repository**: https://github.com/ekodecrux/ayurvedatps.git

## 📋 Deployment Steps

### Option 1: Automated Deployment (Recommended)

Run the automated deployment script:

```bash
cd /home/user/webapp
./deploy_to_production_both_sites.sh
```

The script will:
1. Connect to production server
2. Pull latest code from GitHub
3. Install/update dependencies if needed
4. Build the project
5. Apply database migrations
6. Restart PM2 application
7. Reload Nginx
8. Verify both .in and .com sites

### Option 2: Manual Deployment

If you prefer manual control:

```bash
# SSH to production server
ssh root@88.222.244.84

# Navigate to project directory
cd /var/www/ayurveda

# Pull latest code
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Build project
npm run build

# Apply migrations
npx wrangler d1 migrations apply ayurveda-db --local

# Stop PM2 app
pm2 stop ayurveda-clinic

# Clean port
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

# Start PM2 app
pm2 start ecosystem.config.cjs

# Reload Nginx
nginx -t && systemctl reload nginx

# Save PM2 config
pm2 save

# Test
curl http://localhost:3001
curl https://tpsdhanvantariayurveda.in
curl https://tpsdhanvantariayurveda.com
```

## ✅ Post-Deployment Verification

### 1. Check Both Sites Are Live
```bash
# Test .in site
curl -I https://tpsdhanvantariayurveda.in

# Test .com site
curl -I https://tpsdhanvantariayurveda.com
```

Both should return `HTTP/2 200 OK`

### 2. Verify Application Loaded Correctly
```bash
# Check .in title
curl -s https://tpsdhanvantariayurveda.in | grep -i "TPS DHANVANTARI AYURVEDA"

# Check .com title
curl -s https://tpsdhanvantariayurveda.com | grep -i "TPS DHANVANTARI AYURVEDA"
```

### 3. Test Medicine API
```bash
# Check medicines endpoint
curl https://tpsdhanvantariayurveda.in/api/medicines | jq 'length'
```

Should return `15` (15 pre-loaded medicines)

### 4. Test Disease API
```bash
# Check diseases endpoint
curl https://tpsdhanvantariayurveda.in/api/diseases | jq '.data | length'
```

Should return `21` (21 diseases including patient-specific ones)

### 5. Manual Testing Checklist

Login to both sites:
- Email: `Shankaranherbaltreatment@gmail.com`
- Password: `123456`

Test on **.in site**:
- [ ] Login successful
- [ ] Navigate to **Herbs & Roots**
- [ ] Click **Medicines** button → Medicine Management modal opens
- [ ] Add a new medicine → Should appear in list
- [ ] Edit a medicine → Changes saved
- [ ] Delete a medicine (test medicine only) → Removed from list
- [ ] Click **New Record** → Medicine dropdown shows all medicines
- [ ] Navigate to **Patients**
- [ ] Add Patient → Click **Add Disease** multiple times → Should show "Disease 1", "Disease 2", etc.
- [ ] Edit existing patient → Disease dropdown shows all 21 diseases
- [ ] Navigate to **Admin** → **Settings** → **Backup & Restore**
- [ ] Backup list loads immediately (no infinite spinner)
- [ ] Filter dropdown works (Today, Last 7 Days, All Backups)
- [ ] Selected filter displays correctly

Test on **.com site**:
- [ ] Repeat all above tests
- [ ] Verify both sites have identical functionality

## 🔧 Troubleshooting

### Issue: Sites not responding
```bash
# Check PM2 status
ssh root@88.222.244.84 'pm2 list'

# Check logs
ssh root@88.222.244.84 'pm2 logs ayurveda-clinic --lines 50'

# Restart if needed
ssh root@88.222.244.84 'pm2 restart ayurveda-clinic'
```

### Issue: Port conflict
```bash
# Kill process on port 3001
ssh root@88.222.244.84 'fuser -k 3001/tcp && pm2 restart ayurveda-clinic'
```

### Issue: Nginx errors
```bash
# Test Nginx config
ssh root@88.222.244.84 'nginx -t'

# Reload Nginx
ssh root@88.222.244.84 'systemctl reload nginx'
```

### Issue: Database migrations not applied
```bash
# SSH to server
ssh root@88.222.244.84

# Navigate to project
cd /var/www/ayurveda

# Check migrations
npx wrangler d1 migrations list ayurveda-db --local

# Apply migrations
npx wrangler d1 migrations apply ayurveda-db --local

# Restart app
pm2 restart ayurveda-clinic
```

### Issue: Old cached version showing
1. Clear browser cache: **Ctrl+Shift+R** (hard reload)
2. Or clear all browser data for the domain
3. Try incognito/private browsing mode

## 📊 Database Migrations Included

### Migration: `0018_create_medicines_master_table.sql`
Creates `medicines_master` table with:
- `id` (Primary Key)
- `name` (Medicine name - required)
- `description` (Optional description)
- `category` (Optional category: Churna, Capsule, Tablet, etc.)
- `created_at`, `updated_at` (Timestamps)

Seeds 15 Ayurvedic medicines.

## 🌟 New Features Available After Deployment

### For Clinic Staff:

1. **Medicine Master Management**
   - Go to Herbs & Roots → Click "Medicines" button
   - Add new medicines to master list
   - Edit existing medicines
   - Delete medicines (with confirmation)
   - Search/filter medicines

2. **Simplified Prescription Entry**
   - When creating/editing Herbs & Roots prescription
   - Medicine name is now a dropdown (not free text)
   - Select from master list
   - Ensures consistency and prevents typos

3. **Better Patient Disease Tracking**
   - Add multiple diseases to a patient
   - Clearly labeled as "Disease 1", "Disease 2", etc.
   - Visual separation between diseases
   - All 21 diseases available in dropdown

4. **Improved Backup Management**
   - Backup list loads immediately
   - Filter by date range (Today, Last 7/30 Days, All)
   - Clear error messages when API unavailable
   - Better user guidance

## 📝 Configuration Files

### ecosystem.config.cjs
```javascript
module.exports = {
  apps: [{
    name: 'ayurveda-clinic',
    script: 'npx',
    args: 'wrangler pages dev dist --d1=ayurveda-db --local --ip 0.0.0.0 --port 3001',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### Nginx Configuration
Both sites should have similar config:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tpsdhanvantariayurveda.in www.tpsdhanvantariayurveda.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tpsdhanvantariayurveda.in www.tpsdhanvantariayurveda.in;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/tpsdhanvantariayurveda.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tpsdhanvantariayurveda.in/privkey.pem;

    # Proxy to PM2 app
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Security Notes

1. **Default Admin Password**: Change the default password after first login
2. **API Keys**: Ensure backup API keys are secure
3. **Database**: Regular backups are configured (daily at 2:00 AM)
4. **SSL Certificates**: Auto-renewed by Let's Encrypt

## 📞 Support

If you encounter any issues:
1. Check PM2 logs: `pm2 logs ayurveda-clinic`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify database: `npx wrangler d1 execute ayurveda-db --local --command="SELECT COUNT(*) FROM medicines_master"`

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Both .in and .com sites are accessible
- ✅ Both sites show correct application (not MySchool)
- ✅ Medicine Management works on both sites
- ✅ Patient Disease numbering displays correctly
- ✅ Backup & Restore page loads properly
- ✅ All API endpoints respond correctly
- ✅ PM2 shows ayurveda-clinic as "online"
- ✅ No errors in PM2 logs

---

**Deployment Date**: January 28, 2026  
**Latest Commit**: 13d8000  
**Version**: 2.5.0  
**Status**: ✅ Ready for Production
