# 🎉 BACKUP SYSTEM - QUICK START GUIDE

**Status:** ✅ DEPLOYED AND READY  
**Date:** January 24, 2026

---

## ✅ WHAT YOU HAVE NOW

1. ✅ **Automated Daily Backups** (2 AM every night)
2. ✅ **Web-Based Backup UI** (in Settings page)
3. ✅ **One-Click Restore** (any backup from last 30 days)
4. ✅ **30-Day Retention** (automatic cleanup)
5. ✅ **Monthly Archives** (long-term storage)

---

## 🚀 HOW TO USE IT

### **Option 1: Create Backup Manually (Anytime)**

1. **Login:** https://tpsdhanvantariayurveda.in/
   - Email: `admin@tpsdhanvantari.com`
   - Password: `123456`

2. **Go to Settings:**
   - Click "Settings" in left sidebar (bottom icon)

3. **Find Backup Section:**
   - Scroll down to "Backup & Restore"

4. **Create Backup:**
   - Click blue **"Create Backup Now"** button
   - Wait 30-60 seconds (loading spinner shows)
   - See success message with statistics

5. **Done!**
   - Your backup appears in the list below
   - Shows: Date, Patients count, Prescriptions, Medicines, File size

---

### **Option 2: Automatic Backups (No Action Needed)**

- **When:** Every night at 2:00 AM (automatic)
- **What:** Full backup of all data
- **Where:** `/var/www/ayurveda/backups/daily/`
- **Retention:** Last 30 days kept automatically
- **Cleanup:** Old backups deleted automatically

**You don't need to do anything! Just check the backup list daily to confirm.**

---

## 🔄 HOW TO RESTORE DATA

### **⚠️ WARNING: This DELETES all current data!**

1. **Go to Settings → Backup & Restore**

2. **Find the backup you want:**
   - List shows all backups from last 30 days
   - Latest backup is highlighted in green
   - See date, patient count, etc.

3. **Click "Restore" button:**
   - A modal opens with CRITICAL WARNING
   - Lists what will be deleted:
     - ✗ All current patients
     - ✗ All current prescriptions
     - ✗ All current medicines
     - ✗ All current payments

4. **Confirm:**
   - Check the box: "I understand data will be lost"
   - Button enables
   - Click **"Yes, DELETE and RESTORE"**

5. **Wait:**
   - 30-60 seconds for restore
   - Page reloads automatically

6. **Verify:**
   - Check that data is restored
   - Verify patients, prescriptions, etc.

---

## 📋 WHAT'S BACKED UP

Every backup includes:
- ✅ All patients (personal info, contact, medical history)
- ✅ All prescriptions (herbs & roots records)
- ✅ All medicines (medicine tracking, dosages, schedules)
- ✅ All payments (payment collections, amounts, dates)
- ✅ All appointments
- ✅ All reminders
- ✅ System settings

---

## 🕐 BACKUP SCHEDULE

| Time | Action | Retention |
|------|--------|-----------|
| 2:00 AM Daily | Automatic backup | 30 days |
| 1st of month | Create monthly archive | Forever |
| Anytime | Manual backup (via UI) | 30 days |

---

## 💾 WHERE ARE BACKUPS STORED?

```
/var/www/ayurveda/backups/
├── daily/                      # Last 30 days
│   ├── backup_20260124_020000.tar.gz
│   ├── backup_20260125_020000.tar.gz
│   └── ...
└── monthly/                    # Long-term archives
    ├── backup_202601.tar.gz
    └── ...
```

---

## 🆘 COMMON SCENARIOS

### **Scenario 1: I accidentally deleted a patient**
1. Go to Settings → Backup & Restore
2. Find yesterday's backup
3. Click "Restore"
4. Confirm and wait
5. Patient is back!

**Note:** All data added after that backup will be lost.

---

### **Scenario 2: I made mistakes in multiple records**
1. Go to Settings → Backup & Restore
2. Find backup from before the mistakes
3. Click "Restore"
4. Confirm and wait
5. All mistakes are undone!

---

### **Scenario 3: I want to backup before making changes**
1. Go to Settings → Backup & Restore
2. Click "Create Backup Now"
3. Wait for confirmation
4. Make your changes
5. If something goes wrong, restore to this backup!

---

### **Scenario 4: Computer crashed, need to recover**
1. Login to website from any device
2. Go to Settings → Backup & Restore
3. Click "Restore" on latest backup
4. Confirm and wait
5. All data recovered!

---

## ⏱️ MAXIMUM DATA LOSS

**Worst Case:** 24 hours of data

