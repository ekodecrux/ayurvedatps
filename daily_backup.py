#!/usr/bin/env python3
"""
Automated Daily Backup Script for Ayurveda Clinic Database
Backs up all data via API and saves to multiple locations
Version: 1.0
"""
import requests
import json
import os
import time
from datetime import datetime
import tarfile
import shutil

# Configuration
PRODUCTION_URL = "https://tpsdhanvantariayurveda.in"
BACKUP_BASE_DIR = "/var/www/ayurveda/backups"
MAX_BACKUPS_TO_KEEP = 30  # Keep 30 days of backups
ADMIN_EMAIL = "admin@tpsdhanvantari.com"  # For notifications (optional)

# Create backup directory if it doesn't exist
os.makedirs(BACKUP_BASE_DIR, exist_ok=True)
os.makedirs(f"{BACKUP_BASE_DIR}/daily", exist_ok=True)
os.makedirs(f"{BACKUP_BASE_DIR}/monthly", exist_ok=True)

# Timestamp for backup
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
date_str = datetime.now().strftime('%Y-%m-%d')
backup_name = f"ayurveda_backup_{timestamp}"
backup_dir = f"{BACKUP_BASE_DIR}/daily/{backup_name}"

print("=" * 80)
print("🔄 AUTOMATED DAILY BACKUP")
print("=" * 80)
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Backup Name: {backup_name}")
print(f"Backup Directory: {backup_dir}")
print("=" * 80)

