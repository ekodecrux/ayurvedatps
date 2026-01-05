#!/usr/bin/expect -f

# Automated VPS Deployment with Expect
# Handles SSH password authentication

set timeout 60
set password "Yourkpo@202526"
set host "88.222.244.84"
set user "root"

puts "\n🚀 Starting Automated VPS Deployment..."
puts "========================================\n"

# Step 1: Check local build
puts "📦 Checking local build directory..."
if {[file exists "dist/static/app.js"]} {
    puts "✅ Build files found\n"
} else {
    puts "❌ Build files not found. Please run 'npm run build' first\n"
    exit 1
}

# Step 2: Connect and create backup
puts "📋 Step 1: Creating backup on VPS..."
spawn ssh $user@$host
expect {
    "password:" {
        send "$password\r"
        expect "#"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$password\r"
        expect "#"
    }
}

send "cd /var/www/ayurveda && mkdir -p backups\r"
expect "#"
send "cp dist/static/app.js backups/app.js.backup-\$(date +%Y%m%d_%H%M%S)\r"
expect "#"
send "echo 'Backup created'\r"
expect "#"
send "exit\r"
expect eof

puts "✅ Backup created\n"

# Step 3: SCP the updated file
puts "📤 Step 2: Deploying app.js..."
spawn scp dist/static/app.js $user@$host:/var/www/ayurveda/dist/static/
expect {
    "password:" {
        send "$password\r"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "$password\r"
    }
}
expect eof
puts "✅ app.js deployed\n"

# Step 4: SCP documentation
puts "📝 Step 3: Deploying documentation..."
spawn scp PAYMENT_MODULE_FIXES_v2.5.0.md $user@$host:/var/www/ayurveda/
expect {
    "password:" {
        send "$password\r"
    }
}
expect eof
puts "✅ Documentation deployed\n"

# Step 5: Restart PM2
puts "🔄 Step 4: Restarting application..."
spawn ssh $user@$host
expect "password:"
send "$password\r"
expect "#"
send "cd /var/www/ayurveda\r"
expect "#"
send "pm2 restart ayurveda-clinic\r"
expect "#"
sleep 2
send "pm2 status\r"
expect "#"
send "exit\r"
expect eof

puts "\n✅ Deployment Complete!"
puts "========================================\n"
puts "🌐 Application URL: http://88.222.244.84:3001"
puts "🌐 Domain URL: https://tpsdhanvantariayurveda.in/\n"
puts "📝 Changes Deployed:"
puts "  ✅ Enhanced balance calculation"
puts "  ✅ Overpayment detection"
puts "  ✅ Payment amount validation"
puts "  ✅ Improved payment status display"
puts "  ✅ Required field validation\n"