**Why?** Backups run every night at 2 AM. If something happens at 1:59 AM, you could lose up to 24 hours of data (back to previous night's backup).

**Solution:** Create manual backups before important work:
- Before bulk data entry
- Before system updates
- Before training new staff
- After completing important prescriptions

---

## 🔍 MONITORING BACKUPS

### **Daily Check (Recommended):**
1. Login to website
2. Go to Settings → Backup & Restore
3. Verify latest backup is from today or yesterday
4. Check backup size is reasonable (not 0 KB)

### **Weekly Check:**
1. Count backups in list (should be ~7 from last week)
2. Verify backup sizes are consistent
3. If any backup is missing, investigate

### **Monthly Check:**
1. SSH to server: `ssh root@88.222.244.84`
2. Check monthly archive: `ls -lh /var/www/ayurveda/backups/monthly/`
3. Verify last month's archive exists

---

## 🛠️ IF SOMETHING GOES WRONG

### **Problem: No backups appear in list**

**Solution:**
```bash
# SSH to server
ssh root@88.222.244.84

# Check if backup directory exists
ls -lh /var/www/ayurveda/backups/daily/

# Create manual backup
python3 /var/www/ayurveda/daily_backup.py

# Check PM2 status
pm2 list

# If backup-api is stopped
pm2 restart backup-api
```

---

### **Problem: "Create Backup" button doesn't work**

**Solution:**
```bash
# SSH to server
ssh root@88.222.244.84

# Check backup API
pm2 logs backup-api --lines 50

# Restart API
pm2 restart backup-api

# Test API
curl http://localhost:5000/health
```

---

### **Problem: Restore fails**

**Solution:**
```bash
# SSH to server
ssh root@88.222.244.84

# Check PM2 status
pm2 list

# Restart ayurveda-clinic
pm2 restart ayurveda-clinic

# Check logs
pm2 logs backup-api --lines 50
```

---

## 📞 EMERGENCY RESTORE (If Web UI Fails)

If the web interface is down but you need to restore:

```bash
# 1. SSH to server
ssh root@88.222.244.84

# 2. Navigate to directory
cd /var/www/ayurveda

# 3. List available backups
ls -lh backups/daily/

# 4. Choose a backup (example: backup_20260124_020000.tar.gz)
# 5. Run restore script
python3 restore_from_backup.py backup_20260124_020000.tar.gz

# 6. Restart application
pm2 restart ayurveda-clinic

# 7. Test
curl http://localhost:3011/
```

---

## ✅ BEST PRACTICES

1. **✅ Create manual backup before:**
   - Major data entry sessions
   - System updates
   - Training new users
   - Making bulk changes

2. **✅ Check backups daily:**
   - Verify latest backup exists
   - Check backup size is reasonable
   - Ensure automated backup ran

3. **✅ Test restore monthly:**
   - In a test environment
   - Verify restoration works
   - Practice the procedure

4. **✅ Keep credentials safe:**
   - Admin login: `admin@tpsdhanvantari.com / 123456`
   - Server SSH: `root@88.222.244.84`
   - Store in secure location

5. **✅ Document issues:**
   - If backup fails, note when/why
   - If restore fails, document steps
   - Report recurring issues

---

## 🎯 QUICK COMMANDS REFERENCE

```bash
# Create manual backup
python3 /var/www/ayurveda/daily_backup.py

# Restore from backup
python3 /var/www/ayurveda/restore_from_backup.py backup_NAME.tar.gz

# Check PM2 status
pm2 list

# Restart backup API
pm2 restart backup-api

# Restart main app
pm2 restart ayurveda-clinic

# View backup API logs
pm2 logs backup-api --lines 50

# List backups
ls -lh /var/www/ayurveda/backups/daily/

# Check disk space
df -h

# Check cron jobs
crontab -l

# Test backup API
curl http://localhost:5000/health
```

---

## 📊 SYSTEM STATUS

- **Web App:** https://tpsdhanvantariayurveda.in/ ✅
- **Backup API:** Running on port 5000 ✅
- **PM2 Process:** backup-api (ID: 25) ✅
- **Daily Cron:** 2:00 AM UTC ✅
- **Storage:** `/var/www/ayurveda/backups/` ✅
- **Retention:** 30 days + monthly ✅

---

## 🎉 YOU'RE ALL SET!

**Your data is now protected with:**
- ✅ Automated daily backups
- ✅ Easy web-based restore
- ✅ 30-day point-in-time recovery
- ✅ Monthly long-term archives
- ✅ One-click operations

**No more data loss worries!** 🚀

---

**Questions? Check the full documentation:**
- `DEPLOYMENT_SUCCESS.md` - Complete deployment details
- `BACKUP_SYSTEM_DOCUMENTATION.md` - Technical documentation
- `AUTOMATED_BACKUP_COMPLETE.md` - Automated backup system details

---

**Last Updated:** January 24, 2026  
**Status:** ✅ PRODUCTION READY  
**GitHub:** https://github.com/ekodecrux/ayurvedatps (commit: 9cfa725)
