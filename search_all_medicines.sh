#!/bin/bash
echo "=== COMPREHENSIVE MEDICINE DATA SEARCH ==="
echo "Generated: $(date)"
echo ""

echo "1. LOCAL DATABASE - MEDICINES_TRACKING TABLE"
echo "============================================="
sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "
SELECT 
  mt.*,
  p.name as patient_name,
  p.patient_id as patient_identifier
FROM medicines_tracking mt
LEFT JOIN herbs_routes hr ON mt.herbs_route_id = hr.id
LEFT JOIN patients p ON hr.patient_id = p.id
ORDER BY mt.id DESC;
"

count=$(sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "SELECT COUNT(*) FROM medicines_tracking")
echo ""
echo "Total medicines found: $count"

echo ""
echo "2. CHECKING OLD MEDICINE TABLES"
echo "================================"

# Check if old tables exist and have data
echo "Checking 'medicines' table..."
old_count=$(sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "SELECT COUNT(*) FROM medicines" 2>/dev/null || echo "0")
echo "  Count: $old_count"
if [ "$old_count" -gt 0 ]; then
    sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "SELECT * FROM medicines LIMIT 10"
fi

echo ""
echo "Checking 'prescription_medicines' table..."
old_presc_count=$(sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "SELECT COUNT(*) FROM prescription_medicines" 2>/dev/null || echo "0")
echo "  Count: $old_presc_count"
if [ "$old_presc_count" -gt 0 ]; then
    sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "SELECT * FROM prescription_medicines LIMIT 10"
fi

echo ""
echo "3. CHECKING ALL PRESCRIPTIONS FOR MEDICINE FIELDS"
echo "=================================================="
sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "
SELECT 
  hr.id as prescription_id,
  p.name as patient_name,
  p.patient_id as identifier,
  hr.diagnosis,
  hr.notes,
  hr.created_at,
  hr.updated_at,
  COUNT(mt.id) as medicine_count
FROM herbs_routes hr
LEFT JOIN patients p ON hr.patient_id = p.id
LEFT JOIN medicines_tracking mt ON mt.herbs_route_id = hr.id
GROUP BY hr.id
ORDER BY hr.id DESC;
"

echo ""
echo "4. SEARCHING PRODUCTION API FOR MEDICINE DATA"
echo "=============================================="
for id in $(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions" 2>/dev/null | jq -r '.data[].id' 2>/dev/null); do
    echo ""
    echo "Prescription #$id:"
    med_data=$(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions/$id" 2>/dev/null | jq '.data.medicines' 2>/dev/null)
    med_count=$(echo "$med_data" | jq 'length' 2>/dev/null || echo "0")
    echo "  Medicines: $med_count"
    if [ "$med_count" -gt 0 ]; then
        echo "  FOUND MEDICINES:"
        echo "$med_data" | jq -r '.[] | "    - [\(.roman_id)] \(.medicine_name)"'
    fi
done

echo ""
echo "5. CHECKING BACKUP FILES FOR MEDICINE DATA"
echo "==========================================="

# Create temp directory for backups
mkdir -p /tmp/backup_search
cd /tmp/backup_search

# Get backup list
backups=$(curl -s "https://tpsdhanvantariayurveda.in/api/backups/list" | jq -r '.data[].name')

for backup in $backups; do
    echo ""
    echo "Analyzing: $backup"
    
    # Try to download and extract
    curl -s "https://tpsdhanvantariayurveda.in/api/backups/download?backup_name=$backup" -o ${backup}.tar.gz 2>/dev/null
    
    if [ -f "${backup}.tar.gz" ]; then
        # Extract
        mkdir -p ${backup}_extract
        tar -xzf ${backup}.tar.gz -C ${backup}_extract 2>/dev/null
        
        # Find data.json
        json_file=$(find ${backup}_extract -name "data.json" -type f 2>/dev/null | head -1)
        
        if [ -f "$json_file" ]; then
            # Count medicines in prescriptions
            total_meds=$(jq '[.prescriptions[].medicines // [] | length] | add // 0' "$json_file" 2>/dev/null || echo "0")
            echo "  Total medicines in backup: $total_meds"
            
            if [ "$total_meds" -gt 0 ]; then
                echo "  🎉 MEDICINES FOUND! Details:"
                jq -r '.prescriptions[] | select(.medicines | length > 0) | 
                    "    Prescription \(.id) (\(.patient_name)):\n" +
                    (.medicines[] | "      - [\(.roman_id)] \(.medicine_name) - \(.note // "No note")")' "$json_file" 2>/dev/null
            fi
        else
            echo "  No data.json found in backup"
        fi
        
        # Cleanup
        rm -rf ${backup}.tar.gz ${backup}_extract
    fi
done

# Cleanup
cd - > /dev/null
rm -rf /tmp/backup_search

echo ""
echo "6. CHECKING FOR DATABASE SNAPSHOTS ON VPS"
echo "=========================================="
echo "Note: Requires VPS access to check production database snapshots"

echo ""
echo "=== SEARCH COMPLETE ==="
echo ""
echo "SUMMARY:"
echo "--------"
echo "Local database medicines: $count"
echo "Old 'medicines' table: $old_count"
echo "Old 'prescription_medicines' table: $old_presc_count"
