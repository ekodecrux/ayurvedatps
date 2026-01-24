#!/usr/bin/env python3
"""
Script to check production database state and retrieve all data
"""
import requests
import json
import sys

PRODUCTION_URL = "https://tpsdhanvantariayurveda.in"

def check_data():
    print("=" * 80)
    print("PRODUCTION DATABASE DATA CHECK")
    print("=" * 80)
    
    # Check prescriptions
    print("\n1. Checking Prescriptions...")
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/prescriptions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            prescriptions = data.get('data', [])
            print(f"   ✓ Found {len(prescriptions)} prescriptions")
            for p in prescriptions:
                print(f"     - ID: {p['id']}, Patient: {p['patient_name']}, Course: {p['course']}")
        else:
            print(f"   ✗ Error: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
    
    # Check each prescription's medicines
    print("\n2. Checking Medicines in each Prescription...")
    prescription_ids = [2, 4, 5]
    for pid in prescription_ids:
        try:
            response = requests.get(f"{PRODUCTION_URL}/api/prescriptions/{pid}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                prescription = data.get('data', {})
                medicines = prescription.get('medicines', [])
                print(f"   - Prescription {pid} ({prescription.get('patient_name')}): {len(medicines)} medicines")
                if medicines:
                    for m in medicines[:3]:  # Show first 3
                        print(f"       • {m.get('medicine_name', 'N/A')}")
            else:
                print(f"   ✗ Prescription {pid}: Error {response.status_code}")
        except Exception as e:
            print(f"   ✗ Prescription {pid}: Failed - {e}")
    
    # Check patients
    print("\n3. Checking Patients...")
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/patients", timeout=10)
        if response.status_code == 200:
            data = response.json()
            patients = data.get('data', [])
            print(f"   ✓ Found {len(patients)} patients")
            for p in patients[:5]:  # Show first 5
                print(f"     - {p.get('name', 'N/A')} ({p.get('patient_id', 'N/A')})")
        else:
            print(f"   ✗ Error: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
    
    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    check_data()
