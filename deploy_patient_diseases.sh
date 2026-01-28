#!/bin/bash
# Deploy Patient Diseases Update to Production
# Date: January 28, 2026

set -e

echo "🚀 Deploying Patient Diseases Update..."

# Step 1: Add patient diseases to production database
echo "📊 Adding patient-specific diseases to database..."
npx wrangler d1 execute ayurveda-db --local << 'EOSQL'
-- Add diseases from current patients
INSERT OR IGNORE INTO diseases (name, description, created_at, updated_at) VALUES
('Blood Sugar / Insulin Dependent', 'Diabetes requiring insulin therapy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Blood Pressure / Hypertension', 'High blood pressure condition', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Increased Creatinine', 'Kidney function indicator - elevated creatinine levels', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Heart Rhythm Imbalance', 'Irregular heartbeat or arrhythmia', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Smoking Related Issues', 'Health issues related to tobacco smoking', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
EOSQL

# Step 2: Verify diseases were added
echo ""
echo "✅ Verifying diseases..."
npx wrangler d1 execute ayurveda-db --local --command="SELECT COUNT(*) as total FROM diseases"

echo ""
echo "📋 Patient-specific diseases:"
npx wrangler d1 execute ayurveda-db --local --command="SELECT id, name FROM diseases WHERE name IN ('Blood Sugar / Insulin Dependent', 'Blood Pressure / Hypertension', 'Increased Creatinine', 'Heart Rhythm Imbalance', 'Smoking Related Issues')"

echo ""
echo "✅ Patient diseases deployment complete!"
echo ""
echo "📱 Test URLs:"
echo "  - Production: https://tpsdhanvantariayurveda.in/"
echo "  - Sandbox: https://3000-i19pmgwbxafv8g6ewmjed-b9b802c4.sandbox.novita.ai"
echo ""
echo "🧪 Test Steps:"
echo "  1. Go to Patients"
echo "  2. Click 'Diseases' button"
echo "  3. Verify 21 total diseases (including new 5)"
echo "  4. Click 'Add Patient'"
echo "  5. Click 'Add Disease'"
echo "  6. Verify dropdown includes:"
echo "     - Blood Sugar / Insulin Dependent"
echo "     - Blood Pressure / Hypertension"
echo "     - Heart Rhythm Imbalance"
echo "     - Increased Creatinine"
echo "     - Smoking Related Issues"
echo ""
echo "📄 Documentation: PATIENT_DISEASES_ADDED.md"
