#!/usr/bin/env python3
"""
FULLY AUTOMATED Backup & Restore Server
Handles ALL operations automatically via web API
No manual SSH required!
"""
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
import json
import subprocess
import glob
import shutil
import sqlite3
from datetime import datetime
import threading

app = Flask(__name__)
CORS(app)

# Configuration
BACKUP_DIR = "/var/www/ayurveda/backups/daily"
MONTHLY_DIR = "/var/www/ayurveda/backups/monthly"
DB_PATH = "/var/www/ayurveda/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"
API_URL = "https://tpsdhanvantariayurveda.in"
MAX_BACKUPS = 30

# Get actual database file
def get_db_file():
    """Find the actual SQLite database file"""
    db_files = glob.glob(f"{DB_PATH}/*.sqlite")
    if db_files:
        return db_files[0]
    return None

@app.route('/api/backups/list', methods=['GET'])
def list_backups():
    """List all available backups with full details"""
    try:
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR, exist_ok=True)
        
        backups = []
        backup_dirs = sorted(glob.glob(f"{BACKUP_DIR}/ayurveda_backup_*"), reverse=True)
        
        for backup_path in backup_dirs:
            if os.path.isdir(backup_path):
                backup_name = os.path.basename(backup_path)
                json_file = os.path.join(backup_path, 'data.json')
                archive_file = f"{backup_path}.tar.gz"
                
                backup_info = {
                    'name': backup_name,
                    'date': backup_name.replace('ayurveda_backup_', ''),
                    'timestamp': '',
                    'size': 0,
                    'patients': 0,
                    'prescriptions': 0,
                    'medicines': 0,
                    'payments': 0,
                    'has_data': False
                }
                
                # Get archive size
                if os.path.exists(archive_file):
                    backup_info['size'] = os.path.getsize(archive_file)
                
                # Read JSON data
                if os.path.exists(json_file):
                    try:
                        with open(json_file, 'r') as f:
                            data = json.load(f)
                            backup_info['has_data'] = True
                            backup_info['timestamp'] = data.get('backup_timestamp', '')
                            backup_info['patients'] = len(data.get('patients', []))
                            backup_info['prescriptions'] = len(data.get('prescriptions', []))
                            backup_info['medicines'] = sum(
                                len(p.get('medicines', [])) 
                                for p in data.get('prescriptions', [])
                            )
                            backup_info['payments'] = len(data.get('payment_collections', []))
                    except Exception as e:
                        print(f"Error reading backup {backup_name}: {e}")
                
                backups.append(backup_info)
        
        return jsonify({
            'success': True,
            'data': backups,
            'count': len(backups)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/backups/create', methods=['POST'])
def create_backup():
    """AUTOMATICALLY create a backup via API"""
    try:
        import requests
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"ayurveda_backup_{timestamp}"
        backup_path = os.path.join(BACKUP_DIR, backup_name)
        os.makedirs(backup_path, exist_ok=True)
        
        # Collect data via API
        backup_data = {
            'backup_timestamp': datetime.now().isoformat(),
            'backup_type': 'manual_web_api',
            'source_url': API_URL,
            'patients': [],
            'prescriptions': [],
            'payment_collections': [],
            'appointments': []
        }
        
        # Fetch patients
        try:
            resp = requests.get(f"{API_URL}/api/patients", timeout=30)
            if resp.status_code == 200:
                backup_data['patients'] = resp.json().get('data', [])
        except Exception as e:
            print(f"Error fetching patients: {e}")
        
        # Fetch prescriptions with full details
        try:
            resp = requests.get(f"{API_URL}/api/prescriptions", timeout=30)
            if resp.status_code == 200:
                prescriptions = resp.json().get('data', [])
                for presc in prescriptions:
                    detail_resp = requests.get(f"{API_URL}/api/prescriptions/{presc['id']}", timeout=15)
                    if detail_resp.status_code == 200:
                        full_presc = detail_resp.json().get('data', {})
                        backup_data['prescriptions'].append(full_presc)
                        
                        # Extract payments
                        for payment in full_presc.get('payment_collections', []):
                            backup_data['payment_collections'].append(payment)
        except Exception as e:
            print(f"Error fetching prescriptions: {e}")
        
        # Save JSON
        json_file = os.path.join(backup_path, 'data.json')
        with open(json_file, 'w') as f:
            json.dump(backup_data, f, indent=2)
        
        # Create summary
        total_medicines = sum(len(p.get('medicines', [])) for p in backup_data['prescriptions'])
        summary_file = os.path.join(backup_path, 'SUMMARY.txt')
        with open(summary_file, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("MANUAL BACKUP SUMMARY\n")
            f.write("=" * 80 + "\n")
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Type: Manual Web API\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Patients: {len(backup_data['patients'])}\n")
            f.write(f"Prescriptions: {len(backup_data['prescriptions'])}\n")
            f.write(f"Medicines: {total_medicines}\n")
            f.write(f"Payments: {len(backup_data['payment_collections'])}\n")
        
        # Create archive
        import tarfile
        archive_file = f"{backup_path}.tar.gz"
        with tarfile.open(archive_file, "w:gz") as tar:
            tar.add(backup_path, arcname=os.path.basename(backup_path))
        
        return jsonify({
            'success': True,
            'message': 'Backup created successfully',
            'backup_name': backup_name,
            'patients': len(backup_data['patients']),
            'prescriptions': len(backup_data['prescriptions']),
            'medicines': total_medicines
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/backups/restore', methods=['POST'])
def restore_backup():
    """AUTOMATICALLY restore from backup - FULL AUTOMATION!"""
    try:
        data = request.get_json()
        backup_name = data.get('backup_name')
        confirmed = data.get('confirmed', False)
        
        if not confirmed:
            return jsonify({
                'success': False,
                'error': 'Restoration requires explicit confirmation'
            }), 400
        
        backup_path = os.path.join(BACKUP_DIR, backup_name)
        json_file = os.path.join(backup_path, 'data.json')
        
        if not os.path.exists(json_file):
            return jsonify({'success': False, 'error': 'Backup not found'}), 404
        
        # Load backup data
        with open(json_file, 'r') as f:
            backup = json.load(f)
        
        # Get database file
        db_file = get_db_file()
        if not db_file:
            return jsonify({'success': False, 'error': 'Database file not found'}), 500
        
        # STOP PM2
        subprocess.run(['pm2', 'stop', 'ayurveda-clinic'], check=False)
        
        # Connect to database
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        # CLEAR ALL DATA
        cursor.execute("DELETE FROM payment_collections")
        cursor.execute("DELETE FROM medicines_tracking")
        cursor.execute("DELETE FROM herbs_routes")
        cursor.execute("DELETE FROM patients")
        conn.commit()
        
        # RESTORE PATIENTS
        patients_restored = 0
        for patient in backup['patients']:
            try:
                cursor.execute("""
                    INSERT INTO patients (
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
                print(f"Error restoring patient: {e}")
        
        conn.commit()
        
        # RESTORE PRESCRIPTIONS
        prescriptions_restored = 0
        for presc in backup['prescriptions']:
            try:
                cursor.execute("""
                    INSERT INTO herbs_routes (
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
                print(f"Error restoring prescription: {e}")
        
        conn.commit()
        
        # RESTORE MEDICINES
        medicines_restored = 0
        for presc in backup['prescriptions']:
            herbs_route_id = presc.get('id')
            for med in presc.get('medicines', []):
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
                    print(f"Error restoring medicine: {e}")
        
        conn.commit()
        
        # RESTORE PAYMENTS
        payments_restored = 0
        for payment in backup['payment_collections']:
            try:
                cursor.execute("""
                    INSERT INTO payment_collections (
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
                print(f"Error restoring payment: {e}")
        
        conn.commit()
        conn.close()
        
        # RESTART PM2
        subprocess.run(['pm2', 'restart', 'ayurveda-clinic'], check=False)
        
        return jsonify({
            'success': True,
            'message': 'Restore completed successfully!',
            'restored': {
                'patients': patients_restored,
                'prescriptions': prescriptions_restored,
                'medicines': medicines_restored,
                'payments': payments_restored
            }
        })
        
    except Exception as e:
        # Try to restart PM2 even if restore failed
        subprocess.run(['pm2', 'restart', 'ayurveda-clinic'], check=False)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    db_file = get_db_file()
    return jsonify({
        'status': 'healthy',
        'backup_dir': os.path.exists(BACKUP_DIR),
        'database': db_file is not None,
        'database_path': db_file
    })

if __name__ == '__main__':
    os.makedirs(BACKUP_DIR, exist_ok=True)
    os.makedirs(MONTHLY_DIR, exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=False)
