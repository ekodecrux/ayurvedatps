# AUTOMATED DAILY BACKUP SYSTEM

**Version:** 1.0  
**Date:** January 24, 2026  
**Status:** ✅ Ready for Production

---

## OVERVIEW

Automated backup system that backs up ALL production data daily and allows easy restoration to any point in time.

### Features
- ✅ **Automated Daily Backups** - Runs at 2:00 AM every day
- ✅ **Complete Data Backup** - Patients, Prescriptions, Medicines, Payments, Appointments, Reminders, Settings
- ✅ **30-Day Retention** - Automatically keeps last 30 daily backups
- ✅ **Monthly Archives** - Creates monthly backup on 1st of each month
- ✅ **Easy Restoration** - Restore to any backup point with one command
- ✅ **Error Logging** - All errors logged for troubleshooting
- ✅ **Compression** - Backups compressed with tar.gz to save space

---

## FILES INCLUDED

### 1. `daily_backup.py`
**Purpose:** Main backup script that runs automatically  
**What it does:**
- Connects to production API
- Downloads all data (patients, prescriptions, medicines, payments, etc.)
- Saves to JSON format
- Creates compressed archive (.tar.gz)
- Creates monthly backup if 1st of month
- Cleans up old backups (keeps last 30 days)
- Logs all operations

### 2. `restore_from_backup.py`
**Purpose:** Restoration script to recover data  
**What it does:**
- Lists all available backups
- Restores selected backup to database
- Verifies restoration success
- Supports both manual and automated restore

### 3. `setup_daily_backup.sh`
**Purpose:** One-time setup script for cron automation  
**What it does:**
- Creates necessary directories
- Makes scripts executable
- Adds cron job for daily 2 AM backup
- Tests backup script
- Shows configuration summary

---

## INSTALLATION ON PRODUCTION SERVER

### Step 1: Upload Files to Server

```bash
# From your local machine, upload to production server
scp daily_backup.py root@88.222.244.84:/var/www/ayurveda/
scp restore_from_backup.py root@88.222.244.84:/var/www/ayurveda/
scp setup_daily_backup.sh root@88.222.244.84:/var/www/ayurveda/
```

### Step 2: SSH into Production Server

```bash
ssh root@88.222.244.84
# Password: Yourkpo@202526
```

### Step 3: Run Setup Script

```bash
cd /var/www/ayurveda
chmod +x setup_daily_backup.sh
./setup_daily_backup.sh
```

**This will:**
- Set up daily cron job
- Create backup directories
- Test the backup script
- Show confirmation

### Step 4: Verify Installation

```bash
# Check cron job is installed
crontab -l | grep daily_backup

# Check backup directories created
ls -lh /var/www/ayurveda/backups/daily/

# View first backup
ls -lh /var/www/ayurveda/backups/daily/
```

---

## HOW IT WORKS

### Daily Automatic Backup (2:00 AM)
1. Cron triggers backup script at 2 AM
2. Script connects to https://tpsdhanvantariayurveda.in/api/
3. Downloads all data via API:
   - All patients (with full details)
   - All prescriptions (with medicines)
   - All payment collections
   - All appointments
   - All reminders
   - System settings
4. Saves data to JSON file
5. Creates human-readable summary
6. Compresses to .tar.gz archive
7. If 1st of month, creates monthly backup
8. Deletes backups older than 30 days
9. Logs results

### Backup Location Structure
```
/var/www/ayurveda/backups/
├── daily/
│   ├── ayurveda_backup_20260124_020000/
│   │   ├── data.json           # Full data backup
│   │   └── SUMMARY.txt         # Human-readable summary
│   ├── ayurveda_backup_20260124_020000.tar.gz  # Compressed archive
│   ├── ayurveda_backup_20260125_020000.tar.gz
│   └── ... (up to 30 days)
├── monthly/
│   ├── backup_202601.tar.gz    # January backup
│   ├── backup_202602.tar.gz    # February backup
│   └── ...
└── logs/
    └── daily_backup.log        # Backup execution logs
```

