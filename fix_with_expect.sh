#!/usr/bin/expect -f

set timeout 120

# SSH connection details
set host "88.222.244.84"
set user "root"
set password "Yourkpo@202425"

spawn ssh -o StrictHostKeyChecking=no $user@$host

expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "# " {
        # Connected successfully
        send "echo '🔍 Starting Port Conflict Diagnosis...'\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '📊 Step 1: Checking PM2 Processes'\r"
        send "pm2 list\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '📊 Step 2: Checking Nginx Configuration'\r"
        send "ls -la /etc/nginx/sites-available/ | grep -E 'tps|myschool'\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '📊 Step 3: Checking Which Ports Are in Use'\r"
        send "netstat -tulpn | grep -E ':(3000|3001|8080|8081)' || ss -tulpn | grep -E ':(3000|3001|8080|8081)'\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '📊 Step 4: Testing Localhost Endpoints'\r"
        send "echo 'Testing port 3000:'\r"
        send "curl -s http://localhost:3000/ | head -20\r"
        expect "# "
        
        send "echo ''\r"
        send "echo 'Testing port 3001:'\r"
        send "curl -s http://localhost:3001/ | head -20\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '================================'\r"
        send "echo '🔧 Now applying fix...'\r"
        send "echo '================================'\r"
        send "echo ''\r"
        
        # Stop all PM2 processes
        send "echo '🛑 Stopping all PM2 processes...'\r"
        send "pm2 stop all\r"
        expect "# "
        
        send "sleep 2\r"
        expect "# "
        
        # Kill processes on ports
        send "echo '🔪 Killing processes on ports 3000 and 3001...'\r"
        send "fuser -k 3000/tcp 2>/dev/null || true\r"
        expect "# "
        send "fuser -k 3001/tcp 2>/dev/null || true\r"
        expect "# "
        
        send "sleep 2\r"
        expect "# "
        
        # Navigate to project directory
        send "cd /var/www/ayurveda\r"
        expect "# "
        
        send "echo '📦 Current directory:'\r"
        send "pwd\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '📁 Checking files:'\r"
        send "ls -la server.js dist/_worker.js 2>/dev/null\r"
        expect "# "
        
        # Build the project
        send "echo ''\r"
        send "echo '🔨 Building project...'\r"
        send "npm run build\r"
        expect {
            "# " { }
            timeout {
                send "\003"
                expect "# "
            }
        }
        
        # Start using server.js
        send "echo ''\r"
        send "echo '🚀 Starting Ayurveda server on port 3001...'\r"
        send "pm2 start server.js --name ayurveda-clinic\r"
        expect "# "
        
        send "sleep 3\r"
        expect "# "
        
        # Check status
        send "pm2 list\r"
        expect "# "
        
        # Test local server
        send "echo ''\r"
        send "echo '🧪 Testing local server on port 3001...'\r"
        send "curl -s http://localhost:3001/ | head -30\r"
        expect "# "
        
        # Check and fix Nginx configuration
        send "echo ''\r"
        send "echo '📝 Checking Nginx configuration...'\r"
        send "cat /etc/nginx/sites-available/tpsdhanvantariayurveda 2>/dev/null | grep proxy_pass\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '✏️ Updating Nginx to proxy to port 3001...'\r"
        send "sed -i.backup 's|proxy_pass http://127.0.0.1:[0-9]*|proxy_pass http://127.0.0.1:3001|g' /etc/nginx/sites-available/tpsdhanvantariayurveda\r"
        expect "# "
        
        send "echo 'Testing nginx config...'\r"
        send "nginx -t\r"
        expect "# "
        
        send "echo 'Reloading nginx...'\r"
        send "systemctl reload nginx\r"
        expect "# "
        
        # Final verification
        send "echo ''\r"
        send "echo '================================'\r"
        send "echo '✅ FIX APPLIED!'\r"
        send "echo '================================'\r"
        send "echo ''\r"
        
        send "echo '📊 Final Status:'\r"
        send "pm2 status\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '🧪 Testing public endpoint...'\r"
        send "curl -s https://tpsdhanvantariayurveda.in/ | head -30\r"
        expect "# "
        
        send "echo ''\r"
        send "echo '✅ Fix complete! Visit: https://tpsdhanvantariayurveda.in'\r"
        send "echo 'Clear browser cache with Ctrl+Shift+R'\r"
        send "echo ''\r"
        
        send "exit\r"
    }
    timeout {
        puts "Connection timeout"
        exit 1
    }
    eof {
        puts "Connection closed unexpectedly"
        exit 1
    }
}

expect eof
