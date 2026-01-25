#!/bin/bash
echo "=== Deep Database Search - Last 7 Days ==="
echo ""

echo "1. Searching for ALL SQLite databases in /var/www/ayurveda..."
find /var/www/ayurveda -name "*.sqlite" -o -name "*.db" -type f | while read db; do
    if [ -f "$db" ]; then
        size=$(ls -lh "$db" | awk '{print $5}')
        modified=$(stat -c %y "$db" | cut -d'.' -f1)
        echo "  Found: $db (Size: $size, Modified: $modified)"
        
        # Try to check if it has our tables
        tables=$(sqlite3 "$db" ".tables" 2>/dev/null)
        if echo "$tables" | grep -q "medicines_tracking"; then
            echo "    ✅ Has medicines_tracking table"
            medicine_count=$(sqlite3 "$db" "SELECT COUNT(*) FROM medicines_tracking" 2>/dev/null)
            echo "    📊 Medicines count: $medicine_count"
            
            if [ "$medicine_count" -gt 0 ]; then
                echo "    🎉 FOUND MEDICINES! Details:"
                sqlite3 -header -column "$db" "SELECT id, herbs_route_id, roman_id, medicine_name FROM medicines_tracking LIMIT 5" 2>/dev/null
            fi
        fi
        
        if echo "$tables" | grep -q "payment_collections"; then
            echo "    ✅ Has payment_collections table"
            payment_count=$(sqlite3 "$db" "SELECT COUNT(*) FROM payment_collections" 2>/dev/null)
            echo "    💰 Payments count: $payment_count"
            
            if [ "$payment_count" -gt 0 ]; then
                echo "    💵 Payment details:"
                sqlite3 -header -column "$db" "SELECT * FROM payment_collections" 2>/dev/null
            fi
        fi
        echo ""
    fi
done

echo ""
echo "2. Checking Cloudflare D1 state directory..."
if [ -d "/var/www/ayurveda/.wrangler/state/v3/d1" ]; then
    echo "  D1 directory exists. Listing all SQLite files:"
    find /var/www/ayurveda/.wrangler/state/v3/d1 -name "*.sqlite" -type f | while read db; do
        echo "  📂 $db"
        modified=$(stat -c %y "$db" | cut -d'.' -f1)
        size=$(ls -lh "$db" | awk '{print $5}')
        echo "     Modified: $modified, Size: $size"
        
        # Check medicines
        med_count=$(sqlite3 "$db" "SELECT COUNT(*) FROM medicines_tracking" 2>/dev/null || echo "0")
        pay_count=$(sqlite3 "$db" "SELECT COUNT(*) FROM payment_collections" 2>/dev/null || echo "0")
        echo "     Medicines: $med_count, Payments: $pay_count"
        
        if [ "$med_count" -gt 0 ]; then
            echo "     🎉 MEDICINES FOUND!"
            sqlite3 -header -column "$db" "SELECT * FROM medicines_tracking" 2>/dev/null
        fi
        echo ""
    done
else
    echo "  ❌ D1 directory not found"
fi

echo ""
echo "3. Searching for database backups in backup directories..."
find /var/www/ayurveda/backups -name "*.json" -o -name "*.sqlite" -o -name "*.db" -mtime -7 2>/dev/null | head -20

echo ""
echo "4. Checking for WAL (Write-Ahead Log) files..."
find /var/www/ayurveda -name "*.sqlite-wal" -o -name "*.sqlite-shm" -type f 2>/dev/null

echo ""
echo "=== Search Complete ==="
