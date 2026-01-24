#!/usr/bin/env python3
"""
URGENT: Check and backup production database BEFORE it's lost
"""
import paramiko
import time
import os

HOST = "88.222.244.84"
USER = "root"
PASSWORD = "Yourkpo@202526"
REMOTE_PATH = "/var/www/ayurveda"

print("=" * 80)
print("🚨 URGENT DATABASE RECOVERY")
print("=" * 80)

try:
    print("\n🔌 Connecting to production VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected!")
    
    # Find database file
    print("\n📁 Step 1: Locating database files...")
    stdin, stdout, stderr = ssh.exec_command(f"find {REMOTE_PATH} -name '*.db' -o -name '*.sqlite*' 2>/dev/null | grep -v node_modules")
    time.sleep(2)
    db_files = stdout.read().decode('utf-8').strip()
    print("Database files found:")
    print(db_files if db_files else "  (No .db files found)")
    
    # Check for database file
    print("\n📁 Step 2: Looking for ayurveda database...")
    stdin, stdout, stderr = ssh.exec_command(f"ls -lah {REMOTE_PATH}/*.db {REMOTE_PATH}/*.sqlite* 2>/dev/null")
    time.sleep(1)
    output = stdout.read().decode('utf-8')
    print(output if output else "  (No database files in main directory)")
    
    # Check .wrangler directory
    print("\n📁 Step 3: Checking .wrangler D1 database...")
    stdin, stdout, stderr = ssh.exec_command(f"find {REMOTE_PATH}/.wrangler/state -name '*.sqlite' 2>/dev/null")
    time.sleep(2)
    d1_db = stdout.read().decode('utf-8').strip()
    print("D1 databases found:")
    print(d1_db if d1_db else "  (No D1 databases found)")
    
    # If D1 database found, check its content
    if d1_db:
        db_path = d1_db.split('\n')[0]  # Get first DB
        print(f"\n🔍 Step 4: Checking database content: {db_path}")
        
        # Check medicines_tracking count
        stdin, stdout, stderr = ssh.exec_command(f'sqlite3 "{db_path}" "SELECT COUNT(*) FROM medicines_tracking;" 2>&1')
        time.sleep(1)
        count = stdout.read().decode('utf-8').strip()
        print(f"  Medicines count: {count}")
        
        if count and count.isdigit() and int(count) > 0:
            # Get sample data
            print("\n📋 Step 5: Getting medicine data...")
            stdin, stdout, stderr = ssh.exec_command(f'sqlite3 "{db_path}" "SELECT id, herbs_route_id, medicine_name, course FROM medicines_tracking LIMIT 10;" 2>&1')
            time.sleep(2)
            data = stdout.read().decode('utf-8')
            print("Sample medicines:")
            print(data if data else "  (No data)")
            
            # Create backup
            print("\n💾 Step 6: Creating URGENT BACKUP...")
            backup_name = f"URGENT_BACKUP_{time.strftime('%Y%m%d_%H%M%S')}.db"
            stdin, stdout, stderr = ssh.exec_command(f'cp "{db_path}" "{REMOTE_PATH}/backups/{backup_name}" 2>&1')
            time.sleep(2)
            print(f"✅ Backup created: {REMOTE_PATH}/backups/{backup_name}")
            
            # Download backup
            print("\n⬇️  Step 7: Downloading backup to local machine...")
            sftp = ssh.open_sftp()
            local_backup = f"/home/user/webapp/PRODUCTION_BACKUP_{time.strftime('%Y%m%d_%H%M%S')}.db"
            try:
                sftp.get(f"{REMOTE_PATH}/backups/{backup_name}", local_backup)
                print(f"✅ Downloaded to: {local_backup}")
                
                # Verify local backup
                if os.path.exists(local_backup):
                    size = os.path.getsize(local_backup)
                    print(f"   File size: {size:,} bytes")
            except Exception as e:
                print(f"⚠️  Download failed: {e}")
            
            sftp.close()
        else:
            print("⚠️  Database appears empty or has no medicines_tracking table")
    
    # Check if using Cloudflare D1 for production
    print("\n📋 Step 8: Checking Cloudflare D1 configuration...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_PATH} && cat wrangler.jsonc 2>/dev/null | grep -A 5 d1_databases")
    time.sleep(1)
    config = stdout.read().decode('utf-8')
    print(config if config else "  (No D1 configuration found)")
    
    ssh.close()
    
    print("\n" + "=" * 80)
    print("✅ RECOVERY CHECK COMPLETE")
    print("=" * 80)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
