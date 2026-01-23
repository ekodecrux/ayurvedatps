#!/bin/bash
# Fix for additional phone numbers in patient add/edit forms

cd /home/user/webapp

# Backup the original app.js
cp public/static/app.js public/static/app.js.backup

# Create a Python script to add the additional phones functionality
cat > fix_additional_phones.py << 'PYTHON_EOF'
import re

# Read the app.js file
with open('public/static/app.js', 'r') as f:
    content = f.read()

# Add the additional phones HTML structure and JavaScript
additional_phones_fix = '''
// ==================== Additional Phone Numbers Management ====================

// Initialize additional phones array
let additionalPhones = [];

// Function to render additional phone numbers
function renderAdditionalPhones() {
    const container = document.getElementById('additional-phones-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    additionalPhones.forEach((phone, index) => {
        const phoneRow = document.createElement('div');
        phoneRow.className = 'grid grid-cols-12 gap-2 mb-2';
        phoneRow.innerHTML = `
            <div class="col-span-3">
                <input type="text" 
                    class="w-full px-3 py-2 border rounded" 
                    placeholder="Label (e.g., Home, Office)"
                    value="${phone.label || ''}"
                    onchange="updateAdditionalPhone(${index}, 'label', this.value)">
            </div>
            <div class="col-span-2">
                <input type="text" 
                    class="w-full px-3 py-2 border rounded" 
                    placeholder="+91"
                    value="${phone.country_code || '+91'}"
                    onchange="updateAdditionalPhone(${index}, 'country_code', this.value)">
            </div>
            <div class="col-span-5">
                <input type="text" 
                    class="w-full px-3 py-2 border rounded" 
                    placeholder="Phone number"
                    value="${phone.number || ''}"
                    onchange="updateAdditionalPhone(${index}, 'number', this.value)">
            </div>
            <div class="col-span-2">
                <button type="button" 
                    class="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onclick="removeAdditionalPhone(${index})">
                    ✕ Remove
                </button>
            </div>
        `;
        container.appendChild(phoneRow);
    });
}

// Function to add new additional phone
function addAdditionalPhone() {
    additionalPhones.push({
        label: '',
        country_code: '+91',
        number: ''
    });
    renderAdditionalPhones();
}

// Function to update additional phone
function updateAdditionalPhone(index, field, value) {
    if (additionalPhones[index]) {
        additionalPhones[index][field] = value;
    }
}

// Function to remove additional phone
function removeAdditionalPhone(index) {
    additionalPhones.splice(index, 1);
    renderAdditionalPhones();
}

// Function to load additional phones from patient data
function loadAdditionalPhones(phonesData) {
    try {
        if (typeof phonesData === 'string') {
            additionalPhones = JSON.parse(phonesData) || [];
        } else if (Array.isArray(phonesData)) {
            additionalPhones = phonesData;
        } else {
            additionalPhones = [];
        }
    } catch (e) {
        additionalPhones = [];
    }
    renderAdditionalPhones();
}

// Function to get additional phones as JSON string
function getAdditionalPhonesJSON() {
    // Filter out empty phones
    const validPhones = additionalPhones.filter(p => p.number && p.number.trim() !== '');
    return JSON.stringify(validPhones);
}
'''

# Find a good place to insert this code (after the main app initialization)
# Look for the patients section
insert_position = content.find('// ==================== PATIENTS')

if insert_position != -1:
    content = content[:insert_position] + additional_phones_fix + '\n\n' + content[insert_position:]
    print("✅ Additional phones JavaScript added")
else:
    print("⚠️ Could not find insertion point, adding at beginning")
    content = additional_phones_fix + '\n\n' + content

# Write the updated content
with open('public/static/app.js', 'w') as f:
    f.write(content)

print("✅ app.js updated successfully")
PYTHON_EOF

# Run the Python script
python3 fix_additional_phones.py

echo "✅ Fix applied. Now rebuilding the project..."
npm run build

echo "✅ Restarting PM2..."
pm2 restart ayurveda-clinic

echo "✅ Done! Additional phone numbers functionality has been added."