---

## USAGE GUIDE

### Manual Backup (Anytime)

```bash
# Run backup manually
cd /var/www/ayurveda
python3 daily_backup.py

# Check result
ls -lh backups/daily/ | tail -5
```

### View Backup Logs

```bash
# View recent backup activity
tail -50 /var/www/ayurveda/logs/daily_backup.log

# Watch live backup (if running)
tail -f /var/www/ayurveda/logs/daily_backup.log
```

### List Available Backups

```bash
# List all daily backups
ls -lh /var/www/ayurveda/backups/daily/

# List monthly backups
ls -lh /var/www/ayurveda/backups/monthly/

# Show backup summary
cat /var/www/ayurveda/backups/daily/ayurveda_backup_YYYYMMDD_HHMMSS/SUMMARY.txt
```

### Restore from Backup

**⚠️ IMPORTANT:** Restoring will **REPLACE ALL CURRENT DATA** with backup data!

```bash
# Step 1: Stop the application
pm2 stop ayurveda-clinic

# Step 2: List available backups and restore
cd /var/www/ayurveda
python3 restore_from_backup.py

# This will:
# - Show all available backups
# - Automatically restore from latest backup
# - Verify restoration

# Step 3: Restart application
pm2 restart ayurveda-clinic

# Step 4: Verify restoration
curl http://localhost:3011/api/patients | python3 -m json.tool | head -50
```

**Restore Specific Backup:**
```bash
# List backups first to get the number
ls -lh backups/daily/ | nl

# Restore specific backup (e.g., backup #3)
python3 restore_from_backup.py 3
```

---

## MONITORING & MAINTENANCE

### Check Backup Health

```bash
# Check if cron job exists
crontab -l | grep daily_backup

# Check last backup time
ls -lt /var/www/ayurveda/backups/daily/ | head -3

# Check backup sizes
du -sh /var/www/ayurveda/backups/daily/*

# Check total backup space used
du -sh /var/www/ayurveda/backups/
```

### Verify Backup Content

```bash
# Extract and view a backup
cd /var/www/ayurveda/backups/daily/
tar -xzf ayurveda_backup_YYYYMMDD_HHMMSS.tar.gz
cat ayurveda_backup_YYYYMMDD_HHMMSS/SUMMARY.txt
cat ayurveda_backup_YYYYMMDD_HHMMSS/data.json | python3 -m json.tool | head -100
```

### Troubleshooting

**Problem: Backup not running**
```bash
# Check cron service is running
systemctl status cron

# Check cron logs
grep CRON /var/log/syslog | tail -20

# Check backup error log
cat /var/www/ayurveda/backups/backup_error_*.log
```

**Problem: Backup fails**
```bash
# Check if API is accessible
curl https://tpsdhanvantariayurveda.in/api/patients

# Check script permissions
ls -l /var/www/ayurveda/daily_backup.py

# Run backup manually to see errors
python3 /var/www/ayurveda/daily_backup.py
```

**Problem: Disk space full**
```bash
# Check disk space
df -h

# Reduce retention period (edit daily_backup.py)
nano /var/www/ayurveda/daily_backup.py
# Change MAX_BACKUPS_TO_KEEP = 30 to 15 or 7

# Manually clean old backups
rm -rf /var/www/ayurveda/backups/daily/ayurveda_backup_202601*
```

---

## BACKUP SCHEDULE CUSTOMIZATION

### Change Backup Time

```bash
# Edit crontab
crontab -e

# Current: 0 2 * * * (2:00 AM daily)
# Change to 0 3 * * * (3:00 AM daily)
# Or: 0 */6 * * * (Every 6 hours)
# Or: 0 0 * * 0 (Weekly on Sunday midnight)

# Save and exit
```

### Change Retention Period

```bash
# Edit backup script
nano /var/www/ayurveda/daily_backup.py

# Find line:
# MAX_BACKUPS_TO_KEEP = 30

# Change to your desired number (e.g., 7, 15, 60, 90)
MAX_BACKUPS_TO_KEEP = 60  # Keep 60 days

# Save and exit
```

