#!/usr/bin/env python3
"""
Diagnose and Fix Port Conflict - TPS Dhanvantari Ayurveda
This script checks what's actually on the server and applies the correct fix
"""

import paramiko
import time
import sys

# SSH connection details
HOST = "88.222.244.84"
USER = "root"
PASSWORD = "Yourkpo@202526"

def execute_command(ssh, command, wait_time=2, show_output=True):
    """Execute a command and print output"""
    if show_output:
        print(f"\n$ {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    
    # Wait for command to complete
    time.sleep(wait_time)
    
    # Read output
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    
    if output and show_output:
        print(output)
    if error and 'warning' not in error.lower() and show_output:
        print(f"ERROR: {error}", file=sys.stderr)
    
    return output, error

def main():
    print("🔍 Diagnosing TPS Dhanvantari Ayurveda Deployment...")
    print("=" * 70)
    
    try:
        # Create SSH client
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Connect
        print(f"\n📡 Connecting to {HOST}...")
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
        print("✅ Connected successfully!\n")
        
        # Step 1: Check what exists in /var/www/ayurveda
        print("=" * 70)
        print("📁 STEP 1: Checking /var/www/ayurveda directory")
        print("=" * 70)
        
        output, error = execute_command(ssh, "ls -la /var/www/ayurveda/ 2>/dev/null || echo 'Directory not found'")
        
        if "Directory not found" in output or "No such file" in output:
            print("\n❌ ERROR: /var/www/ayurveda directory doesn't exist!")
            print("\nChecking /var/www/ contents:")
            execute_command(ssh, "ls -la /var/www/")
            
            print("\n⚠️  You need to deploy the application first!")
            print("Run these commands on your server:")
            print("  cd /var/www")
            print("  git clone https://github.com/ekodecrux/ayurvedatps.git ayurveda")
            print("  cd ayurveda")
            print("  npm install")
            print("  npm run build")
            ssh.close()
            return
        
        # Step 2: Check for key files
        print("\n" + "=" * 70)
        print("📋 STEP 2: Checking for key files")
        print("=" * 70)
        
        files_to_check = [
            "server.js",
            "package.json",
            "dist/_worker.js",
            "ecosystem.config.cjs",
            "wrangler.jsonc"
        ]
        
        existing_files = {}
        for file in files_to_check:
            output, _ = execute_command(ssh, f"ls -la /var/www/ayurveda/{file} 2>/dev/null || echo 'NOT FOUND'", wait_time=1, show_output=False)
            exists = "NOT FOUND" not in output
            existing_files[file] = exists
            status = "✅" if exists else "❌"
            print(f"{status} {file}")
        
        # Step 3: Check current PM2 processes
        print("\n" + "=" * 70)
        print("📊 STEP 3: Current PM2 Processes")
        print("=" * 70)
        execute_command(ssh, "pm2 list")
        
        # Step 4: Check ports
        print("\n" + "=" * 70)
        print("🔌 STEP 4: Ports in Use")
        print("=" * 70)
        execute_command(ssh, "netstat -tulpn 2>/dev/null | grep -E ':(3000|3001|8080)' || ss -tulpn | grep -E ':(3000|3001|8080)'")
        
        # Step 5: Determine the correct startup method
        print("\n" + "=" * 70)
        print("🔧 STEP 5: Determining Correct Startup Method")
        print("=" * 70)
        
        if existing_files["server.js"]:
            startup_method = "server.js"
            print("✅ Found server.js - will use Node.js direct mode")
        elif existing_files["dist/_worker.js"]:
            startup_method = "wrangler"
            print("✅ Found dist/_worker.js - will use Wrangler Pages Dev mode")
        else:
            print("❌ Neither server.js nor dist/_worker.js found!")
            print("⚠️  Need to build the project first")
            startup_method = None
        
        if startup_method is None:
            print("\n🔨 Building the project...")
            execute_command(ssh, "cd /var/www/ayurveda && npm run build", wait_time=30)
            startup_method = "wrangler"
        
        # Step 6: Apply the fix
        print("\n" + "=" * 70)
        print("🚀 STEP 6: Applying Fix")
        print("=" * 70)
        
        # Stop all PM2 processes
        print("\n🛑 Stopping all PM2 processes...")
        execute_command(ssh, "pm2 stop all", wait_time=3)
        
        # Kill processes on ports
        print("\n🔪 Killing processes on ports 3000 and 3001...")
        execute_command(ssh, "fuser -k 3000/tcp 2>/dev/null || true")
        execute_command(ssh, "fuser -k 3001/tcp 2>/dev/null || true")
        time.sleep(2)
        
        # Delete old PM2 processes
        print("\n🗑️  Removing old PM2 processes...")
        execute_command(ssh, "pm2 delete all 2>/dev/null || true", wait_time=2)
        
        # Start with the correct method
        print(f"\n🚀 Starting Ayurveda clinic using: {startup_method}")
        
        if startup_method == "server.js":
            # Use server.js directly
            cmd = "cd /var/www/ayurveda && PORT=3001 pm2 start server.js --name ayurveda-clinic --update-env"
        else:
            # Use wrangler pages dev
            cmd = "cd /var/www/ayurveda && pm2 start 'npx wrangler pages dev dist --ip 0.0.0.0 --port 3001' --name ayurveda-clinic"
        
        execute_command(ssh, cmd, wait_time=5)
        
        # Check PM2 status
        print("\n📊 PM2 Status:")
        execute_command(ssh, "pm2 list")
        
        # Wait for server to start
        print("\n⏳ Waiting for server to start...")
        time.sleep(5)
        
        # Test local server
        print("\n🧪 Testing local server on port 3001...")
        output, _ = execute_command(ssh, "curl -s http://localhost:3001/ 2>/dev/null | head -30")
        
        if "Dhanvantari" in output or "Ayurveda" in output or "TPS" in output:
            print("\n✅ CORRECT APP DETECTED on port 3001!")
        elif "MySchool" in output:
            print("\n⚠️  WARNING: Still showing MySchool app!")
        else:
            print("\n⚠️  Could not determine which app is running")
            print("Response preview:")
            print(output[:500])
        
        # Update Nginx configuration
        print("\n" + "=" * 70)
        print("📝 STEP 7: Updating Nginx Configuration")
        print("=" * 70)
        
        # Check if Nginx config exists
        output, _ = execute_command(ssh, "ls -la /etc/nginx/sites-available/tpsdhanvantariayurveda 2>/dev/null || echo 'NOT FOUND'", show_output=False)
        
        if "NOT FOUND" in output:
            print("⚠️  Nginx config not found at expected location")
            print("Searching for nginx configs...")
            execute_command(ssh, "ls -la /etc/nginx/sites-available/ | grep -E 'tps|ayurveda'")
        else:
            print("✅ Found Nginx config")
            
            # Backup and update
            execute_command(ssh, "cp /etc/nginx/sites-available/tpsdhanvantariayurveda /etc/nginx/sites-available/tpsdhanvantariayurveda.backup")
            execute_command(ssh, "sed -i 's|proxy_pass http://127.0.0.1:[0-9]*;|proxy_pass http://127.0.0.1:3001;|g' /etc/nginx/sites-available/tpsdhanvantariayurveda")
            
            print("\n🧪 Testing Nginx configuration...")
            output, error = execute_command(ssh, "nginx -t")
            
            if "syntax is ok" in output or "test is successful" in output:
                print("✅ Nginx config is valid!")
                print("\n🔄 Reloading Nginx...")
                execute_command(ssh, "systemctl reload nginx")
                print("✅ Nginx reloaded!")
            else:
                print("❌ Nginx config test failed!")
                execute_command(ssh, "cp /etc/nginx/sites-available/tpsdhanvantariayurveda.backup /etc/nginx/sites-available/tpsdhanvantariayurveda 2>/dev/null || true")
        
        # Final verification
        print("\n" + "=" * 70)
        print("✅ FIX APPLIED!")
        print("=" * 70)
        
        print("\n📊 Final PM2 Status:")
        execute_command(ssh, "pm2 status")
        
        print("\n🧪 Testing public endpoint...")
        time.sleep(3)
        output, _ = execute_command(ssh, "curl -s https://tpsdhanvantariayurveda.in/ 2>/dev/null | head -30")
        
        if "Dhanvantari" in output or "Ayurveda" in output:
            print("\n✅ PUBLIC SITE IS CORRECT!")
        elif "MySchool" in output:
            print("\n⚠️  WARNING: Public site still shows MySchool!")
        else:
            print("\n⚠️  Could not verify public site")
        
        print("\n" + "=" * 70)
        print("🎯 NEXT STEPS:")
        print("=" * 70)
        print("1. Clear browser cache: Ctrl+Shift+R (or Cmd+Shift+R on Mac)")
        print("2. Visit: https://tpsdhanvantariayurveda.in")
        print("3. Should see: TPS DHANVANTARI AYURVEDA")
        print("4. Login: Shankaranherbaltreatment@gmail.com / 123456")
        print()
        
        # Save PM2 configuration
        print("💾 Saving PM2 configuration for auto-restart...")
        execute_command(ssh, "pm2 save")
        
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
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
