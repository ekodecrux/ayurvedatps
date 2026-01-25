#!/bin/bash
echo "=== Checking VPS Database Instances ==="
echo ""

# Check .wrangler D1 databases
echo "1. Checking .wrangler D1 databases..."
find /var/www/ayurveda/.wrangler/state/v3/d1 -name "*.sqlite" -type f -mtime -7 -exec ls -lh {} \; 2>/dev/null || echo "No D1 databases found"

echo ""
echo "2. Listing all SQLite files modified in last 7 days..."
find /var/www/ayurveda -name "*.sqlite*" -type f -mtime -7 -exec ls -lh {} \; 2>/dev/null

echo ""
echo "3. Checking medicines_tracking table..."
for db in $(find /var/www/ayurveda/.wrangler/state/v3/d1 -name "*.sqlite" -type f 2>/dev/null); do
    echo "Database: $db"
    sqlite3 "$db" "SELECT COUNT(*) as medicines_count FROM medicines_tracking;" 2>/dev/null || echo "Table not found"
done

echo ""
echo "4. Checking payment_collections table..."
for db in $(find /var/www/ayurveda/.wrangler/state/v3/d1 -name "*.sqlite" -type f 2>/dev/null); do
    echo "Database: $db"
    sqlite3 "$db" "SELECT * FROM payment_collections LIMIT 5;" 2>/dev/null || echo "Table not found"
done

echo ""
echo "5. Checking for database backups..."
find /var/www/ayurveda -name "*.db" -o -name "*.sqlite-backup" -o -name "*.sql" -type f -mtime -7 2>/dev/null | head -20
