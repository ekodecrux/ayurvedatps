#!/usr/bin/env python3
"""
Fix Port Conflict - TPS Dhanvantari Ayurveda
This script connects to the VPS and fixes the port conflict issue
"""

import paramiko
import time
import sys

# SSH connection details
HOST = "88.222.244.84"
USER = "root"
PASSWORD = "Yourkpo@202425"

def execute_command(ssh, command, wait_time=2):
    """Execute a command and print output"""
    print(f"\n$ {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    
    # Wait for command to complete
    time.sleep(wait_time)
    
    # Read output
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    
    if output:
        print(output)
    if error and 'warning' not in error.lower():
        print(f"ERROR: {error}", file=sys.stderr)
    
    return output, error

def main():
    print("🔍 Connecting to VPS server...")
    print(f"Host: {HOST}")
    print(f"User: {USER}")
    print("=" * 60)
    
    try:
        # Create SSH client
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Connect
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
        print("✅ Connected successfully!\n")
        
        # Step 1: Check PM2 processes
        print("\n📊 Step 1: Checking PM2 Processes")
        print("-" * 60)
        execute_command(ssh, "pm2 list")
        
        # Step 2: Check Nginx configuration
        print("\n📊 Step 2: Checking Nginx Configuration")
        print("-" * 60)
        execute_command(ssh, "ls -la /etc/nginx/sites-available/ | grep -E 'tps|myschool'")
        
        # Step 3: Check ports
        print("\n📊 Step 3: Checking Which Ports Are in Use")
        print("-" * 60)
        execute_command(ssh, "netstat -tulpn | grep -E ':(3000|3001|8080)' || ss -tulpn | grep -E ':(3000|3001|8080)'")
        
        # Step 4: Test endpoints
        print("\n📊 Step 4: Testing Localhost Endpoints")
        print("-" * 60)
        print("Testing port 3000:")
        execute_command(ssh, "curl -s http://localhost:3000/ | head -20")
        
        print("\nTesting port 3001:")
        execute_command(ssh, "curl -s http://localhost:3001/ | head -20")
        
        # Apply fix
        print("\n" + "=" * 60)
        print("🔧 Now applying fix...")
        print("=" * 60)
        
        # Stop all PM2 processes
        print("\n🛑 Stopping all PM2 processes...")
        execute_command(ssh, "pm2 stop all", wait_time=3)
        
        # Kill processes on ports
        print("\n🔪 Killing processes on ports 3000 and 3001...")
        execute_command(ssh, "fuser -k 3000/tcp 2>/dev/null || true")
        execute_command(ssh, "fuser -k 3001/tcp 2>/dev/null || true")
        time.sleep(2)
        
        # Check if directory exists
        print("\n📁 Checking /var/www/ayurveda directory...")
        output, _ = execute_command(ssh, "ls -la /var/www/ayurveda/server.js /var/www/ayurveda/dist/_worker.js 2>/dev/null || echo 'Files not found'")
        
        if "Files not found" in output or "No such file" in output:
            print("❌ Required files not found in /var/www/ayurveda/")
            print("Available directories:")
            execute_command(ssh, "ls -la /var/www/")
            return
        
        # Build the project
        print("\n🔨 Building project...")
        execute_command(ssh, "cd /var/www/ayurveda && npm run build", wait_time=30)
        
        # Start server using server.js
        print("\n🚀 Starting Ayurveda server on port 3001...")
        execute_command(ssh, "cd /var/www/ayurveda && pm2 start server.js --name ayurveda-clinic", wait_time=5)
        
        # Check status
        print("\n📊 PM2 Status:")
        execute_command(ssh, "pm2 list")
        
        # Test local server
        print("\n🧪 Testing local server on port 3001...")
        output, _ = execute_command(ssh, "curl -s http://localhost:3001/ | head -30")
        
        if "Dhanvantari" in output or "Ayurveda" in output or "TPS" in output:
            print("✅ CORRECT APP DETECTED on port 3001!")
        else:
            print("⚠️  Could not confirm correct app. Output above.")
        
        # Update Nginx configuration
        print("\n📝 Updating Nginx configuration to proxy to port 3001...")
        execute_command(ssh, "sed -i.backup 's|proxy_pass http://127.0.0.1:[0-9]*|proxy_pass http://127.0.0.1:3001|g' /etc/nginx/sites-available/tpsdhanvantariayurveda")
        
        print("\n🧪 Testing Nginx configuration...")
        output, error = execute_command(ssh, "nginx -t")
        
        if "syntax is ok" in output or "test is successful" in output:
            print("✅ Nginx config is valid!")
            print("\n🔄 Reloading Nginx...")
            execute_command(ssh, "systemctl reload nginx")
            print("✅ Nginx reloaded!")
        else:
            print("❌ Nginx config test failed!")
            print("Restoring backup...")
            execute_command(ssh, "cp /etc/nginx/sites-available/tpsdhanvantariayurveda.backup /etc/nginx/sites-available/tpsdhanvantariayurveda 2>/dev/null || true")
        
        # Final verification
        print("\n" + "=" * 60)
        print("✅ FIX APPLIED!")
        print("=" * 60)
        
        print("\n📊 Final Status:")
        execute_command(ssh, "pm2 status")
        
        print("\n🧪 Testing public endpoint...")
        time.sleep(3)  # Wait for nginx to propagate
        execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ | head -30")
        
        print("\n" + "=" * 60)
        print("🎯 NEXT STEPS:")
        print("=" * 60)
        print("1. Clear browser cache: Ctrl+Shift+R")
        print("2. Visit: https://tpsdhanvantariayurveda.in")
        print("3. Should see: TPS DHANVANTARI AYURVEDA (not MySchool)")
        print("4. Login with: Shankaranherbaltreatment@gmail.com / 123456")
        print()
        
        # Close connection
        ssh.close()
        print("✅ Script completed successfully!")
        
    except paramiko.AuthenticationException:
        print("❌ Authentication failed! Check password.")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"❌ SSH error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
