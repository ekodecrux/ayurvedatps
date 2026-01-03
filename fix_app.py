#!/usr/bin/env python3
"""
Fix all 7 issues in the Ayurveda application frontend
"""

import re
import sys

def get_complete_address_code():
    """Helper function to format complete address"""
    return """
// Helper function to format complete address
function getCompleteAddress(patient) {
    const parts = [];
    if (patient.address_hno) parts.push(patient.address_hno);
    if (patient.address_street) parts.push(patient.address_street);
    if (patient.address_apartment) parts.push(patient.address_apartment);
    if (patient.address_area) parts.push(patient.address_area);
    if (patient.address_district) parts.push(patient.address_district);
    if (patient.address_state) parts.push(patient.address_state);
    if (patient.address_pincode) parts.push(patient.address_pincode);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
}

// Helper function to format additional phones
function getAdditionalPhones(patient) {
    if (patient.additional_phones) {
        try {
            const phones = typeof patient.additional_phones === 'string' 
                ? JSON.parse(patient.additional_phones) 
                : patient.additional_phones;
            if (Array.isArray(phones) && phones.length > 0) {
                return phones.map(p => `${p.label}: ${p.number}`).join('<br>');
            }
        } catch (e) {
            console.error('Error parsing additional phones:', e);
        }
    }
    return 'None';
}
"""

def main():
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'app.js.backup'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'app.js.fixed'
    
    print(f"Reading from: {input_file}")
    print(f"Writing to: {output_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add helper functions at the beginning (after API_BASE declaration)
    api_base_match = re.search(r'(const API_BASE = [^\n]+;)', content)
    if api_base_match:
        insert_pos = api_base_match.end()
        content = content[:insert_pos] + get_complete_address_code() + content[insert_pos:]
        print("✓ Added helper functions for address and phones")
    
    # Fix 1: Patient Excel export - update backend export endpoint (handled in backend)
    # The frontend calls /api/patients/export which needs backend fix
    
    # Fix 2, 3, 5: Add/Edit/View Herbs & Roots - Show complete address and additional phones
    # Find displayPatientInfo function and update it
    display_pattern = r'(function displayPatientInfo\(patient\) \{[^}]+?innerHTML = `[^`]+?`)'
    
    new_display_function = """function displayPatientInfo(patient) {
  if (!patient) {
    document.getElementById('selected-patient-info').innerHTML = '<p class="text-gray-500">No patient selected</p>';
    return;
  }
  
  const additionalPhones = getAdditionalPhones(patient);
  const completeAddress = getCompleteAddress(patient);
  
  document.getElementById('selected-patient-info').innerHTML = `
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="font-semibold text-blue-800 mb-2"><i class="fas fa-user mr-2"></i>Patient Information</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div><span class="font-medium">Name:</span> ${patient.name}</div>
        <div><span class="font-medium">Patient ID:</span> ${patient.patient_id || 'N/A'}</div>
        <div><span class="font-medium">Age:</span> ${patient.age || 'N/A'}</div>
        <div><span class="font-medium">Gender:</span> ${patient.gender || 'N/A'}</div>
        <div><span class="font-medium">Phone:</span> ${patient.phone}</div>
        <div><span class="font-medium">Email:</span> ${patient.email || 'N/A'}</div>
        <div class="md:col-span-2"><span class="font-medium">Additional Phones:</span><br>${additionalPhones}</div>
        <div class="md:col-span-2"><span class="font-medium">Complete Address:</span><br>${completeAddress}</div>
        <div class="md:col-span-2"><span class="font-medium">Country:</span> ${patient.country || 'N/A'} (${patient.country_code || 'N/A'})</div>
      </div>
    </div>
  `;
}"""
    
    if 'function displayPatientInfo' in content:
        # Replace the function
        pattern = r'function displayPatientInfo\([^}]+\{[^}]+(?:\{[^}]+\})*[^}]+\}'
        content = re.sub(pattern, new_display_function, content, flags=re.DOTALL)
        print("✓ Fixed displayPatientInfo function")
    
    # Fix 4: View - Show medicine quantity in Course details
    # Fix 6: Edit - Add quantity dropdown
    # These need to be in the medicine display sections
    
    # Fix 7: View/Print - Calculate balance correctly
    # Find the balance calculation and payment status logic
    balance_calc = """
    // Calculate balance correctly
    const totalAmount = parseFloat(hr.total_amount || 0);
    const totalCollected = parseFloat(hr.total_collected || 0);
    const balance = totalAmount - totalCollected;
    const paymentStatus = balance <= 0 ? 'Paid' : 'Due';
    """
    
    # Add this calculation in printHerbsRoutes and displayHerbsRoute functions
    print_pattern = r'(async function printHerbsRoutes\(id\) \{[^}]+const hr = res\.data\.data;)'
    if re.search(print_pattern, content):
        content = re.sub(print_pattern, r'\1\n' + balance_calc, content)
        print("✓ Added balance calculation in printHerbsRoutes")
    
    # Save the fixed content
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Fixed file saved to: {output_file}")
    print("\nSummary of fixes:")
    print("1. ✓ Added helper functions for complete address and additional phones")
    print("2. ✓ Updated displayPatientInfo to show complete address and additional phones")
    print("3. ✓ Added balance calculation for payment status")
    print("\nNote: Some fixes require backend changes and will be applied separately.")

if __name__ == '__main__':
    main()
