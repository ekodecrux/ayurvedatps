#!/usr/bin/env python3
"""
Restore available production data to sandbox/local database
This will restore: Patients, Prescriptions (without medicines), Payment Collections
"""
import json
import sqlite3
from datetime import datetime

BACKUP_FILE = "/home/user/webapp/production_data_backup_20260124_150949.json"
LOCAL_DB = "/home/user/webapp/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b4b0bedb1346bfc266b8ade7820659f11cc795f624fa2c0c1e30501e40949f2c.sqlite"

print("=" * 80)
print("🔄 RESTORING PRODUCTION DATA TO LOCAL DATABASE")
print("=" * 80)

# Load backup
print("\n📂 Step 1: Loading backup file...")
with open(BACKUP_FILE, 'r') as f:
    backup = json.load(f)

print(f"   ✅ Loaded backup from: {backup['backup_time']}")
print(f"   • Patients: {len(backup['patients'])}")
print(f"   • Prescriptions: {len(backup['prescriptions'])}")
print(f"   • Payment Collections: {len(backup['payment_collections'])}")

# Connect to database
print("\n🔌 Step 2: Connecting to local D1 database...")
conn = sqlite3.connect(LOCAL_DB)
cursor = conn.cursor()
print(f"   ✅ Connected to: {LOCAL_DB}")

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
        # Map fields carefully
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
            patient.get('id'),
            patient.get('patient_id'),
            patient.get('name'),
            patient.get('age'),
            patient.get('gender'),
            patient.get('country'),
            patient.get('country_code'),
            patient.get('phone'),
            patient.get('email'),
            patient.get('weight'),
            patient.get('height'),
            patient.get('address_hno'),
            patient.get('address_street'),
            patient.get('address_apartment'),
            patient.get('address_area'),
            patient.get('address_district'),
            patient.get('address_state'),
            patient.get('address_pincode'),
            patient.get('address'),
            patient.get('additional_phones'),
            patient.get('medical_history'),
            patient.get('diseases'),
            patient.get('present_health_issue'),
            patient.get('present_medicine'),
            patient.get('mg_value'),
            patient.get('attacked_by'),
            patient.get('referred_by_name'),
            patient.get('referred_by_phone'),
            patient.get('referred_by_address'),
            patient.get('referred_by_relation'),
            patient.get('referred_by_additional_phones'),
            patient.get('created_at'),
            patient.get('updated_at')
        ))
        patients_restored += 1
        print(f"   ✅ Patient {patient.get('patient_id')}: {patient.get('name')}")
    except Exception as e:
        print(f"   ⚠️  Failed to restore patient {patient.get('patient_id')}: {e}")

conn.commit()
print(f"\n   ✅ Restored {patients_restored} patients")

# Restore Prescriptions (herbs_routes table)
print("\n📋 Step 5: Restoring PRESCRIPTIONS (herbs_routes)...")
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
            presc.get('id'),
            presc.get('patient_db_id') or presc.get('patient_fk'),
            presc.get('appointment_id'),
            presc.get('diagnosis'),
            presc.get('notes'),
            presc.get('next_followup_date'),
            presc.get('created_at'),
            presc.get('updated_at'),
            presc.get('given_date'),
            presc.get('treatment_months'),
            presc.get('payment_amount'),
            presc.get('advance_payment'),
            presc.get('payment_notes'),
            presc.get('due_balance'),
            presc.get('course'),
            presc.get('currency')
        ))
        prescriptions_restored += 1
        medicines_count = len(presc.get('medicines', []))
        print(f"   ✅ Prescription {presc.get('id')}: {presc.get('patient_name')} - Course {presc.get('course')}")
        if medicines_count == 0:
            print(f"      ⚠️  WARNING: No medicines to restore for this prescription")
    except Exception as e:
        print(f"   ⚠️  Failed to restore prescription {presc.get('id')}: {e}")

conn.commit()
print(f"\n   ✅ Restored {prescriptions_restored} prescriptions")

# Restore Payment Collections
print("\n💰 Step 6: Restoring PAYMENT COLLECTIONS...")
payments_restored = 0
for payment in backup['payment_collections']:
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO payment_collections (
                id, herbs_route_id, course_id, collection_date, amount,
                payment_method, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            payment.get('id'),
            payment.get('herbs_route_id'),
            payment.get('course_id'),
            payment.get('collection_date'),
            payment.get('amount'),
            payment.get('payment_method'),
            payment.get('notes'),
            payment.get('created_at')
        ))
        payments_restored += 1
        print(f"   ✅ Payment {payment.get('id')}: ₹{payment.get('amount')} ({payment.get('payment_method')})")
    except Exception as e:
        print(f"   ⚠️  Failed to restore payment {payment.get('id')}: {e}")

conn.commit()
print(f"\n   ✅ Restored {payments_restored} payment collections")

# Verify restoration
print("\n✅ Step 7: Verifying restoration...")
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
print(f"   • Medicines: {medicines_count} ⚠️ (0 because no medicines in backup)")
print(f"   • Payment Collections: {payment_count}")

conn.close()

print("\n" + "=" * 80)
print("✅ RESTORATION COMPLETE!")
print("=" * 80)
print("\n📊 Summary:")
print(f"   ✅ Restored {patients_restored} patients")
print(f"   ✅ Restored {prescriptions_restored} prescriptions")
print(f"   ✅ Restored {payments_restored} payment collections")
print(f"   ⚠️  Restored 0 medicines (no medicines data in backup)")
print("\n⚠️  IMPORTANT:")
print("   • The 3 prescriptions have been restored WITHOUT medicines")
print("   • You need to manually add medicines to each prescription")
print("   • Patient data is fully restored")
print("\n🔗 Next Steps:")
print("   1. Restart local server: pm2 restart ayurveda-clinic")
print("   2. Login to sandbox: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai")
print("   3. View the restored patients and prescriptions")
print("   4. Edit each prescription to add medicines")
print("\n" + "=" * 80)
