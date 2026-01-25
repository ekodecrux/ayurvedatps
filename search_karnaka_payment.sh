#!/bin/bash
echo "=== Searching for Karnaka Reddy ₹1000 Payment ==="
echo ""

# Check current database
echo "1. LOCAL DATABASE CHECK:"
echo "========================"
sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "
SELECT 
  'Payment Collections' as source,
  pc.*,
  p.name as patient_name
FROM payment_collections pc
LEFT JOIN herbs_routes hr ON pc.herbs_route_id = hr.id  
LEFT JOIN patients p ON hr.patient_id = p.id
WHERE p.name LIKE '%Karn%'
UNION ALL
SELECT 
  'Herbs Routes (inline)' as source,
  hr.id,
  hr.id as herbs_route_id,
  NULL as course_id,
  hr.created_at as collection_date,
  hr.payment_amount as amount,
  'N/A' as payment_method,
  hr.payment_notes as notes,
  hr.created_at,
  p.name as patient_name
FROM herbs_routes hr
LEFT JOIN patients p ON hr.patient_id = p.id
WHERE p.name LIKE '%Karn%' AND hr.payment_amount > 0;
"

echo ""
echo "2. CHECKING ALL PAYMENTS IN DATABASE:"
echo "======================================"
sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "
SELECT 
  pc.id,
  pc.herbs_route_id,
  pc.collection_date,
  pc.amount,
  pc.payment_method,
  p.name as patient_name
FROM payment_collections pc
LEFT JOIN herbs_routes hr ON pc.herbs_route_id = hr.id
LEFT JOIN patients p ON hr.patient_id = p.id
ORDER BY pc.created_at DESC;
"

echo ""
echo "3. SEARCHING FOR ANY ₹1000 PAYMENTS:"
echo "===================================="
sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "
SELECT * FROM payment_collections WHERE amount = 1000 OR amount = 1000.0;
"

echo ""
echo "4. ALL PATIENTS WITH 'REDDY' IN NAME:"
echo "======================================"
sqlite3 -header -column .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite "
SELECT 
  p.id,
  p.name,
  p.patient_id,
  COUNT(hr.id) as prescription_count,
  SUM(hr.payment_amount) as total_payment,
  SUM(hr.advance_payment) as total_advance
FROM patients p
LEFT JOIN herbs_routes hr ON p.id = hr.patient_id
WHERE p.name LIKE '%Reddy%'
GROUP BY p.id;
"

echo ""
echo "=== SEARCH COMPLETE ==="
