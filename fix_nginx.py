#!/usr/bin/env python3
"""
Fix Nginx Configuration for TPS Dhanvantari Ayurveda
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

print("🔧 Fixing Nginx Configuration...")
print("=" * 70)

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected to server\n")
    
    # Check which nginx config file exists
    print("📋 Checking Nginx configuration files...")
    execute_command(ssh, "ls -la /etc/nginx/sites-available/ | grep -E 'tps|ayurveda'")
    
    # Check the content of tpsdhanvantari config
    print("\n📄 Current tpsdhanvantari Nginx config:")
    output, _ = execute_command(ssh, "cat /etc/nginx/sites-available/tpsdhanvantari")
    
    # Backup current config
    print("\n💾 Backing up current config...")
    execute_command(ssh, "cp /etc/nginx/sites-available/tpsdhanvantari /etc/nginx/sites-available/tpsdhanvantari.backup.$(date +%Y%m%d_%H%M%S)")
    
    # Update proxy_pass to port 3001
    print("\n✏️ Updating proxy_pass to port 3001...")
    execute_command(ssh, "sed -i 's|proxy_pass http://[^;]*|proxy_pass http://127.0.0.1:3001|g' /etc/nginx/sites-available/tpsdhanvantari")
    
    # Show updated config
    print("\n📄 Updated config (proxy_pass lines):")
    execute_command(ssh, "cat /etc/nginx/sites-available/tpsdhanvantari | grep -A2 -B2 proxy_pass")
    
    # Test nginx config
    print("\n🧪 Testing Nginx configuration...")
    output, error = execute_command(ssh, "nginx -t")
    
    if "syntax is ok" in output or "test is successful" in output:
        print("\n✅ Nginx config is valid!")
        
        # Reload nginx
        print("\n🔄 Reloading Nginx...")
        execute_command(ssh, "systemctl reload nginx")
        print("✅ Nginx reloaded successfully!")
        
        # Wait and test
        print("\n⏳ Waiting 3 seconds for changes to propagate...")
        time.sleep(3)
        
        # Test local endpoint
        print("\n🧪 Testing local endpoint (port 3001):")
        output, _ = execute_command(ssh, "curl -s http://localhost:3001/ | head -20")
        if "Dhanvantari" in output or "Ayurveda" in output:
            print("✅ Local endpoint works!")
        
        # Test public endpoint
        print("\n🧪 Testing public endpoint (https://tpsdhanvantariayurveda.in):")
        output, _ = execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -30")
        
        if "502 Bad Gateway" in output:
            print("❌ Still getting 502 error")
            print("\n🔍 Checking if server_name is correct...")
            execute_command(ssh, "cat /etc/nginx/sites-available/tpsdhanvantari | grep server_name")
        elif "Dhanvantari" in output or "Ayurveda" in output:
            print("✅ PUBLIC SITE IS WORKING!")
        else:
            print("⚠️ Unexpected response")
            
    else:
        print("\n❌ Nginx config test failed!")
        print("Restoring backup...")
        execute_command(ssh, "cp /etc/nginx/sites-available/tpsdhanvantari.backup.* /etc/nginx/sites-available/tpsdhanvantari 2>/dev/null | tail -1")
    
    # Final status
    print("\n" + "=" * 70)
    print("📊 Final Status:")
    print("=" * 70)
    execute_command(ssh, "pm2 list")
    execute_command(ssh, "netstat -tulpn | grep 3001 || ss -tulpn | grep 3001")
    
    print("\n" + "=" * 70)
    print("🎯 NEXT STEPS:")
    print("=" * 70)
    print("1. Clear browser cache: Ctrl+Shift+R")
    print("2. Visit: https://tpsdhanvantariayurveda.in")
    print("3. Should see: TPS DHANVANTARI AYURVEDA")
    print("=" * 70)
    
    ssh.close()
    print("\n✅ Done!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
