#!/usr/bin/env python3
"""
Check and fix login credentials
"""

import paramiko
import time

HOST = "88.222.244.84"
USER = "root"
PASSWORD = "Yourkpo@202526"

def execute_command(ssh, command, wait_time=2):
    """Execute a command and print output"""
    print(f"\n$ {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    time.sleep(wait_time)
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    if output:
        print(output)
    if error and 'warning' not in error.lower():
        print(f"ERROR: {error}")
    return output, error

print("🔍 Checking Login Credentials...")
print("=" * 70)

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected to server\n")
    
    # Check if database exists
    print("📁 Checking database file:")
    output, _ = execute_command(ssh, "ls -lh /var/www/ayurveda/ayurveda.db")
    
    # Check admin users
    print("\n👤 Checking admin users in database:")
    output, _ = execute_command(ssh, "cd /var/www/ayurveda && sqlite3 ayurveda.db 'SELECT id, email, password FROM admin_users;'")
    
    if "no such table" in output.lower() or not output.strip():
        print("\n⚠️  No admin users found! Let's create one...")
        
        # Check if table exists
        print("\n📋 Checking if admin_users table exists:")
        execute_command(ssh, "cd /var/www/ayurveda && sqlite3 ayurveda.db '.tables'")
        
        # Create admin user
        print("\n✏️ Creating admin user...")
        create_user_sql = """
        INSERT OR REPLACE INTO admin_users (id, email, password, name, created_at) 
        VALUES (1, 'Shankaranherbaltreatment@gmail.com', '123456', 'Admin User', datetime('now'));
        """
        execute_command(ssh, f"cd /var/www/ayurveda && sqlite3 ayurveda.db \"{create_user_sql}\"")
        
        # Verify creation
        print("\n✅ Verifying admin user:")
        execute_command(ssh, "cd /var/www/ayurveda && sqlite3 ayurveda.db 'SELECT id, email, password, name FROM admin_users;'")
    else:
        print("\n✅ Admin users found in database!")
    
    # Also check seed.sql to see what credentials should be
    print("\n📄 Checking seed.sql file for default credentials:")
    execute_command(ssh, "cd /var/www/ayurveda && cat seed.sql | grep -A5 'admin_users'")
    
    print("\n" + "=" * 70)
    print("✅ CREDENTIALS CHECK COMPLETE")
    print("=" * 70)
    print("\nIf credentials were found/created, try logging in with:")
    print("Email: Shankaranherbaltreatment@gmail.com")
    print("Password: 123456")
    print("\nIf still not working, check the application logs:")
    print("pm2 logs ayurveda-clinic --nostream --lines 50")
    print("=" * 70)
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
