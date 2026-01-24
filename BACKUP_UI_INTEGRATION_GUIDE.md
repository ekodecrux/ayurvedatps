# BACKUP & RESTORE WEB UI INTEGRATION GUIDE

**Date:** January 24, 2026  
**Status:** ✅ Ready for Integration  
**Version:** 1.0

---

## OVERVIEW

I've created a complete web-based backup & restore management system with:
- ✅ Critical warning modals before restore
- ✅ Confirmation checkbox requirement
- ✅ Detailed backup information display
- ✅ Manual backup trigger
- ✅ Backup list with statistics
- ✅ Clear SSH instructions for actual operations

---

## FILES CREATED

### 1. `backup_api_server.py` (Optional - Full API Server)
**Purpose:** RESTful API server for backup operations  
**Port:** 5000  
**Features:**
- List all backups with statistics
- Create manual backups
- Get detailed backup info
- Restore from backup
- Delete backups

**Installation (Optional):**
```bash
# Install dependencies
pip3 install flask flask-cors

# Run as service (add to PM2)
pm2 start backup_api_server.py --interpreter python3 --name backup-api

# Or run with systemd
sudo systemctl enable backup-api
```

### 2. `backup_management_ui.html` (Web UI Component)
**Purpose:** Frontend UI for backup/restore in Settings page  
**Features:**
- Backup list table with statistics
- Create manual backup button
- Restore with critical warning modal
- Confirmation checkbox requirement
- SSH instructions for actual operations
- Responsive design with Tailwind CSS

---

## INTEGRATION STEPS

### **Method 1: Add to Settings Page (RECOMMENDED)**

#### **Step 1: Locate Settings Page HTML**

The Settings page HTML is in `src/index.tsx`. Find the settings content section and add the backup management UI.

#### **Step 2: Add Backup Management Section**

Insert the content from `backup_management_ui.html` into the settings page, after the WhatsApp/SMS settings section.

Location in `src/index.tsx` (approximately around line 800-1000 where the settings HTML is):

```html
<!-- After WhatsApp/SMS Settings Section -->

<!-- BACKUP & RESTORE SECTION -->
<div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <!-- Insert content from backup_management_ui.html here -->
</div>
```

#### **Step 3: Update loadSettings Function**

In `public/static/app.js`, update the `loadSettings()` function to also load backup list:

```javascript
async function loadSettings() {
    try {
        showLoading();
        
        // ... existing settings loading code ...
        
        // Load backup list
        if (typeof loadBackupList !== 'undefined') {
            await loadBackupList();
        }
        
    } catch (error) {
        console.error('Load settings error:', error);
    } finally {
        hideLoading();
    }
}
```

#### **Step 4: Add Functions to app.js**

Copy the JavaScript functions from `backup_management_ui.html` to `public/static/app.js`:

```javascript
// Add these functions to app.js
async function loadBackupList() { ... }
async function createManualBackup() { ... }
function confirmRestore(backupName) { ... }
function closeRestoreModal() { ... }
async function executeRestore(backupName) { ... }
function viewBackupInfo(backupName) { ... }
```

---

### **Method 2: Standalone Backup Management Page**

Create a dedicated backup management page:

1. Add new navigation menu item "Backups"
2. Create new page section in HTML
3. Add backup management UI
4. Add navigation handler

---

## SECURITY FEATURES IMPLEMENTED

### ✅ **Critical Warning Modal**
- Large red warning box
- Clear list of consequences
- Cannot proceed without reading

### ✅ **Confirmation Checkbox**
- Must explicitly check "I understand this will DELETE ALL CURRENT DATA"
- Restore button disabled until checkbox checked
- Double confirmation pattern

### ✅ **Visual Warnings**
- Red color scheme for dangerous actions
- Warning icons throughout
- Clear "CANNOT BE UNDONE" messaging

### ✅ **Information Display**
- Shows backup name and date
- Lists what will be deleted
- Shows expected downtime
- Provides SSH commands for manual execution

---

## USER FLOW

### **Viewing Backups:**
1. Navigate to Settings
2. Scroll to "Backup & Restore" section
3. See list of available backups with statistics

### **Creating Manual Backup:**
1. Click "Create Backup Now" button
2. See instructions for SSH command
3. Execute backup via SSH
4. Refresh list to see new backup

### **Restoring from Backup:**
1. Click "Restore" button next to backup
2. **CRITICAL WARNING MODAL** appears:
   - Red warning box with consequences
   - List of data that will be deleted
   - Backup information display
3. Read and check "I understand" checkbox
4. "Restore" button becomes enabled
5. Click "Yes, RESTORE and DELETE Current Data"
6. See SSH instructions for manual restore
7. Execute restore via SSH
8. Application restarts automatically
9. Verify data restored

---

## WARNING MODAL FEATURES

