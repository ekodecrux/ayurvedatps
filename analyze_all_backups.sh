#!/bin/bash
echo "=== Analyzing All Backup Files for Medicine & Payment Data ==="
echo ""

# Function to analyze a backup file
analyze_backup() {
    local backup_name=$1
    local backup_url="https://tpsdhanvantariayurveda.in/api/backups/download?backup_name=$backup_name"
    
    echo "Analyzing: $backup_name"
    echo "Downloading..."
    
    # Download backup
    curl -s "$backup_url" -o /tmp/${backup_name}.tar.gz
    
    # Extract
    mkdir -p /tmp/${backup_name}_extracted
    tar -xzf /tmp/${backup_name}.tar.gz -C /tmp/${backup_name}_extracted 2>/dev/null
    
    # Find data.json
    local json_file=$(find /tmp/${backup_name}_extracted -name "data.json" -type f)
    
    if [ -f "$json_file" ]; then
        echo "Found data.json"
        
        # Count medicines in prescriptions
        local medicine_count=$(jq '[.prescriptions[].medicines // [] | length] | add // 0' "$json_file")
        echo "  Total medicines across all prescriptions: $medicine_count"
        
        # Count payment collections
        local payment_count=$(jq '.payment_collections | length // 0' "$json_file")
        echo "  Payment collections: $payment_count"
        
        # Show prescriptions with medicines
        echo "  Prescriptions with medicines:"
        jq -r '.prescriptions[] | select(.medicines | length > 0) | "    Prescription \(.id) (\(.patient_name)): \(.medicines | length) medicines"' "$json_file"
        
        # Show payment details
        if [ "$payment_count" -gt 0 ]; then
            echo "  Payment details:"
            jq -r '.payment_collections[] | "    \(.collection_date): ₹\(.amount) (\(.payment_method // "N/A"))"' "$json_file"
        fi
    else
        echo "  ERROR: data.json not found"
    fi
    
    # Cleanup
    rm -rf /tmp/${backup_name}.tar.gz /tmp/${backup_name}_extracted
    echo ""
}

# Get list of all backups
echo "Fetching backup list..."
backups=$(curl -s "https://tpsdhanvantariayurveda.in/api/backups/list" | jq -r '.data[].name')

echo "Found $(echo "$backups" | wc -l) backups"
echo ""

# Analyze each backup
for backup in $backups; do
    analyze_backup "$backup"
done

echo "=== Analysis Complete ==="
