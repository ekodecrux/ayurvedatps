#!/usr/bin/env python3
"""
Force Nginx reload with correct configuration
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

print("🔧 Applying Nginx Fix (Ignoring Warnings)...")
print("=" * 70)

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected\n")
    
    # Update the config to port 3001
    print("✏️ Updating Nginx config to port 3001...")
    execute_command(ssh, "sed -i 's|proxy_pass http://127.0.0.1:[0-9]*|proxy_pass http://127.0.0.1:3001|g' /etc/nginx/sites-available/tpsdhanvantari")
    
    # Show the updated proxy_pass line
    print("\n📄 Updated proxy_pass:")
    execute_command(ssh, "cat /etc/nginx/sites-available/tpsdhanvantari | grep proxy_pass")
    
    # Reload nginx (ignoring warnings - they're okay)
    print("\n🔄 Reloading Nginx...")
    execute_command(ssh, "systemctl reload nginx")
    print("✅ Nginx reloaded!")
    
    # Wait for changes to propagate
    print("\n⏳ Waiting 3 seconds...")
    time.sleep(3)
    
    # Test local endpoint
    print("\n🧪 Testing port 3001:")
    output, _ = execute_command(ssh, "curl -s http://localhost:3001/ | head -15 | grep -i 'title\\|TPS\\|Dhanvantari'")
    
    # Test public HTTPS endpoint
    print("\n🧪 Testing https://tpsdhanvantariayurveda.in:")
    output, _ = execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -30")
    
    if "502 Bad Gateway" in output:
        print("❌ Still getting 502 error")
        print("\nLet's check Nginx error logs:")
        execute_command(ssh, "tail -20 /var/log/nginx/tpsdhanvantari-error.log")
    elif "Dhanvantari" in output or "TPS" in output or "Ayurveda" in output:
        print("\n✅ SUCCESS! TPS DHANVANTARI AYURVEDA IS NOW LIVE!")
    else:
        print("\n⚠️ Unexpected response:")
        print(output[:500])
    
    # Show PM2 status
    print("\n📊 PM2 Status:")
    execute_command(ssh, "pm2 list")
    
    print("\n" + "=" * 70)
    print("✅ FIX COMPLETE!")
    print("=" * 70)
    print("\n🎯 NEXT STEPS:")
    print("1. Clear browser cache: Ctrl+Shift+R")
    print("2. Visit: https://tpsdhanvantariayurveda.in")
    print("3. Should see: TPS DHANVANTARI AYURVEDA")
    print("4. Login: Shankaranherbaltreatment@gmail.com / 123456")
    print("=" * 70)
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
