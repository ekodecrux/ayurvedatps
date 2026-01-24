// FULLY AUTOMATED BACKUP & RESTORE FUNCTIONS
// Add these to public/static/app.js

const BACKUP_API = 'http://localhost:5000/api';  // Change to production URL

// Load backup list automatically
async function loadBackupList() {
    try {
        const container = document.getElementById('backup-list-container');
        container.innerHTML = '<div class="flex items-center justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div></div>';
        
        const response = await axios.get(`${BACKUP_API}/backups/list`);
        const backups = response.data.data || [];
        
        let html = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patients</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescriptions</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicines</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;
        
        if (backups.length === 0) {
            html += '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No backups available</td></tr>';
        } else {
            backups.forEach((backup, index) => {
                const sizeMB = (backup.size / (1024 * 1024)).toFixed(2);
                const displaySize = backup.size > 1024 * 1024 ? `${sizeMB} MB` : `${(backup.size / 1024).toFixed(2)} KB`;
                const dateStr = backup.timestamp ? new Date(backup.timestamp).toLocaleString() : backup.date;
                
                html += `
                    <tr class="${index === 0 ? 'bg-green-50' : ''}">
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900">${dateStr}</div>
                            ${index === 0 ? '<span class="text-xs bg-green-500 text-white px-2 py-1 rounded">Latest</span>' : ''}
                        </td>
                        <td class="px-6 py-4 text-sm">${backup.patients}</td>
                        <td class="px-6 py-4 text-sm">${backup.prescriptions}</td>
                        <td class="px-6 py-4 text-sm">${backup.medicines}</td>
                        <td class="px-6 py-4 text-sm">${displaySize}</td>
                        <td class="px-6 py-4">
                            <button onclick="confirmRestore('${backup.name}')" class="text-blue-600 hover:text-blue-900">
                                <i class="fas fa-undo mr-1"></i>Restore
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Load backups error:', error);
        document.getElementById('backup-list-container').innerHTML = `
            <div class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p class="font-semibold">Error Loading Backups</p>
                <p class="text-sm">${error.message}</p>
            </div>
        `;
    }
}

// AUTOMATED backup creation - NO MANUAL STEPS!
async function createManualBackup() {
    if (!confirm('Create a manual backup now? This will take 30-60 seconds.')) {
        return;
    }
    
    try {
        showLoading();
        
        const response = await axios.post(`${BACKUP_API}/backups/create`);
        
        if (response.data.success) {
            alert(`✅ Backup Created Successfully!\n\n` +
                  `Patients: ${response.data.patients}\n` +
                  `Prescriptions: ${response.data.prescriptions}\n` +
                  `Medicines: ${response.data.medicines}\n\n` +
                  `Backup name: ${response.data.backup_name}`);
            
            // Reload backup list
            await loadBackupList();
        } else {
            throw new Error(response.data.error || 'Backup failed');
        }
        
    } catch (error) {
        console.error('Create backup error:', error);
        alert('❌ Error creating backup:\n' + (error.response?.data?.error || error.message));
    } finally {
        hideLoading();
    }
}

// Show critical warning before restore
function confirmRestore(backupName) {
    const modal = `
        <div id="restore-warning-modal" class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div class="relative p-8 border w-full max-w-2xl shadow-2xl rounded-xl bg-white">
                <div class="text-center">
                    <!-- Warning Icon -->
                    <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-600 animate-pulse"></i>
                    </div>
                    
                    <!-- Header -->
                    <h3 class="text-3xl font-bold text-gray-900 mb-4">
                        ⚠️ CRITICAL WARNING ⚠️
                    </h3>
                    
                    <!-- Main Warning Box -->
                    <div class="text-left bg-red-50 border-4 border-red-400 rounded-xl p-6 mb-6">
                        <p class="text-xl font-bold text-red-900 mb-4">
                            🚨 This action will PERMANENTLY DELETE all current data and replace it with backup data!
                        </p>
                        
                        <div class="space-y-2 text-base text-red-800 font-medium">
                            <p><i class="fas fa-times-circle text-red-600 mr-2"></i>All current patients data will be LOST</p>
                            <p><i class="fas fa-times-circle text-red-600 mr-2"></i>All current prescriptions will be LOST</p>
                            <p><i class="fas fa-times-circle text-red-600 mr-2"></i>All current medicines will be LOST</p>
                            <p><i class="fas fa-times-circle text-red-600 mr-2"></i>All current payments will be LOST</p>
                            <p><i class="fas fa-times-circle text-red-600 mr-2"></i>All data entered after backup date will be LOST</p>
                            <p class="text-xl font-bold text-red-900 mt-4">❌ THIS CANNOT BE UNDONE! ❌</p>
                        </div>
                    </div>
                    
                    <!-- Backup Info -->
                    <div class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                        <p class="font-semibold text-yellow-900 mb-2">
                            <i class="fas fa-info-circle mr-2"></i>Restore Information:
                        </p>
                        <div class="text-sm text-yellow-800 text-left space-y-1">
                            <p><strong>Backup:</strong> ${backupName}</p>
                            <p><strong>Action:</strong> Replace ALL current data with this backup</p>
                            <p><strong>Downtime:</strong> ~30 seconds (application will restart)</p>
                            <p><strong>Process:</strong> Fully automated - no manual steps required</p>
                        </div>
                    </div>
                    
                    <!-- Confirmation Checkbox -->
                    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
                        <label class="flex items-start cursor-pointer">
                            <input type="checkbox" id="restore-confirm-checkbox" class="mt-1 mr-3 w-6 h-6 text-red-600">
                            <span class="text-base font-bold text-gray-900 text-left">
                                I UNDERSTAND this will DELETE ALL CURRENT DATA and CANNOT BE UNDONE. 
                                I want to proceed with the restoration and accept all consequences.
                            </span>
                        </label>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex justify-center space-x-4">
                        <button 
                            onclick="closeRestoreModal()" 
                            class="px-8 py-4 bg-gray-500 text-white text-lg font-bold rounded-lg hover:bg-gray-600 transition">
                            <i class="fas fa-times mr-2"></i>Cancel - Keep Current Data
                        </button>
                        <button 
                            onclick="executeRestore('${backupName}')" 
                            id="restore-confirm-button"
                            disabled
                            class="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            <i class="fas fa-exclamation-triangle mr-2"></i>Yes, DELETE Current Data and RESTORE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Enable button when checkbox checked
    document.getElementById('restore-confirm-checkbox').addEventListener('change', function() {
        document.getElementById('restore-confirm-button').disabled = !this.checked;
    });
}

function closeRestoreModal() {
    const modal = document.getElementById('restore-warning-modal');
    if (modal) modal.remove();
}

// FULLY AUTOMATED restore - NO MANUAL STEPS!
async function executeRestore(backupName) {
    const checkbox = document.getElementById('restore-confirm-checkbox');
    if (!checkbox || !checkbox.checked) {
        alert('⚠️ Please confirm that you understand the consequences.');
        return;
    }
    
    closeRestoreModal();
    
    try {
        showLoading('🔄 Restoring backup... This will take 30-60 seconds...');
        
        const response = await axios.post(`${BACKUP_API}/backups/restore`, {
            backup_name: backupName,
            confirmed: true
        });
        
        if (response.data.success) {
            const restored = response.data.restored;
            alert(`✅ RESTORE COMPLETED SUCCESSFULLY!\n\n` +
                  `📊 Restored Data:\n` +
                  `• Patients: ${restored.patients}\n` +
                  `• Prescriptions: ${restored.prescriptions}\n` +
                  `• Medicines: ${restored.medicines}\n` +
                  `• Payments: ${restored.payments}\n\n` +
                  `✅ Application has been restarted.\n` +
                  `🔄 Page will reload to show restored data.`);
            
            // Reload page to show restored data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            throw new Error(response.data.error || 'Restore failed');
        }
        
    } catch (error) {
        console.error('Restore error:', error);
        alert(`❌ RESTORE FAILED!\n\n` +
              `Error: ${error.response?.data?.error || error.message}\n\n` +
              `⚠️ The application may need to be restarted manually.`);
    } finally {
        hideLoading();
    }
}

// Auto-load backup list when settings loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for navigation to settings
    const observer = new MutationObserver(function() {
        if (document.querySelector('#backup-list-container')) {
            loadBackupList();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