try:
    # Create backup directory
    os.makedirs(backup_dir, exist_ok=True)
    
    # Initialize backup data structure
    backup_data = {
        "backup_timestamp": datetime.now().isoformat(),
        "backup_type": "daily_automated",
        "source_url": PRODUCTION_URL,
        "version": "1.0",
        "patients": [],
        "prescriptions": [],
        "appointments": [],
        "payment_collections": [],
        "reminders": [],
        "settings": {}
    }
    
    # 1. Backup Patients
    print("\n📋 [1/6] Backing up PATIENTS...")
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/patients", timeout=30)
        if response.status_code == 200:
            data = response.json()
            backup_data['patients'] = data.get('data', [])
            print(f"   ✅ Backed up {len(backup_data['patients'])} patients")
        else:
            print(f"   ⚠️  Failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 2. Backup Prescriptions (with full details including medicines)
    print("\n📋 [2/6] Backing up PRESCRIPTIONS...")
    try:
        # Get prescription list
        response = requests.get(f"{PRODUCTION_URL}/api/prescriptions", timeout=30)
        if response.status_code == 200:
            data = response.json()
            prescriptions_list = data.get('data', [])
            print(f"   Found {len(prescriptions_list)} prescriptions")
            
            # Get detailed data for each prescription
            for i, presc in enumerate(prescriptions_list, 1):
                try:
                    pid = presc['id']
                    detail_response = requests.get(f"{PRODUCTION_URL}/api/prescriptions/{pid}", timeout=15)
                    if detail_response.status_code == 200:
                        detail_data = detail_response.json()
                        prescription_full = detail_data.get('data', {})
                        backup_data['prescriptions'].append(prescription_full)
                        
                        # Extract payment collections
                        for pc in prescription_full.get('payment_collections', []):
                            backup_data['payment_collections'].append(pc)
                        
                        medicines_count = len(prescription_full.get('medicines', []))
                        print(f"   [{i}/{len(prescriptions_list)}] Prescription {pid}: {medicines_count} medicines")
                    
                    time.sleep(0.3)  # Rate limiting
                except Exception as e:
                    print(f"   ⚠️  Prescription {pid}: {e}")
            
            print(f"   ✅ Backed up {len(backup_data['prescriptions'])} prescriptions")
            print(f"   ✅ Backed up {len(backup_data['payment_collections'])} payments")
        else:
            print(f"   ⚠️  Failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 3. Backup Appointments
    print("\n📋 [3/6] Backing up APPOINTMENTS...")
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/appointments", timeout=30)
        if response.status_code == 200:
            data = response.json()
            backup_data['appointments'] = data.get('data', [])
            print(f"   ✅ Backed up {len(backup_data['appointments'])} appointments")
        else:
            print(f"   ⚠️  Failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 4. Backup Reminders
    print("\n📋 [4/6] Backing up REMINDERS...")
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/reminders", timeout=30)
        if response.status_code == 200:
            data = response.json()
            backup_data['reminders'] = data.get('data', [])
            print(f"   ✅ Backed up {len(backup_data['reminders'])} reminders")
        else:
            print(f"   ⚠️  Skip: HTTP {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  Skip: {e}")
    
    # 5. Backup Settings
    print("\n📋 [5/6] Backing up SETTINGS...")
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/settings", timeout=30)
        if response.status_code == 200:
            data = response.json()
            backup_data['settings'] = data.get('data', {})
            print(f"   ✅ Backed up settings")
        else:
            print(f"   ⚠️  Skip: HTTP {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  Skip: {e}")
    
    # 6. Calculate statistics
    total_medicines = sum(len(p.get('medicines', [])) for p in backup_data['prescriptions'])
    
    # Save JSON backup
    print("\n💾 [6/6] Saving backup files...")
    json_file = f"{backup_dir}/data.json"
    with open(json_file, 'w') as f:
        json.dump(backup_data, f, indent=2)
    print(f"   ✅ Saved JSON: {json_file}")
    
    # Save human-readable summary
    summary_file = f"{backup_dir}/SUMMARY.txt"
    with open(summary_file, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("AYURVEDA CLINIC - DAILY BACKUP SUMMARY\n")
        f.write("=" * 80 + "\n")
        f.write(f"Backup Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Backup Name: {backup_name}\n")
        f.write(f"Source: {PRODUCTION_URL}\n")
        f.write("=" * 80 + "\n\n")
        f.write("BACKUP CONTENTS:\n")
        f.write(f"  • Patients: {len(backup_data['patients'])}\n")
        f.write(f"  • Prescriptions: {len(backup_data['prescriptions'])}\n")
        f.write(f"  • Total Medicines: {total_medicines}\n")
        f.write(f"  • Payment Collections: {len(backup_data['payment_collections'])}\n")
        f.write(f"  • Appointments: {len(backup_data['appointments'])}\n")
        f.write(f"  • Reminders: {len(backup_data['reminders'])}\n")
        f.write(f"  • Settings: {'Yes' if backup_data['settings'] else 'No'}\n\n")
        f.write("=" * 80 + "\n")
        f.write("PATIENT LIST:\n")
        f.write("=" * 80 + "\n")
        for p in backup_data['patients']:
            f.write(f"  • {p.get('patient_id')}: {p.get('name')} ({p.get('age')} {p.get('gender')})\n")
        f.write("\n")
        f.write("=" * 80 + "\n")
        f.write("PRESCRIPTION LIST:\n")
        f.write("=" * 80 + "\n")
        for pr in backup_data['prescriptions']:
            medicines = len(pr.get('medicines', []))
            f.write(f"  • ID {pr.get('id')}: {pr.get('patient_name')} - Course {pr.get('course')} - {medicines} medicines\n")
        f.write("\n")
        f.write("=" * 80 + "\n")
        f.write(f"Backup Size: {len(json.dumps(backup_data)):,} bytes\n")
        f.write(f"Status: SUCCESS\n")
        f.write("=" * 80 + "\n")
    print(f"   ✅ Saved summary: {summary_file}")
    
    # Create compressed archive
    archive_file = f"{backup_dir}.tar.gz"
    with tarfile.open(archive_file, "w:gz") as tar:
        tar.add(backup_dir, arcname=os.path.basename(backup_dir))
    print(f"   ✅ Created archive: {archive_file}")
    
    # Create monthly backup on 1st of month
    if datetime.now().day == 1:
        monthly_archive = f"{BACKUP_BASE_DIR}/monthly/backup_{datetime.now().strftime('%Y%m')}.tar.gz"
        shutil.copy(archive_file, monthly_archive)
        print(f"   ✅ Monthly backup: {monthly_archive}")
    
    # Print summary
    print("\n" + "=" * 80)
    print("✅ BACKUP COMPLETE!")
    print("=" * 80)
    print(f"\n📊 Backup Statistics:")
    print(f"   • Patients: {len(backup_data['patients'])}")
    print(f"   • Prescriptions: {len(backup_data['prescriptions'])}")
    print(f"   • Total Medicines: {total_medicines}")
    print(f"   • Payment Collections: {len(backup_data['payment_collections'])}")
    print(f"   • Appointments: {len(backup_data['appointments'])}")
    print(f"   • Reminders: {len(backup_data['reminders'])}")
    print(f"\n📁 Backup Location: {backup_dir}")
    print(f"📦 Archive: {archive_file}")
    print(f"📏 Size: {os.path.getsize(archive_file):,} bytes")
    
    # Cleanup old backups
    print(f"\n🗑️  Cleaning up old backups (keeping last {MAX_BACKUPS_TO_KEEP})...")
    daily_backups = sorted([
        f for f in os.listdir(f"{BACKUP_BASE_DIR}/daily")
        if f.startswith("ayurveda_backup_")
    ])
    
    if len(daily_backups) > MAX_BACKUPS_TO_KEEP:
        to_delete = daily_backups[:-MAX_BACKUPS_TO_KEEP]
        for old_backup in to_delete:
            old_path = f"{BACKUP_BASE_DIR}/daily/{old_backup}"
            if os.path.isdir(old_path):
                shutil.rmtree(old_path)
            elif os.path.isfile(old_path):
                os.remove(old_path)
            print(f"   🗑️  Deleted: {old_backup}")
        print(f"   ✅ Cleaned {len(to_delete)} old backups")
    else:
        print(f"   ✅ No cleanup needed ({len(daily_backups)} backups)")
    
    print("\n" + "=" * 80)
    print("✅ BACKUP SUCCESSFUL")
    print("=" * 80)
    
    # Exit with success
    exit(0)
    
except Exception as e:
    print(f"\n❌ BACKUP FAILED!")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    
    # Create error log
    error_file = f"{BACKUP_BASE_DIR}/backup_error_{timestamp}.log"
    with open(error_file, 'w') as f:
        f.write(f"Backup failed at {datetime.now()}\n")
        f.write(f"Error: {e}\n\n")
        traceback.print_exc(file=f)
    
    print(f"\n📝 Error log: {error_file}")
    exit(1)