---

## DISASTER RECOVERY PLAN

### Scenario 1: Data Lost Today (Within 30 days)

1. **Immediate Action:**
   ```bash
   ssh root@88.222.244.84
   cd /var/www/ayurveda
   pm2 stop ayurveda-clinic
   python3 restore_from_backup.py 1  # Latest backup
   pm2 restart ayurveda-clinic
   ```

2. **Verify:** Check that data is restored
3. **Time to recover:** ~5 minutes

### Scenario 2: Need Data from Specific Date

1. **List Backups:**
   ```bash
   ls -lh backups/daily/ | nl
   ```

2. **Find desired backup by date** in filename

3. **Restore:**
   ```bash
   python3 restore_from_backup.py [NUMBER]
   ```

### Scenario 3: Complete Server Failure

1. **Download backups from server** (if accessible):
   ```bash
   scp -r root@88.222.244.84:/var/www/ayurveda/backups/ ./local_backups/
   ```

2. **Set up new server**

3. **Upload backups and restore**

### Scenario 4: Accidental Data Deletion

1. **Stop making changes immediately**
2. **Restore from latest backup** (before deletion)
3. **Verify what was lost**
4. **Re-enter any changes made after backup**

---

## BEST PRACTICES

### ✅ DO:
- ✅ Test restoration monthly
- ✅ Monitor backup logs weekly
- ✅ Keep monthly backups indefinitely (if space allows)
- ✅ Download critical backups to local machine
- ✅ Verify backup content occasionally
- ✅ Document any major changes

### ❌ DON'T:
- ❌ Disable backups without alternative
- ❌ Delete all backups at once
- ❌ Ignore backup failure notifications
- ❌ Restore without stopping application
- ❌ Forget to restart application after restore

---

## BACKUP TESTING PROCEDURE

**Recommended: Test monthly**

1. **Create test backup:**
   ```bash
   python3 /var/www/ayurveda/daily_backup.py
   ```

2. **Verify backup created:**
   ```bash
   ls -lh /var/www/ayurveda/backups/daily/ | tail -2
   ```

3. **Check backup content:**
   ```bash
   cat [backup_dir]/SUMMARY.txt
   ```

4. **Test restoration** (on sandbox/test environment):
   ```bash
   # Don't test on production unless necessary!
   python3 restore_from_backup.py 1
   ```

5. **Verify data** after restore

6. **Document results**

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue: No backups appearing**
- Check cron is running: `systemctl status cron`
- Check script path in crontab: `crontab -l`
- Check permissions: `ls -l daily_backup.py`

**Issue: Backup script errors**
- Check API is accessible: `curl https://tpsdhanvantariayurveda.in/api/patients`
- Check disk space: `df -h`
- View error log: `cat backups/backup_error_*.log`

**Issue: Restoration fails**
- Check database file exists
- Check database permissions
- Stop application before restoring
- Check restore script for errors

---

## SUMMARY

### What's Backed Up:
- ✅ All Patients (full details)
- ✅ All Prescriptions (with medicines)
- ✅ All Medicines (dosage, schedule, notes)
- ✅ All Payment Collections
- ✅ All Appointments
- ✅ All Reminders
- ✅ System Settings

### Schedule:
- **Daily:** 2:00 AM (automatic)
- **Monthly:** 1st of month (automatic)
- **Manual:** Anytime (run script)

### Retention:
- **Daily:** 30 days
- **Monthly:** Unlimited (manual cleanup)

### Recovery Time:
- **Full Restoration:** ~5 minutes
- **Data Loss Risk:** Maximum 24 hours (since last backup)

---

**Setup Status:** ⚠️ NOT YET INSTALLED ON PRODUCTION  
**Next Step:** Run installation commands on production server  
**Support:** Review this document for all operations

---

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Prepared By:** AI Development Assistant