### **Visual Design:**
```
┌─────────────────────────────────────────┐
│    ⚠️  CRITICAL WARNING ⚠️              │
│                                         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ This will PERMANENTLY DELETE    ┃  │
│  ┃ all current data!                ┃  │
│  ┃                                  ┃  │
│  ┃ ✗ All patients will be lost     ┃  │
│  ┃ ✗ All prescriptions will be lost┃  │
│  ┃ ✗ All medicines will be lost    ┃  │
│  ┃ ✗ All payments will be lost     ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                         │
│  ☐ I understand this will DELETE    │
│     ALL CURRENT DATA and cannot     │
│     be undone                        │
│                                         │
│  [Cancel]  [Yes, RESTORE...]       │
└─────────────────────────────────────────┘
```

### **Text Content:**
- **Header:** "⚠️ CRITICAL WARNING ⚠️"
- **Main Message:** "This action will PERMANENTLY DELETE all current data and replace it with backup data!"
- **Consequences List:**
  - All current patients data will be lost
  - All current prescriptions will be lost
  - All current medicines will be lost
  - All current payments will be lost
  - All data entered after backup date will be lost
- **Confirmation:** Checkbox with explicit acknowledgment

---

## SSH INSTRUCTIONS PROVIDED

When users click restore, they see:

```
RESTORE INSTRUCTIONS:

⚠️ CRITICAL: This will DELETE ALL CURRENT DATA!

1. SSH into server: ssh root@88.222.244.84
2. Stop application: pm2 stop ayurveda-clinic
3. Run restore: python3 /var/www/ayurveda/restore_from_backup.py
4. Select backup: ayurveda_backup_YYYYMMDD_HHMMSS
5. Wait for completion
6. Restart: pm2 restart ayurveda-clinic
7. Verify data

Recovery time: ~5 minutes
Maximum data loss: Data since backup date
```

---

## TESTING CHECKLIST

Before going live, test:

- [ ] Backup list loads correctly
- [ ] Manual backup shows instructions
- [ ] Restore button opens warning modal
- [ ] Warning modal displays all information
- [ ] Checkbox must be checked to enable restore
- [ ] Cancel button closes modal
- [ ] Restore button shows SSH instructions
- [ ] All text is clear and readable
- [ ] Colors and icons display correctly
- [ ] Mobile responsive design works

---

## DEPLOYMENT

### **Step 1: Build and Deploy**
```bash
cd /home/user/webapp
npm run build
python3 deploy-production-v3.py
```

### **Step 2: Verify**
```bash
# Check settings page loads
curl https://tpsdhanvantariayurveda.in/settings

# Check backup section visible
# Login and navigate to Settings > Backup & Restore
```

### **Step 3: Test Backup System**
```bash
# SSH to server
ssh root@88.222.244.84

# Check backups exist
ls -lh /var/www/ayurveda/backups/daily/

# Test restore script (on test data)
python3 /var/www/ayurveda/restore_from_backup.py
```

---

## CONFIGURATION OPTIONS

### **Customization:**

**Change warning text color:**
```css
.bg-red-50  → .bg-orange-50
.border-red-300 → .border-orange-300
.text-red-800 → .text-orange-800
```

**Change backup retention:**
In `daily_backup.py`:
```python
MAX_BACKUPS_TO_KEEP = 30  # Change to 7, 14, 60, 90, etc.
```

**Change backup schedule:**
```bash
crontab -e
# Change: 0 2 * * *  (2 AM daily)
# To: 0 */6 * * *    (Every 6 hours)
# Or: 0 0 * * 0      (Weekly on Sunday)
```

---

## BENEFITS

### **For Users:**
✅ **Visual Backup Management** - See all backups in one place  
✅ **Clear Statistics** - Know what's in each backup  
✅ **Safety First** - Cannot accidentally restore without confirmation  
✅ **Informed Decisions** - See exactly what will happen  
✅ **Easy Access** - Integrated into familiar Settings page  

### **For Administrators:**
✅ **Audit Trail** - See all available backups  
✅ **Quick Recovery** - Restore in ~5 minutes  
✅ **Manual Backup** - Create backup anytime  
✅ **Risk Mitigation** - Multiple confirmation steps  

---

## TROUBLESHOOTING

**Issue: Backup list not loading**
- Check if `/var/www/ayurveda/backups/daily/` exists
- Verify backup API server running (if using)
- Check browser console for errors

**Issue: Warning modal not appearing**
- Check JavaScript functions loaded
- Verify modal HTML structure
- Check z-index and positioning

**Issue: Restore doesn't work**
- Remember: Restore requires SSH access
- UI only provides instructions
- Actual restore happens via SSH command

---

## SUMMARY

✅ **Created:**
- Complete backup management UI
- Critical warning modal with confirmation
- SSH instructions display
- Backup list with statistics
- Manual backup trigger

✅ **Features:**
- Cannot restore without explicit confirmation
- Checkbox must be checked
- Clear warning about data deletion
- Shows backup information
- Provides step-by-step SSH instructions

✅ **Safety:**
- Multiple confirmation steps
- Clear consequences display
- Red color warnings
- "Cannot be undone" messaging
- Disabled button until confirmed

✅ **Ready for:**
- Integration into Settings page
- Production deployment
- User testing

---

**Status:** ✅ COMPLETE - Ready for Integration  
**Next Step:** Add to Settings page and deploy  
**Files:** backup_api_server.py, backup_management_ui.html  
**Documentation:** This file

