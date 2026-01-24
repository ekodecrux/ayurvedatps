#!/usr/bin/env python3
"""
CRITICAL: Export ALL data from production through API
This will save all prescriptions, patients, medicines, and related data
"""
import requests
import json
import sqlite3
import time
from datetime import datetime

PRODUCTION_URL = "https://tpsdhanvantariayurveda.in"
BACKUP_DB = f"/home/user/webapp/FULL_PRODUCTION_BACKUP_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
BACKUP_JSON = f"/home/user/webapp/production_data_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

print("=" * 80)
print("🚨 CRITICAL: FULL PRODUCTION DATA BACKUP")
print("=" * 80)

backup_data = {
    "backup_time": datetime.now().isoformat(),
    "source": PRODUCTION_URL,
    "patients": [],
    "prescriptions": [],
    "appointments": [],
    "payment_collections": []
}

try:
    # 1. Get all patients
    print("\n📋 Step 1: Backing up PATIENTS...")
    response = requests.get(f"{PRODUCTION_URL}/api/patients", timeout=15)
    if response.status_code == 200:
        data = response.json()
        backup_data['patients'] = data.get('data', [])
        print(f"   ✅ Saved {len(backup_data['patients'])} patients")
    else:
        print(f"   ⚠️  Failed: {response.status_code}")
    
    # 2. Get all prescriptions (with basic info)
    print("\n📋 Step 2: Backing up PRESCRIPTIONS (summary)...")
    response = requests.get(f"{PRODUCTION_URL}/api/prescriptions", timeout=15)
    if response.status_code == 200:
        data = response.json()
        prescriptions_summary = data.get('data', [])
        print(f"   ✅ Found {len(prescriptions_summary)} prescriptions")
        
        # 3. Get DETAILED data for each prescription (includes medicines!)
        print("\n📋 Step 3: Backing up FULL PRESCRIPTION DETAILS (with medicines)...")
        for i, presc in enumerate(prescriptions_summary, 1):
            pid = presc['id']
            print(f"   [{i}/{len(prescriptions_summary)}] Fetching prescription ID {pid}...")
            
            try:
                detail_response = requests.get(f"{PRODUCTION_URL}/api/prescriptions/{pid}", timeout=10)
                if detail_response.status_code == 200:
                    detail_data = detail_response.json()
                    prescription_full = detail_data.get('data', {})
                    backup_data['prescriptions'].append(prescription_full)
                    
                    medicines_count = len(prescription_full.get('medicines', []))
                    collections_count = len(prescription_full.get('payment_collections', []))
                    print(f"       ✅ {medicines_count} medicines, {collections_count} payments")
                    
                    # Extract payment collections
                    for pc in prescription_full.get('payment_collections', []):
                        backup_data['payment_collections'].append(pc)
                else:
                    print(f"       ⚠️  Failed: {detail_response.status_code}")
                
                time.sleep(0.5)  # Rate limiting
            except Exception as e:
                print(f"       ❌ Error: {e}")
        
        print(f"\n   ✅ Saved {len(backup_data['prescriptions'])} full prescriptions")
        print(f"   ✅ Saved {len(backup_data['payment_collections'])} payment collections")
    
    # 4. Get appointments
    print("\n📋 Step 4: Backing up APPOINTMENTS...")
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/appointments", timeout=15)
        if response.status_code == 200:
            data = response.json()
            backup_data['appointments'] = data.get('data', [])
            print(f"   ✅ Saved {len(backup_data['appointments'])} appointments")
    except Exception as e:
        print(f"   ⚠️  Failed: {e}")
    
    # 5. Save to JSON file
    print("\n💾 Step 5: Saving to JSON file...")
    with open(BACKUP_JSON, 'w') as f:
        json.dump(backup_data, f, indent=2)
    print(f"   ✅ Saved to: {BACKUP_JSON}")
    
    # 6. Count total medicines
    total_medicines = sum(len(p.get('medicines', [])) for p in backup_data['prescriptions'])
    
    print("\n" + "=" * 80)
    print("✅ BACKUP COMPLETE!")
    print("=" * 80)
    print(f"\n📊 Summary:")
    print(f"   • Patients: {len(backup_data['patients'])}")
    print(f"   • Prescriptions: {len(backup_data['prescriptions'])}")
    print(f"   • Total Medicines: {total_medicines}")
    print(f"   • Payment Collections: {len(backup_data['payment_collections'])}")
    print(f"   • Appointments: {len(backup_data['appointments'])}")
    print(f"\n📁 Backup file: {BACKUP_JSON}")
    print(f"   Size: {len(json.dumps(backup_data)):,} bytes")
    
    # Show prescription details
    print(f"\n📋 Prescription Details:")
    for p in backup_data['prescriptions']:
        medicines = p.get('medicines', [])
        print(f"   • ID {p['id']}: {p.get('patient_name')} - {len(medicines)} medicines")
        if len(medicines) == 0:
            print(f"      ⚠️  WARNING: This prescription has NO MEDICINES!")
    
    print("\n" + "=" * 80)
    
except Exception as e:
    print(f"\n❌ CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    # Save partial backup
    if backup_data['patients'] or backup_data['prescriptions']:
        print(f"\n💾 Saving partial backup...")
        with open(BACKUP_JSON, 'w') as f:
            json.dump(backup_data, f, indent=2)
        print(f"   ✅ Partial backup saved to: {BACKUP_JSON}")
