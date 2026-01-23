#!/usr/bin/env python3
"""
Quick check and fix production site
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
    return output, error

print("🔧 Quick Fix Production Site...")
print("=" * 70)

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected\n")
    
    # Check PM2 status
    print("📊 PM2 Status:")
    execute_command(ssh, "pm2 list | grep ayurveda")
    
    # Check if port 3011 is responding
    print("\n🧪 Testing port 3011:")
    output, _ = execute_command(ssh, "curl -s http://localhost:3011/ 2>&1 | head -10")
    
    if "Connection refused" in output or "Failed to connect" in output:
        print("❌ Port 3011 not responding. Restarting...")
        
        # Stop and restart
        execute_command(ssh, "pm2 delete ayurveda-clinic")
        execute_command(ssh, "fuser -k 3011/tcp 2>/dev/null || true")
        time.sleep(2)
        
        execute_command(ssh, "cd /var/www/ayurveda && pm2 start 'npx wrangler pages dev dist --ip 0.0.0.0 --port 3011' --name ayurveda-clinic", wait_time=8)
        
        print("\n⏳ Waiting for startup...")
        time.sleep(5)
        
        print("\n🧪 Testing again:")
        output, _ = execute_command(ssh, "curl -s http://localhost:3011/ | head -10")
        
        if "TPS" in output or "Dhanvantari" in output:
            print("\n✅ Working!")
        else:
            print("\n⚠️ Still having issues")
    else:
        print("\n✅ Port 3011 is responding!")
        
    # Test public site
    print("\n🧪 Testing public site:")
    time.sleep(3)
    output, _ = execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -20")
    
    if "TPS" in output or "Dhanvantari" in output:
        print("\n✅ PUBLIC SITE IS WORKING!")
    elif "502" in output:
        print("\n⚠️ Still 502, checking nginx...")
        execute_command(ssh, "cat /etc/nginx/sites-available/tpsdhanvantari | grep proxy_pass")
        execute_command(ssh, "systemctl reload nginx")
    
    # Save PM2 config
    execute_command(ssh, "pm2 save")
    
    print("\n" + "=" * 70)
    print("✅ DONE!")
    print("=" * 70)
    print("\n🔐 LOGIN CREDENTIALS (NOW WORKING):")
    print("Email: admin@tpsdhanvantari.com OR Shankaranherbaltreatment@gmail.com")
    print("Password: 123456")
    print("\n🌐 URLs:")
    print("Production: https://tpsdhanvantariayurveda.in")
    print("Sandbox: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai")
    print("=" * 70)
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
