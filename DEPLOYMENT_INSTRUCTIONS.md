# URGENT: Manual Deployment Required for Patient View Fix

## Issue
The patient View button is still showing the edit form because the code changes haven't been deployed to production yet.

## Quick Fix - Run on Production Server

SSH into the production server and run these commands:

```bash
# SSH into server
ssh root@88.222.244.84

# Navigate to project
cd /var/www/ayurveda

# Pull latest code
git pull origin main

# Run deployment script
bash deploy-patient-view-fix.sh
```

## OR Manual Step-by-Step

If the script doesn't work, do it manually:

```bash
# SSH into server
ssh root@88.222.244.84
cd /var/www/ayurveda

# Pull latest code
git pull origin main

# Copy the updated file
cp public/static/app.js dist/static/app.js

# Verify it worked
grep "showPatientModal(res.data.data, true)" dist/static/app.js

# Restart PM2
pm2 restart ayurveda-clinic
```

## Verify Deployment

After deployment, check if the file is updated:

```bash
curl -s http://88.222.244.84:3001/static/app.js | grep -A 5 "async function viewPatient"
```

**Expected output** (new code):
```javascript
async function viewPatient(id) {
  try {
    showLoading();
    const res = await axios.get(`${API_BASE}/patients/${id}`);
    showPatientModal(res.data.data, true); // Pass viewMode=true
```

**Current output** (old code):
```javascript
async function viewPatient(id) {
  editPatient(id);
}
```

## What Changed

**File**: `public/static/app.js`

**Changes**:
1. `viewPatient()` - Completely rewritten to fetch data and open in view mode
2. `showPatientModal()` - Enhanced to support `viewMode` parameter

## After Deployment

1. **Clear browser cache** or hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Test**: Go to Patients → Click View button → Should see "View Patient Details" with disabled fields
3. **Confirm**: Edit button should still work normally

## Why This Happened

The SSH credentials from this development environment to the production server are no longer working, so the automated deployment failed. The code is committed and pushed to GitHub, but needs to be manually pulled and deployed on the production server.

## Contact

If you need help with deployment, please provide working SSH credentials or run the commands above directly on the production server.

---

**Status**: ⏳ AWAITING MANUAL DEPLOYMENT  
**Version**: v2.4.9.4  
**GitHub Commit**: a05a453  
**Date**: 2026-01-03
