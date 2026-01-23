#!/usr/bin/env python3
"""
Setup admin_users table and create admin account
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

print("🔧 Setting up Admin Users Table and Account...")
print("=" * 70)

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected\n")
    
    # Create admin_users table
    print("📋 Creating admin_users table...")
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        profile_picture TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """
    execute_command(ssh, f'cd /var/www/ayurveda && sqlite3 ayurveda.db "{create_table_sql}"')
    
    # Verify table creation
    print("\n✅ Verifying table:")
    execute_command(ssh, "cd /var/www/ayurveda && sqlite3 ayurveda.db '.tables'")
    
    # Insert admin user with simple password for now
    # Using sha256 hash of "123456" = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
    print("\n✏️ Creating admin account...")
    insert_admin_sql = """
    INSERT OR REPLACE INTO admin_users (id, email, password_hash, name, created_at) 
    VALUES (
        1, 
        'admin@tpsdhanvantari.com', 
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 
        'TPS Admin', 
        datetime('now')
    );
    """
    execute_command(ssh, f'cd /var/www/ayurveda && sqlite3 ayurveda.db "{insert_admin_sql}"')
    
    # Also add the alternative email
    print("\n✏️ Adding alternative admin account...")
    insert_admin2_sql = """
    INSERT OR REPLACE INTO admin_users (id, email, password_hash, name, created_at) 
    VALUES (
        2, 
        'Shankaranherbaltreatment@gmail.com', 
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 
        'Shankaran Admin', 
        datetime('now')
    );
    """
    execute_command(ssh, f'cd /var/www/ayurveda && sqlite3 ayurveda.db "{insert_admin2_sql}"')
    
    # Verify creation
    print("\n✅ Verifying admin users:")
    execute_command(ssh, "cd /var/www/ayurveda && sqlite3 ayurveda.db 'SELECT id, email, name FROM admin_users;'")
    
    # Restart the application to pick up changes
    print("\n🔄 Restarting application...")
    execute_command(ssh, "pm2 restart ayurveda-clinic")
    
    time.sleep(3)
    
    # Test the site
    print("\n🧪 Testing site...")
    execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -10")
    
    print("\n" + "=" * 70)
    print("✅ ADMIN SETUP COMPLETE!")
    print("=" * 70)
    print("\n🔐 LOGIN CREDENTIALS:")
    print("=" * 70)
    print("\nOption 1:")
    print("  Email: admin@tpsdhanvantari.com")
    print("  Password: 123456")
    print("\nOption 2:")
    print("  Email: Shankaranherbaltreatment@gmail.com")
    print("  Password: 123456")
    print("\n" + "=" * 70)
    print("\n🌐 Production URL: https://tpsdhanvantariayurveda.in")
    print("🌐 Sandbox URL: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai")
    print("\n⚠️  IMPORTANT: Clear browser cache (Ctrl+Shift+R) before logging in!")
    print("=" * 70)
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
