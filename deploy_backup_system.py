#!/usr/bin/env python3
"""
Deploy Automated Backup System to Production Server
This script uploads and configures the backup system on production
"""
import paramiko
import time
import os

HOST = "88.222.244.84"
USER = "root"
PASSWORD = "Yourkpo@202526"
REMOTE_PATH = "/var/www/ayurveda"

print("=" * 80)
print("🚀 DEPLOYING AUTOMATED BACKUP SYSTEM")
print("=" * 80)
print(f"Target: {HOST}")
print(f"Remote Path: {REMOTE_PATH}")
print("=" * 80)

try:
    # Connect to server
    print("\n🔌 Step 1: Connecting to production server...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("   ✅ Connected!")
    
    # Upload files
    print("\n📤 Step 2: Uploading backup system files...")
    sftp = ssh.open_sftp()
    
    files_to_upload = [
        ("daily_backup.py", "Backup script"),
        ("restore_from_backup.py", "Restore script"),
        ("setup_daily_backup.sh", "Setup script"),
        ("BACKUP_SYSTEM_DOCUMENTATION.md", "Documentation")
    ]
    
    for local_file, description in files_to_upload:
        if os.path.exists(local_file):
            remote_file = f"{REMOTE_PATH}/{local_file}"
            print(f"   Uploading {description}...")
            sftp.put(local_file, remote_file)
            print(f"   ✅ {local_file} uploaded")
        else:
            print(f"   ⚠️  {local_file} not found locally")
    
    sftp.close()
    
    # Make scripts executable
    print("\n🔧 Step 3: Making scripts executable...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_PATH} && chmod +x daily_backup.py restore_from_backup.py setup_daily_backup.sh")
    time.sleep(1)
    print("   ✅ Scripts made executable")
    
    # Run setup script
    print("\n⚙️  Step 4: Running setup script...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_PATH} && ./setup_daily_backup.sh")
    time.sleep(5)
    output = stdout.read().decode('utf-8')
    print(output)
    
    # Verify cron job
    print("\n✅ Step 5: Verifying cron job installation...")
    stdin, stdout, stderr = ssh.exec_command("crontab -l | grep daily_backup")
    time.sleep(1)
    cron_output = stdout.read().decode('utf-8')
    if "daily_backup.py" in cron_output:
        print("   ✅ Cron job installed successfully:")
        print(f"   {cron_output.strip()}")
    else:
        print("   ⚠️  Cron job may not be installed properly")
    
    # Check backup directory
    print("\n📁 Step 6: Checking backup directories...")
    stdin, stdout, stderr = ssh.exec_command(f"ls -lh {REMOTE_PATH}/backups/daily/ 2>/dev/null | head -10")
    time.sleep(1)
    backup_output = stdout.read().decode('utf-8')
    if backup_output:
        print("   ✅ Backup directory exists:")
        print(backup_output)
    else:
        print("   ℹ️  No backups yet (will be created at 2 AM)")
    
    # Test manual backup
    print("\n🧪 Step 7: Testing manual backup...")
    print("   Running backup script (this may take 1-2 minutes)...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_PATH} && python3 daily_backup.py 2>&1")
    time.sleep(30)  # Wait for backup to complete
    test_output = stdout.read().decode('utf-8')
    test_error = stderr.read().decode('utf-8')
    
    if "BACKUP COMPLETE" in test_output or "BACKUP SUCCESSFUL" in test_output:
        print("   ✅ Test backup successful!")
    else:
        print("   ⚠️  Test backup may have issues:")
        print(test_output[-500:] if len(test_output) > 500 else test_output)
        if test_error:
            print("   Errors:")
            print(test_error[-500:] if len(test_error) > 500 else test_error)
    
    # List created backups
    print("\n📋 Step 8: Listing backups...")
    stdin, stdout, stderr = ssh.exec_command(f"ls -lh {REMOTE_PATH}/backups/daily/ | tail -5")
    time.sleep(1)
    backup_list = stdout.read().decode('utf-8')
    print(backup_list)
    
    ssh.close()
    
    print("\n" + "=" * 80)
    print("✅ DEPLOYMENT COMPLETE!")
    print("=" * 80)
    print("\n📊 Backup System Configuration:")
    print("   • Daily Backup: 2:00 AM (automatic)")
    print("   • Retention: 30 days")
    print("   • Location: /var/www/ayurveda/backups/")
    print("   • Log: /var/www/ayurveda/logs/daily_backup.log")
    print("\n📝 Useful Commands (run on server):")
    print("   • View backups: ls -lh /var/www/ayurveda/backups/daily/")
    print("   • Manual backup: python3 /var/www/ayurveda/daily_backup.py")
    print("   • Restore: python3 /var/www/ayurveda/restore_from_backup.py")
    print("   • View logs: tail -f /var/www/ayurveda/logs/daily_backup.log")
    print("   • Check cron: crontab -l")
    print("\n⚠️  Important:")
    print("   • First automatic backup will run tomorrow at 2:00 AM")
    print("   • Test restoration procedure soon")
    print("   • Monitor logs for first few days")
    print("\n📖 Full Documentation:")
    print("   • /var/www/ayurveda/BACKUP_SYSTEM_DOCUMENTATION.md")
    print("   • Also available in GitHub: https://github.com/ekodecrux/ayurvedatps")
    print("\n" + "=" * 80)
    
except Exception as e:
    print(f"\n❌ Deployment failed!")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    print("\n💡 Troubleshooting:")
    print("   1. Check if server is accessible: ping 88.222.244.84")
    print("   2. Verify SSH credentials")
    print("   3. Check if /var/www/ayurveda directory exists")
    print("   4. Try manual deployment via SSH")
