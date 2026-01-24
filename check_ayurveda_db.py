#!/usr/bin/env python3
"""
Check the ayurveda.db file on production server
"""
import paramiko
import time

HOST = "88.222.244.84"
USER = "root"
PASSWORD = "Yourkpo@202526"
REMOTE_PATH = "/var/www/ayurveda"

print("🔍 Checking ayurveda.db file...")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    
    # Check ayurveda.db
    print("\n1. Checking medicines_tracking table...")
    stdin, stdout, stderr = ssh.exec_command(f'sqlite3 "{REMOTE_PATH}/ayurveda.db" "SELECT COUNT(*) FROM medicines_tracking;" 2>&1')
    time.sleep(1)
    count = stdout.read().decode('utf-8').strip()
    print(f"   Medicines count: {count}")
    
    if count and count.isdigit() and int(count) > 0:
        # Get ALL medicine data
        print("\n2. Getting ALL medicines data...")
        stdin, stdout, stderr = ssh.exec_command(f'sqlite3 "{REMOTE_PATH}/ayurveda.db" "SELECT * FROM medicines_tracking;" 2>&1')
        time.sleep(2)
        data = stdout.read().decode('utf-8')
        print(data)
        
        # Check prescriptions
        print("\n3. Checking prescriptions (herbs_routes)...")
        stdin, stdout, stderr = ssh.exec_command(f'sqlite3 "{REMOTE_PATH}/ayurveda.db" "SELECT COUNT(*) FROM prescriptions;" 2>&1')
        time.sleep(1)
        count2 = stdout.read().decode('utf-8').strip()
        print(f"   Prescriptions count: {count2}")
        
        if count2 and count2.isdigit() and int(count2) > 0:
            stdin, stdout, stderr = ssh.exec_command(f'sqlite3 "{REMOTE_PATH}/ayurveda.db" "SELECT id, patient_id, course, created_at FROM prescriptions;" 2>&1')
            time.sleep(2)
            prescriptions = stdout.read().decode('utf-8')
            print(prescriptions)
    
    # Download the ayurveda.db file
    print("\n4. Downloading ayurveda.db...")
    sftp = ssh.open_sftp()
    local_file = "/home/user/webapp/production_ayurveda.db"
    sftp.get(f"{REMOTE_PATH}/ayurveda.db", local_file)
    print(f"✅ Downloaded to: {local_file}")
    sftp.close()
    
    ssh.close()
    print("\n✅ Complete!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
