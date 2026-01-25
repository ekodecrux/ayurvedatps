#!/bin/bash
echo "=== COMPREHENSIVE DATA AUDIT REPORT ==="
echo "Generated: $(date)"
echo ""

# Check prescriptions
echo "1. PRESCRIPTIONS DATA"
echo "====================="
curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions" | jq -r '
.data[] | 
"Prescription ID: \(.id)
  Patient: \(.patient_name) (\(.patient_identifier))
  Course: \(.course) months
  Created: \(.created_at)
  Updated: \(.updated_at)
  Next Follow-up: \(.next_followup_date)
"'

echo ""
echo "2. DETAILED MEDICINE & PAYMENT CHECK"
echo "====================================="

for id in $(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions" | jq -r '.data[].id'); do
    echo ""
    echo "Prescription #$id Details:"
    curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions/$id" | jq -r '
    .data | 
    "  Patient: \(.patient_name) (\(.patient_identifier))
  Age/Gender: \(.age) / \(.gender)
  Phone: \(.country_code) \(.patient_phone)
  Medical History: \(.medical_history // "Not specified")
  Diagnosis: \(.diagnosis // "Not specified")
  Course: \(.course) months
  
  💊 MEDICINES: \(.medicines | length) items
\(if (.medicines | length) > 0 then 
    (.medicines[] | "    - [\(.roman_id)] \(.medicine_name)
      Dosage: M:\(.morning_before)B/\(.morning_after)A, A:\(.afternoon_before)B/\(.afternoon_after)A, E:\(.evening_before)B/\(.evening_after)A, N:\(.night_before)B/\(.night_after)A
      Note: \(.note // "N/A")
      Frequency: \(.frequency // "daily")")
else 
    "    ❌ No medicines recorded"
end)
  
  💰 PAYMENTS: \(.payment_collections | length) collections
\(if (.payment_collections | length) > 0 then 
    (.payment_collections[] | "    - Date: \(.collection_date)
      Amount: ₹\(.amount)
      Course: \(.course_id)
      Method: \(.payment_method // "Not specified")
      Notes: \(.notes // "N/A")")
else 
    "    ❌ No payment collections recorded"
end)
  
  💵 Payment Summary:
    Total Amount: ₹\(.payment_amount // 0)
    Advance: ₹\(.advance_payment // 0)
    Balance Due: ₹\(.due_balance // 0)
"
    '
    echo "─────────────────────────────────────────"
done

echo ""
echo "3. SUMMARY STATISTICS"
echo "===================="
echo "Total Prescriptions: $(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions" | jq '.data | length')"
echo ""

# Count total medicines across all prescriptions
total_medicines=0
for id in $(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions" | jq -r '.data[].id'); do
    count=$(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions/$id" | jq '.data.medicines | length')
    total_medicines=$((total_medicines + count))
done
echo "Total Medicines (all prescriptions): $total_medicines"

# Count total payments
total_payments=0
for id in $(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions" | jq -r '.data[].id'); do
    count=$(curl -s "https://tpsdhanvantariayurveda.in/api/prescriptions/$id" | jq '.data.payment_collections | length')
    total_payments=$((total_payments + count))
done
echo "Total Payment Collections: $total_payments"

echo ""
echo "4. CONCLUSION"
echo "============="
if [ $total_medicines -eq 0 ]; then
    echo "❌ NO MEDICINE DATA FOUND in any prescription"
    echo "   This confirms medicines were never entered OR were deleted"
else
    echo "✅ Found $total_medicines medicines across all prescriptions"
fi

if [ $total_payments -eq 0 ]; then
    echo "⚠️  NO PAYMENT COLLECTIONS FOUND"
else
    echo "✅ Found $total_payments payment collections"
fi

echo ""
echo "=== REPORT COMPLETE ==="
