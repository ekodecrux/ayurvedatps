#!/usr/bin/env python3
"""
Automated Restore Script for Ayurveda Clinic Database
Restores data from daily backup to local/sandbox database
Version: 1.0
"""
import json
import sqlite3
import os
import sys
import tarfile
from datetime import datetime

# Configuration
BACKUP_BASE_DIR = "/var/www/ayurveda/backups/daily"
LOCAL_DB = "/var/www/ayurveda/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b4b0bedb1346bfc266b8ade7820659f11cc795f624fa2c0c1e30501e40949f2c.sqlite"

def list_available_backups():
    """List all available backups"""
    if not os.path.exists(BACKUP_BASE_DIR):
        print(f"❌ Backup directory not found: {BACKUP_BASE_DIR}")
        return []
    
    backups = []
    for item in os.listdir(BACKUP_BASE_DIR):
        if item.startswith("ayurveda_backup_"):
            backup_path = os.path.join(BACKUP_BASE_DIR, item)
            if os.path.isdir(backup_path):
                json_file = os.path.join(backup_path, "data.json")
                if os.path.exists(json_file):
                    backups.append({
                        'name': item,
                        'path': backup_path,
                        'json_file': json_file,
                        'date': item.replace('ayurveda_backup_', '')
                    })
    
    return sorted(backups, key=lambda x: x['date'], reverse=True)

