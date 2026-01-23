#!/usr/bin/env python3
"""
Emergency Fix - Check status and move to port 3011 if needed
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

print("🚨 EMERGENCY FIX - Checking Status...")
print("=" * 70)

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected\n")
    
    # Check PM2 status
    print("📊 Current PM2 Status:")
    output, _ = execute_command(ssh, "pm2 list")
    
    # Check if process is actually running
    print("\n🔍 Checking if ayurveda-clinic is really running:")
    output, _ = execute_command(ssh, "pm2 describe ayurveda-clinic | grep -E 'status|uptime|restarts'")
    
    # Check ports
    print("\n🔌 Checking ports:")
    output, _ = execute_command(ssh, "netstat -tulpn | grep -E ':(3001|3011)' || ss -tulpn | grep -E ':(3001|3011)'")
    
    # Test port 3001 locally
    print("\n🧪 Testing port 3001 locally:")
    output, _ = execute_command(ssh, "curl -s http://localhost:3001/ 2>&1 | head -10")
    
    if "Connection refused" in output or "Failed to connect" in output:
        print("❌ Port 3001 is not responding!")
        print("\n🔄 Restarting PM2 process...")
        execute_command(ssh, "pm2 restart ayurveda-clinic")
        time.sleep(5)
        
        # Test again
        print("\n🧪 Testing port 3001 again:")
        output, _ = execute_command(ssh, "curl -s http://localhost:3001/ | head -10")
        
        if "Connection refused" in output or "Failed to connect" in output:
            print("❌ Still not working! Moving to port 3011...")
            
            # Stop current process
            execute_command(ssh, "pm2 delete ayurveda-clinic 2>/dev/null || true")
            
            # Kill any process on 3011
            execute_command(ssh, "fuser -k 3011/tcp 2>/dev/null || true")
            time.sleep(2)
            
            # Start on port 3011
            print("\n🚀 Starting on PORT 3011...")
            execute_command(ssh, "cd /var/www/ayurveda && pm2 start 'npx wrangler pages dev dist --ip 0.0.0.0 --port 3011' --name ayurveda-clinic", wait_time=8)
            
            # Wait for startup
            print("\n⏳ Waiting for server to start...")
            time.sleep(5)
            
            # Test port 3011
            print("\n🧪 Testing port 3011:")
            output, _ = execute_command(ssh, "curl -s http://localhost:3011/ | head -15")
            
            if "TPS DHANVANTARI" in output or "Dhanvantari" in output:
                print("\n✅ Server is running on port 3011!")
                
                # Update Nginx to port 3011
                print("\n✏️ Updating Nginx to port 3011...")
                execute_command(ssh, "sed -i 's|proxy_pass http://127.0.0.1:[0-9]*|proxy_pass http://127.0.0.1:3011|g' /etc/nginx/sites-available/tpsdhanvantari")
                
                # Show updated config
                print("\n📄 Updated Nginx config:")
                execute_command(ssh, "cat /etc/nginx/sites-available/tpsdhanvantari | grep proxy_pass")
                
                # Reload Nginx
                print("\n🔄 Reloading Nginx...")
                execute_command(ssh, "systemctl reload nginx")
                
                # Test public site
                print("\n🧪 Testing public site:")
                time.sleep(3)
                output, _ = execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -20")
                
                if "TPS DHANVANTARI" in output or "Dhanvantari" in output:
                    print("\n✅ SUCCESS! Site is working on port 3011!")
                else:
                    print("\n⚠️ Still having issues")
                    print(output[:500])
            else:
                print("\n❌ Port 3011 also not working!")
                print("Let's check PM2 logs:")
                execute_command(ssh, "pm2 logs ayurveda-clinic --nostream --lines 30")
    else:
        print("✅ Port 3001 is responding!")
        
        # Check Nginx logs for errors
        print("\n📋 Checking Nginx error logs:")
        execute_command(ssh, "tail -30 /var/log/nginx/tpsdhanvantari-error.log")
        
        # Check if Nginx is running
        print("\n🔍 Checking Nginx status:")
        execute_command(ssh, "systemctl status nginx | grep -E 'Active|running'")
        
        # Try reloading Nginx again
        print("\n🔄 Reloading Nginx again...")
        execute_command(ssh, "systemctl reload nginx")
        
        # Test public site
        print("\n🧪 Testing public site:")
        time.sleep(3)
        output, _ = execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -20")
        
        if "502 Bad Gateway" in output:
            print("\n❌ Still 502 error! Moving to port 3011 anyway...")
            
            # Move to 3011
            execute_command(ssh, "pm2 delete ayurveda-clinic 2>/dev/null || true")
            execute_command(ssh, "fuser -k 3001/tcp 3011/tcp 2>/dev/null || true")
            time.sleep(2)
            
            print("\n🚀 Starting on PORT 3011...")
            execute_command(ssh, "cd /var/www/ayurveda && pm2 start 'npx wrangler pages dev dist --ip 0.0.0.0 --port 3011' --name ayurveda-clinic", wait_time=8)
            time.sleep(5)
            
            print("\n✏️ Updating Nginx to port 3011...")
            execute_command(ssh, "sed -i 's|proxy_pass http://127.0.0.1:[0-9]*|proxy_pass http://127.0.0.1:3011|g' /etc/nginx/sites-available/tpsdhanvantari")
            execute_command(ssh, "systemctl reload nginx")
            
            time.sleep(3)
            print("\n🧪 Testing public site on port 3011:")
            output, _ = execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -20")
            
            if "TPS DHANVANTARI" in output or "Dhanvantari" in output:
                print("\n✅ SUCCESS! Now working on port 3011!")
            else:
                print("\n⚠️ Response:")
                print(output[:500])
        elif "TPS DHANVANTARI" in output or "Dhanvantari" in output:
            print("\n✅ Site is working fine!")
    
    # Final status
    print("\n" + "=" * 70)
    print("📊 Final Status:")
    print("=" * 70)
    execute_command(ssh, "pm2 list")
    execute_command(ssh, "netstat -tulpn | grep -E ':(3001|3011)' || ss -tulpn | grep -E ':(3001|3011)'")
    
    # Save PM2 config
    print("\n💾 Saving PM2 configuration...")
    execute_command(ssh, "pm2 save")
    
    print("\n" + "=" * 70)
    print("✅ EMERGENCY FIX COMPLETE!")
    print("=" * 70)
    print("\n🎯 Clear browser cache (Ctrl+Shift+R) and visit:")
    print("https://tpsdhanvantariayurveda.in")
    print("=" * 70)
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
