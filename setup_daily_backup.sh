#!/bin/bash
"""
Setup Daily Automated Backup with Cron
This script configures cron to run daily backups automatically
"""

SCRIPT_DIR="/var/www/ayurveda"
BACKUP_SCRIPT="$SCRIPT_DIR/daily_backup.py"
LOG_DIR="/var/www/ayurveda/logs"
CRON_TIME="0 2 * * *"  # Run at 2:00 AM daily

echo "=========================================="
echo "AUTOMATED BACKUP SETUP"
echo "=========================================="
echo ""

# Create log directory
mkdir -p "$LOG_DIR"
echo "✅ Created log directory: $LOG_DIR"

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"
echo "✅ Made backup script executable"

# Check if cron job already exists
CRON_JOB="$CRON_TIME /usr/bin/python3 $BACKUP_SCRIPT >> $LOG_DIR/daily_backup.log 2>&1"

if crontab -l 2>/dev/null | grep -q "daily_backup.py"; then
    echo "⚠️  Cron job already exists. Updating..."
    crontab -l | grep -v "daily_backup.py" | crontab -
fi

# Add cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Added cron job:"
echo "   Schedule: Daily at 2:00 AM"
echo "   Script: $BACKUP_SCRIPT"
echo "   Log: $LOG_DIR/daily_backup.log"
echo ""

# Verify cron job
echo "📋 Current cron jobs:"
crontab -l | grep "daily_backup.py"
echo ""

# Test backup script
echo "🧪 Testing backup script..."
echo "=========================================="
/usr/bin/python3 "$BACKUP_SCRIPT"
TEST_EXIT_CODE=$?
echo "=========================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Backup test successful!"
else
    echo "❌ Backup test failed! Exit code: $TEST_EXIT_CODE"
fi

echo ""
echo "=========================================="
echo "SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "📊 Configuration Summary:"
echo "   • Backup Schedule: Daily at 2:00 AM"
echo "   • Backup Location: /var/www/ayurveda/backups/daily/"
echo "   • Retention: 30 days"
echo "   • Monthly Backups: 1st of each month"
echo "   • Log File: $LOG_DIR/daily_backup.log"
echo ""
echo "📝 Useful Commands:"
echo "   • View cron jobs: crontab -l"
echo "   • Edit cron jobs: crontab -e"
echo "   • View backup log: tail -f $LOG_DIR/daily_backup.log"
echo "   • List backups: ls -lh /var/www/ayurveda/backups/daily/"
echo "   • Manual backup: python3 $BACKUP_SCRIPT"
echo "   • Restore backup: python3 $SCRIPT_DIR/restore_from_backup.py"
echo ""
echo "=========================================="