def restore_from_backup(backup_json_file, target_db=None):
    """Restore database from backup JSON file"""
    
    if target_db is None:
        target_db = LOCAL_DB
    
    print("=" * 80)
    print("🔄 RESTORING FROM BACKUP")
    print("=" * 80)
    print(f"Backup File: {backup_json_file}")
    print(f"Target DB: {target_db}")
    print("=" * 80)
    
    # Load backup
    print("\n📂 Step 1: Loading backup file...")
    with open(backup_json_file, 'r') as f:
        backup = json.load(f)
    
    print(f"   ✅ Loaded backup from: {backup['backup_timestamp']}")
    print(f"   • Patients: {len(backup['patients'])}")
    print(f"   • Prescriptions: {len(backup['prescriptions'])}")
    print(f"   • Medicines: {sum(len(p.get('medicines', [])) for p in backup['prescriptions'])}")
    print(f"   • Payment Collections: {len(backup['payment_collections'])}")
    
    # Connect to database
    print("\n🔌 Step 2: Connecting to database...")
    conn = sqlite3.connect(target_db)
    cursor = conn.cursor()
    print(f"   ✅ Connected to: {target_db}")
    
    # Clear existing data
    print("\n🗑️  Step 3: Clearing existing data...")
    cursor.execute("DELETE FROM payment_collections;")
    cursor.execute("DELETE FROM medicines_tracking;")
    cursor.execute("DELETE FROM herbs_routes;")
    cursor.execute("DELETE FROM patients;")
    conn.commit()
    print("   ✅ Cleared old data")
    
    # Restore Patients
    print("\n👥 Step 4: Restoring PATIENTS...")
    patients_restored = 0
    for patient in backup['patients']:
        try:
            cursor.execute("""
                INSERT OR REPLACE INTO patients (
                    id, patient_id, name, age, gender, country, country_code, phone,
                    email, weight, height, address_hno, address_street, address_apartment,
                    address_area, address_district, address_state, address_pincode, address,
                    additional_phones, medical_history, diseases, present_health_issue,
                    present_medicine, mg_value, attacked_by, referred_by_name,
                    referred_by_phone, referred_by_address, referred_by_relation,
                    referred_by_additional_phones, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                patient.get('id'), patient.get('patient_id'), patient.get('name'),
                patient.get('age'), patient.get('gender'), patient.get('country'),
                patient.get('country_code'), patient.get('phone'), patient.get('email'),
                patient.get('weight'), patient.get('height'), patient.get('address_hno'),
                patient.get('address_street'), patient.get('address_apartment'),
                patient.get('address_area'), patient.get('address_district'),
                patient.get('address_state'), patient.get('address_pincode'),
                patient.get('address'), patient.get('additional_phones'),
                patient.get('medical_history'), patient.get('diseases'),
                patient.get('present_health_issue'), patient.get('present_medicine'),
                patient.get('mg_value'), patient.get('attacked_by'),
                patient.get('referred_by_name'), patient.get('referred_by_phone'),
                patient.get('referred_by_address'), patient.get('referred_by_relation'),
                patient.get('referred_by_additional_phones'), patient.get('created_at'),
                patient.get('updated_at')
            ))
            patients_restored += 1
        except Exception as e:
            print(f"   ⚠️  Failed: {patient.get('patient_id')}: {e}")
    
    conn.commit()
    print(f"   ✅ Restored {patients_restored} patients")
    
    # Restore Prescriptions
    print("\n📋 Step 5: Restoring PRESCRIPTIONS...")
    prescriptions_restored = 0
    for presc in backup['prescriptions']:
        try:
            cursor.execute("""
                INSERT OR REPLACE INTO herbs_routes (
                    id, patient_id, appointment_id, diagnosis, notes, next_followup_date,
                    created_at, updated_at, given_date, treatment_months, payment_amount,
                    advance_payment, payment_notes, due_balance, course, currency
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                presc.get('id'), presc.get('patient_db_id') or presc.get('patient_fk'),
                presc.get('appointment_id'), presc.get('diagnosis'), presc.get('notes'),
                presc.get('next_followup_date'), presc.get('created_at'),
                presc.get('updated_at'), presc.get('given_date'),
                presc.get('treatment_months'), presc.get('payment_amount'),
                presc.get('advance_payment'), presc.get('payment_notes'),
                presc.get('due_balance'), presc.get('course'), presc.get('currency')
            ))
            prescriptions_restored += 1
        except Exception as e:
            print(f"   ⚠️  Failed: Prescription {presc.get('id')}: {e}")
    
    conn.commit()
    print(f"   ✅ Restored {prescriptions_restored} prescriptions")
    
    # Restore Medicines
    print("\n💊 Step 6: Restoring MEDICINES...")
    medicines_restored = 0
    for presc in backup['prescriptions']:
        herbs_route_id = presc.get('id')
        medicines = presc.get('medicines', [])
        
        for med in medicines:
            try:
                cursor.execute("""
                    INSERT INTO medicines_tracking (
                        herbs_route_id, medicine_name, course, given_date, treatment_months,
                        morning_before, morning_after, afternoon_before, afternoon_after,
                        evening_before, evening_after, night_before, night_after,
                        morning_before_qty, morning_after_qty, afternoon_before_qty,
                        afternoon_after_qty, evening_before_qty, evening_after_qty,
                        night_before_qty, night_after_qty, is_active, payment_amount,
                        advance_payment, balance_due, payment_notes, medicine_note,
                        is_daily, is_alternate_day, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    herbs_route_id, med.get('medicine_name'), med.get('course'),
                    med.get('given_date'), med.get('treatment_months'),
                    med.get('morning_before', 0), med.get('morning_after', 0),
                    med.get('afternoon_before', 0), med.get('afternoon_after', 0),
                    med.get('evening_before', 0), med.get('evening_after', 0),
                    med.get('night_before', 0), med.get('night_after', 0),
                    med.get('morning_before_qty', 1), med.get('morning_after_qty', 1),
                    med.get('afternoon_before_qty', 1), med.get('afternoon_after_qty', 1),
                    med.get('evening_before_qty', 1), med.get('evening_after_qty', 1),
                    med.get('night_before_qty', 1), med.get('night_after_qty', 1),
                    med.get('is_active', 1), med.get('payment_amount', 0),
                    med.get('advance_payment', 0), med.get('balance_due', 0),
                    med.get('payment_notes'), med.get('medicine_note'),
                    med.get('is_daily', 1), med.get('is_alternate_day', 0),
                    med.get('created_at'), med.get('updated_at')
                ))
                medicines_restored += 1
            except Exception as e:
                print(f"   ⚠️  Medicine failed: {med.get('medicine_name')}: {e}")
    
    conn.commit()
    print(f"   ✅ Restored {medicines_restored} medicines")
    
    # Restore Payment Collections
    print("\n💰 Step 7: Restoring PAYMENT COLLECTIONS...")
    payments_restored = 0
    for payment in backup['payment_collections']:
        try:
            cursor.execute("""
                INSERT OR REPLACE INTO payment_collections (
                    id, herbs_route_id, course_id, collection_date, amount,
                    payment_method, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                payment.get('id'), payment.get('herbs_route_id'),
                payment.get('course_id'), payment.get('collection_date'),
                payment.get('amount'), payment.get('payment_method'),
                payment.get('notes'), payment.get('created_at')
            ))
            payments_restored += 1
        except Exception as e:
            print(f"   ⚠️  Payment failed: {e}")
    
    conn.commit()
    print(f"   ✅ Restored {payments_restored} payment collections")
    
    # Verify
    print("\n✅ Step 8: Verifying restoration...")
    cursor.execute("SELECT COUNT(*) FROM patients")
    patient_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM herbs_routes")
    prescription_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM medicines_tracking")
    medicines_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM payment_collections")
    payment_count = cursor.fetchone()[0]
    
    print(f"   • Patients: {patient_count}")
    print(f"   • Prescriptions: {prescription_count}")
    print(f"   • Medicines: {medicines_count}")
    print(f"   • Payment Collections: {payment_count}")
    
    conn.close()
    
    print("\n" + "=" * 80)
    print("✅ RESTORATION COMPLETE!")
    print("=" * 80)
    print(f"\n📊 Summary:")
    print(f"   ✅ Patients: {patients_restored}")
    print(f"   ✅ Prescriptions: {prescriptions_restored}")
    print(f"   ✅ Medicines: {medicines_restored}")
    print(f"   ✅ Payments: {payments_restored}")
    print("\n" + "=" * 80)
    
    return True

# Main execution
if __name__ == "__main__":
    print("=" * 80)
    print("AYURVEDA CLINIC - RESTORE FROM BACKUP")
    print("=" * 80)
    
    # List available backups
    backups = list_available_backups()
    
    if not backups:
        print("\n❌ No backups found!")
        print(f"Backup directory: {BACKUP_BASE_DIR}")
        exit(1)
    
    print(f"\n📁 Found {len(backups)} backup(s):\n")
    for i, backup in enumerate(backups, 1):
        print(f"  {i}. {backup['name']} (Date: {backup['date']})")
    
    # Get user choice or use latest
    if len(sys.argv) > 1:
        choice = int(sys.argv[1])
    else:
        print(f"\n🔄 Using latest backup: {backups[0]['name']}")
        choice = 1
    
    selected_backup = backups[choice - 1]
    print(f"\n✅ Selected: {selected_backup['name']}")
    
    # Restore
    success = restore_from_backup(selected_backup['json_file'])
    
    if success:
        print("\n✅ Restore completed successfully!")
        print("\n⚠️  Don't forget to restart the application:")
        print("   pm2 restart ayurveda-clinic")
        exit(0)
    else:
        print("\n❌ Restore failed!")
        exit(1)
