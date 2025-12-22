import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie, setCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== AUTHENTICATION API ====================

// Helper function to generate session token
function generateSessionToken(): string {
  return crypto.randomUUID() + '-' + Date.now()
}

// Helper function to check if user is authenticated
async function isAuthenticated(c: any): Promise<any> {
  const sessionToken = getCookie(c, 'session_token')
  
  if (!sessionToken) {
    return null
  }
  
  const session = await c.env.DB.prepare(`
    SELECT s.*, u.id as user_id, u.email, u.name, u.profile_picture
    FROM sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.session_token = ? AND s.expires_at > datetime('now')
  `).bind(sessionToken).first()
  
  return session
}

// Login with Google (or email for now)
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400)
    }
    
    // Hash the provided password using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Find admin user
    const user = await c.env.DB.prepare(
      'SELECT * FROM admin_users WHERE email = ? AND password_hash = ?'
    ).bind(email, passwordHash).first()
    
    if (!user) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401)
    }
    
    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry
    
    // Store session (use admin_users id)
    await c.env.DB.prepare(`
      INSERT INTO sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
    `).bind((user as any).id, sessionToken, expiresAt.toISOString()).run()
    
    // Set cookie
    setCookie(c, 'session_token', sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    return c.json({ 
      success: true, 
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        profile_picture: (user as any).profile_picture
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Logout
app.post('/api/auth/logout', async (c) => {
  try {
    const sessionToken = getCookie(c, 'session_token')
    
    if (sessionToken) {
      await c.env.DB.prepare('DELETE FROM sessions WHERE session_token = ?').bind(sessionToken).run()
    }
    
    setCookie(c, 'session_token', '', { path: '/', httpOnly: true, sameSite: 'Strict', maxAge: 0 })
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Check authentication status
app.get('/api/auth/me', async (c) => {
  try {
    const user = await isAuthenticated(c)
    
    if (!user) {
      return c.json({ success: false, authenticated: false }, 401)
    }
    
    return c.json({ 
      success: true, 
      authenticated: true,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        role: 'admin',
        profile_picture: user.profile_picture
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update admin profile
app.put('/api/admin/profile', async (c) => {
  try {
    const user = await isAuthenticated(c)
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const { name, profile_picture } = await c.req.json()
    
    if (!name) {
      return c.json({ success: false, error: 'Name is required' }, 400)
    }

    await c.env.DB.prepare(
      'UPDATE admin_users SET name = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, profile_picture || null, user.user_id).run()

    return c.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: { name, profile_picture }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Change admin password
app.put('/api/admin/change-password', async (c) => {
  try {
    const user = await isAuthenticated(c)
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const { currentPassword, newPassword } = await c.req.json()
    
    if (!currentPassword || !newPassword) {
      return c.json({ success: false, error: 'Both current and new passwords are required' }, 400)
    }

    if (newPassword.length < 6) {
      return c.json({ success: false, error: 'New password must be at least 6 characters' }, 400)
    }

    // Hash current password
    const encoder = new TextEncoder()
    const currentData = encoder.encode(currentPassword)
    const currentHashBuffer = await crypto.subtle.digest('SHA-256', currentData)
    const currentHashArray = Array.from(new Uint8Array(currentHashBuffer))
    const currentPasswordHash = currentHashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Verify current password
    const adminUser = await c.env.DB.prepare(
      'SELECT * FROM admin_users WHERE id = ? AND password_hash = ?'
    ).bind(user.user_id, currentPasswordHash).first()

    if (!adminUser) {
      return c.json({ success: false, error: 'Current password is incorrect' }, 401)
    }

    // Hash new password
    const newData = encoder.encode(newPassword)
    const newHashBuffer = await crypto.subtle.digest('SHA-256', newData)
    const newHashArray = Array.from(new Uint8Array(newHashBuffer))
    const newPasswordHash = newHashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Update password
    await c.env.DB.prepare(
      'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newPasswordHash, user.user_id).run()

    return c.json({ 
      success: true, 
      message: 'Password changed successfully'
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== PATIENTS API ====================

// Get list of countries that have patients
app.get('/api/patients/countries', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT DISTINCT country FROM patients WHERE country IS NOT NULL AND country != "" ORDER BY country ASC'
    ).all()
    return c.json({ success: true, data: results.map((r: any) => r.country) })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get all patients with search and filter
app.get('/api/patients', async (c) => {
  try {
    const search = c.req.query('search') || ''
    const gender = c.req.query('gender') || ''
    const country = c.req.query('country') || ''
    
    let query = 'SELECT * FROM patients WHERE 1=1'
    const params: any[] = []
    
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR patient_id LIKE ? OR email LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam, searchParam)
    }
    
    if (gender) {
      query += ' AND gender = ?'
      params.push(gender)
    }
    
    if (country) {
      query += ' AND country = ?'
      params.push(country)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Export patients (MUST come before :id route)
// This endpoint is defined later in the file at line ~400
// but logically should be here for route matching priority

app.get('/api/patients/export', async (c) => {
  try {
    const format = c.req.query('format') || 'csv'
    const country = c.req.query('country') || ''
    
    let query = 'SELECT * FROM patients WHERE 1=1'
    const params: any[] = []
    
    if (country) {
      query += ' AND country = ?'
      params.push(country)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    
    if (results.length === 0) {
      return c.text('No patients to export', 404)
    }
    
    const date = new Date().toISOString().split('T')[0]
    
    if (format === 'csv') {
      // CSV Export
      const headers = [
        'Patient ID', 'Name', 'Age', 'Gender', 'Country', 'Phone', 'Country Code',
        'Email', 'Weight', 'Height', 'Address H.No', 'Street', 'Apartment', 'Area',
        'District', 'State', 'Pin Code', 'Diseases/Medicines', 'Additional Phones',
        'Referred By Name', 'Referred By Phone', 'Referred By Address', 'Medical History', 'Created At'
      ].join(',')
      
      const rows = results.map((patient: any) => {
        // Parse diseases JSON
        let diseasesText = ''
        if (patient.diseases) {
          try {
            const diseases = JSON.parse(patient.diseases)
            diseasesText = diseases.map((d: any) => 
              `${d.present_health_issue || ''} - ${d.present_medicine || ''} (${d.mg_value || ''}) - Attacked: ${d.attacked_by || ''}`
            ).join('; ')
          } catch (e) {
            // Fallback to old fields
            if (patient.present_health_issue) {
              diseasesText = `${patient.present_health_issue || ''} - ${patient.present_medicine || ''} (${patient.mg_value || ''}) - Attacked: ${patient.attacked_by || ''}`
            }
          }
        } else if (patient.present_health_issue) {
          diseasesText = `${patient.present_health_issue || ''} - ${patient.present_medicine || ''} (${patient.mg_value || ''}) - Attacked: ${patient.attacked_by || ''}`
        }
        
        // Parse additional phones JSON
        let phonesText = ''
        if (patient.additional_phones) {
          try {
            const phones = JSON.parse(patient.additional_phones)
            phonesText = phones.map((p: any) => `${p.label}: ${p.number}`).join('; ')
          } catch (e) {
            phonesText = ''
          }
        }
        
        return [
          patient.patient_id || '',
          `"${(patient.name || '').replace(/"/g, '""')}"`,
          patient.age || '',
          patient.gender || '',
          patient.country || '',
          `${patient.country_code || ''} ${patient.phone || ''}`,
          patient.country_code || '',
          patient.email || '',
          patient.weight || '',
          patient.height || '',
          patient.address_hno || '',
          `"${(patient.address_street || '').replace(/"/g, '""')}"`,
          `"${(patient.address_apartment || '').replace(/"/g, '""')}"`,
          `"${(patient.address_area || '').replace(/"/g, '""')}"`,
          patient.address_district || '',
          patient.address_state || '',
          patient.address_pincode || '',
          `"${diseasesText.replace(/"/g, '""')}"`,
          `"${phonesText.replace(/"/g, '""')}"`,
          patient.referred_by_name || '',
          patient.referred_by_phone || '',
          `"${(patient.referred_by_address || '').replace(/"/g, '""')}"`,
          `"${(patient.medical_history || '').replace(/"/g, '""')}"`,
          patient.created_at || ''
        ].join(',')
      }).join('\n')
      
      const csv = `${headers}\n${rows}`
      
      return c.text(csv, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="patients_export_${date}.csv"`
      })
    } else if (format === 'excel') {
      // Excel Export (using HTML table with Excel mime type)
      const headers = ['Patient ID', 'Name', 'Age', 'Gender', 'Country', 'Phone', 'Country Code',
        'Email', 'Weight', 'Height', 'Address H.No', 'Street', 'Apartment', 'Area',
        'District', 'State', 'Pin Code', 'Diseases/Medicines', 'Additional Phones', 
        'Referred By Name', 'Referred By Phone', 'Referred By Address', 'Medical History', 'Created At']
      
      const rows = results.map((patient: any) => {
        // Parse diseases JSON
        let diseasesText = ''
        if (patient.diseases) {
          try {
            const diseases = JSON.parse(patient.diseases)
            diseasesText = diseases.map((d: any) => 
              `${d.present_health_issue || ''} - ${d.present_medicine || ''} (${d.mg_value || ''}) - ${d.attacked_by || ''}`
            ).join('; ')
          } catch (e) {
            // Fallback to old fields
            if (patient.present_health_issue) {
              diseasesText = `${patient.present_health_issue || ''} - ${patient.present_medicine || ''} (${patient.mg_value || ''}) - ${patient.attacked_by || ''}`
            }
          }
        } else if (patient.present_health_issue) {
          diseasesText = `${patient.present_health_issue || ''} - ${patient.present_medicine || ''} (${patient.mg_value || ''}) - ${patient.attacked_by || ''}`
        }
        
        // Parse additional phones JSON
        let phonesText = ''
        if (patient.additional_phones) {
          try {
            const phones = JSON.parse(patient.additional_phones)
            phonesText = phones.map((p: any) => `${p.label}: ${p.number}`).join('; ')
          } catch (e) {
            phonesText = ''
          }
        }
        
        return `<tr>
          <td>${patient.patient_id || ''}</td>
          <td>${patient.name || ''}</td>
          <td>${patient.age || ''}</td>
          <td>${patient.gender || ''}</td>
          <td>${patient.country || ''}</td>
          <td>${patient.country_code || ''} ${patient.phone || ''}</td>
          <td>${patient.country_code || ''}</td>
          <td>${patient.email || ''}</td>
          <td>${patient.weight || ''}</td>
          <td>${patient.height || ''}</td>
          <td>${patient.address_hno || ''}</td>
          <td>${patient.address_street || ''}</td>
          <td>${patient.address_apartment || ''}</td>
          <td>${patient.address_area || ''}</td>
          <td>${patient.address_district || ''}</td>
          <td>${patient.address_state || ''}</td>
          <td>${patient.address_pincode || ''}</td>
          <td>${diseasesText}</td>
          <td>${phonesText}</td>
          <td>${patient.referred_by_name || ''}</td>
          <td>${patient.referred_by_phone || ''}</td>
          <td>${patient.referred_by_address || ''}</td>
          <td>${patient.medical_history || ''}</td>
          <td>${patient.created_at || ''}</td>
        </tr>`
      }).join('\n')
      
      const excel = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
          <head>
            <meta charset="UTF-8">
            <style>table { border-collapse: collapse; } td, th { border: 1px solid #ddd; padding: 8px; white-space: nowrap; }</style>
          </head>
          <body>
            <h2>TPS DHANVANTRI AYURVEDA - Patients Export</h2>
            <p>Export Date: ${date} | Total Patients: ${results.length}</p>
            <table>
              <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `
      
      return c.html(excel, 200, {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="patients_export_${date}.xls"`
      })
    } else if (format === 'pdf') {
      // PDF Export (using HTML that can be printed to PDF)
      const rows = results.map((patient: any) => {
        // Parse diseases JSON
        let diseasesText = ''
        if (patient.diseases) {
          try {
            const diseases = JSON.parse(patient.diseases)
            diseasesText = diseases.map((d: any) => 
              `<div style="margin-bottom: 5px;"><strong>${d.present_health_issue || 'N/A'}:</strong> ${d.present_medicine || 'N/A'} (${d.mg_value || ''}) - Attacked: ${d.attacked_by || 'N/A'}</div>`
            ).join('')
          } catch (e) {
            if (patient.present_health_issue) {
              diseasesText = `<div><strong>${patient.present_health_issue}:</strong> ${patient.present_medicine || 'N/A'} (${patient.mg_value || ''}) - Attacked: ${patient.attacked_by || 'N/A'}</div>`
            }
          }
        } else if (patient.present_health_issue) {
          diseasesText = `<div><strong>${patient.present_health_issue}:</strong> ${patient.present_medicine || 'N/A'} (${patient.mg_value || ''}) - Attacked: ${patient.attacked_by || 'N/A'}</div>`
        }
        
        // Parse additional phones JSON
        let phonesText = ''
        if (patient.additional_phones) {
          try {
            const phones = JSON.parse(patient.additional_phones)
            phonesText = phones.map((p: any) => `<div>${p.label}: ${p.number}</div>`).join('')
          } catch (e) {
            phonesText = '<div>N/A</div>'
          }
        } else {
          phonesText = '<div>N/A</div>'
        }
        
        const fullAddress = [
          patient.address_hno,
          patient.address_street,
          patient.address_apartment,
          patient.address_area,
          patient.address_district,
          patient.address_state,
          patient.address_pincode
        ].filter(Boolean).join(', ') || 'N/A'
        
        return `
          <div class="patient-card">
            <div class="patient-header">
              <h3>${patient.patient_id || 'N/A'} - ${patient.name || 'N/A'}</h3>
              <div class="patient-meta">${patient.age || 'N/A'} years | ${patient.gender || 'N/A'} | ${patient.country || 'N/A'}</div>
            </div>
            <div class="patient-details">
              <div class="detail-row">
                <strong>Phone:</strong> ${patient.country_code || ''} ${patient.phone || 'N/A'}
              </div>
              <div class="detail-row">
                <strong>Email:</strong> ${patient.email || 'N/A'}
              </div>
              <div class="detail-row">
                <strong>Weight/Height:</strong> ${patient.weight || 'N/A'} kg / ${patient.height || 'N/A'} ft
              </div>
              <div class="detail-row">
                <strong>Address:</strong> ${fullAddress}
              </div>
              ${phonesText ? `<div class="detail-row"><strong>Additional Phones:</strong> ${phonesText}</div>` : ''}
              ${diseasesText ? `<div class="detail-row"><strong>Diseases/Medicines:</strong> ${diseasesText}</div>` : ''}
              ${patient.medical_history ? `<div class="detail-row"><strong>Medical History:</strong> ${patient.medical_history}</div>` : ''}
              ${patient.referred_by_name ? `<div class="detail-row"><strong>Referred By:</strong> ${patient.referred_by_name} (${patient.referred_by_phone || 'N/A'}) - ${patient.referred_by_address || ''}</div>` : ''}
              <div class="detail-row">
                <strong>Added:</strong> ${patient.created_at || 'N/A'}
              </div>
            </div>
          </div>
        `
      }).join('\n')
      
      const pdf = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Patients Export - ${date}</title>
            <style>
              @media print {
                body { margin: 0; padding: 15px; }
                .no-print { display: none; }
                .patient-card { page-break-inside: avoid; }
              }
              body { font-family: Arial, sans-serif; font-size: 12px; }
              h1 { text-align: center; color: #2c5f2d; margin-bottom: 5px; }
              .export-info { text-align: center; color: #666; margin-bottom: 20px; font-size: 11px; }
              .print-btn { margin: 15px auto; display: block; padding: 10px 30px; background: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px; border-radius: 5px; }
              .patient-card { border: 1px solid #ddd; margin-bottom: 15px; padding: 12px; border-radius: 5px; background: #f9f9f9; }
              .patient-header { border-bottom: 2px solid #4CAF50; padding-bottom: 8px; margin-bottom: 10px; }
              .patient-header h3 { margin: 0; color: #2c5f2d; font-size: 14px; }
              .patient-meta { color: #666; font-size: 11px; margin-top: 3px; }
              .patient-details { }
              .detail-row { margin: 6px 0; line-height: 1.4; }
              .detail-row strong { color: #2c5f2d; display: inline-block; min-width: 140px; }
            </style>
            <script>
              window.onload = function() {
                const printBtn = document.getElementById('printBtn');
                if (printBtn) {
                  printBtn.addEventListener('click', function() { window.print(); });
                }
              }
            </script>
          </head>
          <body>
            <h1>TPS DHANVANTRI AYURVEDA - Patients List</h1>
            <div class="export-info">Export Date: ${date} | Total Patients: ${results.length}${country ? ` | Country: ${country}` : ''}</div>
            <button id="printBtn" class="print-btn no-print">Print / Save as PDF</button>
            ${rows}
          </body>
        </html>
      `
      
      return c.html(pdf, 200)
    } else {
      return c.json({ success: false, error: 'Invalid format. Use csv, excel, or pdf' }, 400)
    }
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get single patient
app.get('/api/patients/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const patient = await c.env.DB.prepare(
      'SELECT * FROM patients WHERE id = ?'
    ).bind(id).first()
    
    if (!patient) {
      return c.json({ success: false, error: 'Patient not found' }, 404)
    }
    
    return c.json({ success: true, data: patient })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create patient with auto-generated COUNTRYISO00001 patient_id (sequential across all countries)
app.post('/api/patients', async (c) => {
  try {
    const body = await c.req.json()
    
    // Generate patient ID: ISO3 code + sequential number (00001, 00002, etc.)
    const countryIso3 = body.country_iso3 || 'IND'
    
    // Get the last patient ID (regardless of country) to continue sequence
    const lastPatient = await c.env.DB.prepare(
      'SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1'
    ).first()
    
    let patientId
    if (lastPatient) {
      // Extract numeric part from last patient_id (e.g., "IND00005" -> 5)
      const lastId = (lastPatient as any).patient_id
      const numericPart = lastId.replace(/^[A-Z]+/, '') // Remove country code prefix
      const lastNumber = parseInt(numericPart) || 0
      patientId = countryIso3 + String(lastNumber + 1).padStart(5, '0')
    } else {
      patientId = countryIso3 + '00001'
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO patients (
        patient_id, name, age, gender, phone, email, address, medical_history,
        country, country_code, country_iso3, weight, height,
        referred_by_name, referred_by_phone, referred_by_address,
        address_hno, address_street, address_apartment, address_area, 
        address_district, address_state, address_pincode,
        address_latitude, address_longitude,
        photo_url, present_health_issue, present_medicine, mg_value,
        additional_phones, diseases
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      patientId,
      body.name || null,
      body.age !== undefined && body.age !== '' ? body.age : null,
      body.gender || null,
      body.phone || null,
      body.email || null,
      body.address || null,
      body.medical_history || null,
      body.country || 'India',
      body.country_code || '+91',
      body.country_iso3 || 'IND',
      body.weight !== undefined && body.weight !== '' ? body.weight : null,
      body.height !== undefined && body.height !== '' ? body.height : null,
      body.referred_by_name || null,
      body.referred_by_phone || null,
      body.referred_by_address || null,
      body.address_hno || null,
      body.address_street || null,
      body.address_apartment || null,
      body.address_area || null,
      body.address_district || null,
      body.address_state || null,
      body.address_pincode || null,
      body.address_latitude || null,
      body.address_longitude || null,
      body.photo_url || null,
      body.present_health_issue || null,
      body.present_medicine || null,
      body.mg_value || null,
      body.additional_phones || null,
      body.diseases || null
    ).run()
    
    return c.json({ success: true, data: { id: result.meta.last_row_id, patient_id: patientId } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update patient
app.put('/api/patients/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE patients SET 
        name = ?, age = ?, gender = ?, phone = ?, email = ?, address = ?, medical_history = ?,
        country = ?, country_code = ?, country_iso3 = ?, weight = ?, height = ?,
        referred_by_name = ?, referred_by_phone = ?, referred_by_address = ?,
        address_hno = ?, address_street = ?, address_apartment = ?, address_area = ?,
        address_district = ?, address_state = ?, address_pincode = ?,
        address_latitude = ?, address_longitude = ?,
        photo_url = ?, present_health_issue = ?, present_medicine = ?, mg_value = ?,
        additional_phones = ?, diseases = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.name || null,
      body.age !== undefined && body.age !== '' ? body.age : null,
      body.gender || null,
      body.phone || null,
      body.email || null,
      body.address || null,
      body.medical_history || null,
      body.country || null,
      body.country_code || null,
      body.country_iso3 || null,
      body.weight !== undefined && body.weight !== '' ? body.weight : null,
      body.height !== undefined && body.height !== '' ? body.height : null,
      body.referred_by_name || null,
      body.referred_by_phone || null,
      body.referred_by_address || null,
      body.address_hno || null,
      body.address_street || null,
      body.address_apartment || null,
      body.address_area || null,
      body.address_district || null,
      body.address_state || null,
      body.address_pincode || null,
      body.address_latitude || null,
      body.address_longitude || null,
      body.photo_url || null,
      body.present_health_issue || null,
      body.present_medicine || null,
      body.mg_value || null,
      body.additional_phones || null,
      body.diseases || null,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete patient
app.delete('/api/patients/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM patients WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get patient diseases
app.get('/api/patients/:id/diseases', async (c) => {
  try {
    const patientId = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM patient_diseases WHERE patient_id = ? ORDER BY created_at DESC'
    ).bind(patientId).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Add patient disease
app.post('/api/patients/:id/diseases', async (c) => {
  try {
    const patientId = c.req.param('id')
    const body = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO patient_diseases (patient_id, disease_name, attacked_by, notes)
      VALUES (?, ?, ?, ?)
    `).bind(patientId, body.disease_name, body.attacked_by || null, body.notes || null).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete patient disease
app.delete('/api/patient-diseases/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM patient_diseases WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Export patients to CSV
// Export patients in CSV, Excel, or PDF format


// ==================== APPOINTMENTS API ====================

// Get all appointments with search and filter
app.get('/api/appointments', async (c) => {
  try {
    const search = c.req.query('search') || ''
    const status = c.req.query('status') || ''
    const date = c.req.query('date') || ''
    
    let query = `
      SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.patient_id
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.phone LIKE ? OR p.patient_id LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam)
    }
    
    if (status) {
      query += ' AND a.status = ?'
      params.push(status)
    }
    
    if (date) {
      query += ' AND DATE(a.appointment_date) = ?'
      params.push(date)
    }
    
    query += ' ORDER BY a.appointment_date DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get single appointment
app.get('/api/appointments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const appointment = await c.env.DB.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `).bind(id).first()
    
    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404)
    }
    
    return c.json({ success: true, data: appointment })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get appointments by patient
app.get('/api/patients/:id/appointments', async (c) => {
  try {
    const patientId = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY appointment_date DESC'
    ).bind(patientId).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create appointment
app.post('/api/appointments', async (c) => {
  try {
    const body = await c.req.json()
    const { patient_id, appointment_date, purpose, status, notes } = body
    
    const result = await c.env.DB.prepare(
      'INSERT INTO appointments (patient_id, appointment_date, purpose, status, notes) VALUES (?, ?, ?, ?, ?)'
    ).bind(patient_id, appointment_date, purpose, status || 'scheduled', notes).run()
    
    return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update appointment
app.put('/api/appointments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { appointment_date, purpose, status, notes } = body
    
    await c.env.DB.prepare(
      'UPDATE appointments SET appointment_date = ?, purpose = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(appointment_date, purpose, status, notes, id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete appointment
app.delete('/api/appointments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM appointments WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== HERBS & ROUTES API ====================

// Get all herbs & routes with search and filter
app.get('/api/prescriptions', async (c) => {
  try {
    const search = c.req.query('search') || ''
    const dateFrom = c.req.query('dateFrom') || ''
    const dateTo = c.req.query('dateTo') || ''
    
    let query = `
      SELECT h.*, p.name as patient_name, p.phone as patient_phone, p.patient_id, p.country
      FROM herbs_routes h
      LEFT JOIN patients p ON h.patient_id = p.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.phone LIKE ? OR p.patient_id LIKE ? OR h.diagnosis LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam, searchParam)
    }
    
    if (dateFrom) {
      query += ' AND DATE(h.created_at) >= ?'
      params.push(dateFrom)
    }
    
    if (dateTo) {
      query += ' AND DATE(h.created_at) <= ?'
      params.push(dateTo)
    }
    
    query += ' ORDER BY h.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    
    // For each herbs_routes record, calculate summary from medicines
    const enhancedResults = await Promise.all(results.map(async (hr: any) => {
      // Get medicines for this record
      const { results: medicines } = await c.env.DB.prepare(
        'SELECT * FROM medicines_tracking WHERE herbs_route_id = ?'
      ).bind(hr.id).all()
      
      // Get payment collections for this record
      const { results: collections } = await c.env.DB.prepare(
        'SELECT * FROM payment_collections WHERE herbs_route_id = ?'
      ).bind(hr.id).all()
      
      // Calculate totals
      let totalAmount = 0
      let totalAdvance = 0
      let totalCollected = 0
      let activeCourseMonths = 0
      let totalCourseMonths = 0
      let earliestGivenDate = null
      
      medicines.forEach((med: any) => {
        totalAmount += parseFloat(med.payment_amount || 0)
        totalAdvance += parseFloat(med.advance_payment || 0)
        
        // Sum treatment months from all courses (entire course)
        totalCourseMonths += parseInt(med.treatment_months || 0)
        
        // Sum treatment months from active courses only (completed months)
        if (med.is_active) {
          activeCourseMonths += parseInt(med.treatment_months || 0)
        }
        
        // Track earliest given_date
        if (med.given_date && (!earliestGivenDate || med.given_date < earliestGivenDate)) {
          earliestGivenDate = med.given_date
        }
      })
      
      collections.forEach((col: any) => {
        totalCollected += parseFloat(col.amount || 0)
      })
      
      const totalBalance = totalAmount - totalAdvance - totalCollected
      
      return {
        ...hr,
        given_date: earliestGivenDate || hr.created_at,
        total_amount: totalAmount,
        total_advance: totalAdvance,
        total_collected: totalCollected,
        total_balance: totalBalance,
        total_course_months: totalCourseMonths,
        active_course_months: activeCourseMonths
      }
    }))
    
    return c.json({ success: true, data: enhancedResults })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get herbs & routes by patient
app.get('/api/patients/:id/prescriptions', async (c) => {
  try {
    const patientId = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM herbs_routes WHERE patient_id = ? ORDER BY created_at DESC'
    ).bind(patientId).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get single herbs & routes with medicines
app.get('/api/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Get herbs & routes details
    const herbsRoute = await c.env.DB.prepare(`
      SELECT h.id, h.patient_id as patient_fk, h.appointment_id, h.diagnosis, h.notes, 
             h.next_followup_date, h.created_at, h.updated_at, h.given_date,
             h.treatment_months, h.payment_amount, h.advance_payment, h.payment_notes,
             h.due_balance, h.course, h.currency,
             p.name as patient_name, p.phone as patient_phone, p.email as patient_email, 
             p.patient_id as patient_identifier, p.id as patient_db_id,
             p.age, p.gender, p.country, p.weight, p.height,
             p.present_health_issue, p.present_medicine, p.mg_value, p.diseases,
             p.address_hno, p.address_street, p.address_apartment, p.address_area,
             p.address_district, p.address_state, p.address_pincode
      FROM herbs_routes h
      LEFT JOIN patients p ON h.patient_id = p.id
      WHERE h.id = ?
    `).bind(id).first()
    
    if (!herbsRoute) {
      return c.json({ success: false, error: 'Herbs & Routes not found' }, 404)
    }
    
    // Parse diseases JSON if present
    if (herbsRoute.diseases) {
      try {
        herbsRoute.diseases = JSON.parse(herbsRoute.diseases as string)
      } catch (e) {
        herbsRoute.diseases = []
      }
    }
    
    // Get medicines for this herbs & routes
    const { results: medicines } = await c.env.DB.prepare(
      'SELECT * FROM medicines_tracking WHERE herbs_route_id = ? ORDER BY roman_id'
    ).bind(id).all()
    
    // Get payment collections for this prescription (herbs_route)
    const { results: paymentCollections } = await c.env.DB.prepare(
      'SELECT * FROM payment_collections WHERE herbs_route_id = ? ORDER BY collection_date DESC'
    ).bind(id).all()
    
    return c.json({ 
      success: true, 
      data: { 
        ...herbsRoute, 
        medicines,
        payment_collections: paymentCollections
      } 
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create herbs & routes with medicines
app.post('/api/prescriptions', async (c) => {
  try {
    const body = await c.req.json()
    
    // Insert herbs_routes record (simplified - per-medicine data moved to medicines_tracking)
    const result = await c.env.DB.prepare(`
      INSERT INTO herbs_routes (
        patient_id, next_followup_date, diagnosis, notes, course
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      body.patient_id,
      body.follow_up_date || null,
      body.diagnosis || null,
      body.notes || null,
      body.course || null
    ).run()
    
    const herbsRouteId = result.meta.last_row_id
    
    // Insert medicines with per-medicine fields
    if (body.medicines && body.medicines.length > 0) {
      for (const med of body.medicines) {
        await c.env.DB.prepare(`
          INSERT INTO medicines_tracking (
            herbs_route_id, roman_id, medicine_name, given_date, treatment_months,
            is_active, payment_amount, advance_payment, balance_due, payment_notes,
            morning_before, morning_after, afternoon_before, afternoon_after,
            evening_before, evening_after, night_before, night_after
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          herbsRouteId,
          med.roman_id,
          med.medicine_name,
          med.given_date,
          med.treatment_months,
          med.is_active ? 1 : 0,
          med.payment_amount || 0,
          med.advance_payment || 0,
          med.balance_due || 0,
          med.payment_notes || null,
          med.morning_before ? 1 : 0,
          med.morning_after ? 1 : 0,
          med.afternoon_before ? 1 : 0,
          med.afternoon_after ? 1 : 0,
          med.evening_before ? 1 : 0,
          med.evening_after ? 1 : 0,
          med.night_before ? 1 : 0,
          med.night_after ? 1 : 0
        ).run()
      }
    }
    
    // Save payment collections
    if (body.payment_collections && body.payment_collections.length > 0) {
      for (const collection of body.payment_collections) {
        await c.env.DB.prepare(`
          INSERT INTO payment_collections (
            herbs_route_id, course_id, collection_date, amount, payment_method, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          herbsRouteId,
          collection.course_id,
          collection.collection_date,
          collection.amount,
          collection.payment_method || 'Cash',
          collection.notes || null
        ).run()
      }
    }
    
    // Create follow-up reminder (only if follow_up_date exists)
    if (body.follow_up_date) {
      await c.env.DB.prepare(`
        INSERT INTO reminders (
          patient_id, prescription_id, reminder_type, reminder_date, message, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        body.patient_id,
        herbsRouteId,
        'Follow-up',
        body.follow_up_date || null,
        'Time for your follow-up consultation',
        'pending'
      ).run()
    }
    
    return c.json({ success: true, data: { id: herbsRouteId } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update herbs & routes
app.put('/api/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    // Update herbs_routes record (simplified - per-medicine data moved to medicines_tracking)
    await c.env.DB.prepare(`
      UPDATE herbs_routes SET 
        patient_id = ?, next_followup_date = ?, diagnosis = ?, notes = ?, course = ?, currency = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.patient_id,
      body.follow_up_date || null,
      body.diagnosis || null,
      body.notes || null,
      body.course || null,
      body.currency || 'INR',
      id
    ).run()
    
    // Delete existing medicines
    await c.env.DB.prepare(
      'DELETE FROM medicines_tracking WHERE herbs_route_id = ?'
    ).bind(id).run()
    
    // Insert updated medicines with per-medicine fields
    if (body.medicines && body.medicines.length > 0) {
      for (const med of body.medicines) {
        await c.env.DB.prepare(`
          INSERT INTO medicines_tracking (
            herbs_route_id, roman_id, medicine_name, given_date, treatment_months,
            is_active, payment_amount, advance_payment, balance_due, payment_notes,
            morning_before, morning_after, afternoon_before, afternoon_after,
            evening_before, evening_after, night_before, night_after
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          med.roman_id,
          med.medicine_name,
          med.given_date,
          med.treatment_months,
          med.is_active ? 1 : 0,
          med.payment_amount || 0,
          med.advance_payment || 0,
          med.balance_due || 0,
          med.payment_notes || null,
          med.morning_before ? 1 : 0,
          med.morning_after ? 1 : 0,
          med.afternoon_before ? 1 : 0,
          med.afternoon_after ? 1 : 0,
          med.evening_before ? 1 : 0,
          med.evening_after ? 1 : 0,
          med.night_before ? 1 : 0,
          med.night_after ? 1 : 0
        ).run()
      }
    }
    
    // Delete existing payment collections
    await c.env.DB.prepare(
      'DELETE FROM payment_collections WHERE herbs_route_id = ?'
    ).bind(id).run()
    
    // Insert updated payment collections
    if (body.payment_collections && body.payment_collections.length > 0) {
      for (const collection of body.payment_collections) {
        await c.env.DB.prepare(`
          INSERT INTO payment_collections (
            herbs_route_id, course_id, collection_date, amount, payment_method, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          collection.course_id,
          collection.collection_date,
          collection.amount,
          collection.payment_method || 'Cash',
          collection.notes || null
        ).run()
      }
    }
    
    // Update or create follow-up reminder
    if (body.follow_up_date) {
      // Delete existing reminders for this prescription
      await c.env.DB.prepare(
        'DELETE FROM reminders WHERE prescription_id = ?'
      ).bind(id).run()
      
      // Create new reminder
      await c.env.DB.prepare(`
        INSERT INTO reminders (
          patient_id, prescription_id, reminder_type, reminder_date, message, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        body.patient_id,
        id,
        'Follow-up',
        body.follow_up_date,
        'Time for your follow-up consultation',
        'pending'
      ).run()
    } else {
      // If no follow_up_date, delete any existing reminders
      await c.env.DB.prepare(
        'DELETE FROM reminders WHERE prescription_id = ?'
      ).bind(id).run()
    }
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete herbs & routes
app.delete('/api/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM herbs_routes WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== PAYMENT COLLECTION APIs ====================

// Get payment collections for a medicine/course
app.get('/api/medicines/:medicineId/payments', async (c) => {
  try {
    const medicineId = c.req.param('medicineId')
    const { results: payments } = await c.env.DB.prepare(
      'SELECT * FROM payment_collections WHERE medicine_id = ? ORDER BY collection_date DESC'
    ).bind(medicineId).all()
    
    return c.json({ success: true, data: payments })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Add a payment collection
app.post('/api/medicines/:medicineId/payments', async (c) => {
  try {
    const medicineId = c.req.param('medicineId')
    const body = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO payment_collections (medicine_id, collection_date, amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      medicineId,
      body.collection_date,
      body.amount,
      body.payment_method || 'Cash',
      body.notes || ''
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete a payment collection
app.delete('/api/payments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM payment_collections WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== NOTIFICATION APIs ====================

// Send WhatsApp message
app.post('/api/send-whatsapp', async (c) => {
  try {
    const { to, message, reminderId } = await c.req.json()
    
    // Get WhatsApp settings
    const phoneIdSetting = await c.env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'whatsapp_phone_id'"
    ).first()
    
    const tokenSetting = await c.env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'whatsapp_token'"
    ).first()
    
    if (!phoneIdSetting || !tokenSetting) {
      return c.json({ 
        success: false, 
        error: 'WhatsApp not configured. Please add Phone ID and Access Token in Settings.' 
      }, 400)
    }
    
    const phoneNumberId = (phoneIdSetting as any).value
    const accessToken = (tokenSetting as any).value
    
    // Send via WhatsApp Business API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''), // Remove non-digits
          type: 'text',
          text: { body: message }
        })
      }
    )
    
    const result = await whatsappResponse.json()
    
    if (!whatsappResponse.ok) {
      return c.json({ 
        success: false, 
        error: result.error?.message || 'Failed to send WhatsApp message',
        details: result
      }, 500)
    }
    
    // Update reminder status if provided
    if (reminderId) {
      await c.env.DB.prepare(
        "UPDATE reminders SET status = 'Sent' WHERE id = ?"
      ).bind(reminderId).run()
    }
    
    return c.json({ 
      success: true, 
      message: 'WhatsApp message sent successfully',
      messageId: result.messages?.[0]?.id
    })
  } catch (error: any) {
    console.error('WhatsApp send error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Send SMS
app.post('/api/send-sms', async (c) => {
  try {
    const { to, message, reminderId } = await c.req.json()
    
    // Get SMS settings
    const providerSetting = await c.env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'sms_provider'"
    ).first()
    
    const apiKeySetting = await c.env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'sms_api_key'"
    ).first()
    
    const authTokenSetting = await c.env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'sms_auth_token'"
    ).first()
    
    const senderIdSetting = await c.env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'sms_sender_id'"
    ).first()
    
    if (!providerSetting || !apiKeySetting) {
      return c.json({ 
        success: false, 
        error: 'SMS not configured. Please add SMS provider and API key in Settings.' 
      }, 400)
    }
    
    const provider = (providerSetting as any).value
    const apiKey = (apiKeySetting as any).value
    const authToken = (authTokenSetting as any)?.value || ''
    const senderId = (senderIdSetting as any)?.value || 'TPSDHAN'
    
    let smsResponse: any
    
    // Send based on provider
    if (provider === 'twilio') {
      // Twilio SMS
      const accountSid = apiKey
      const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
      
      smsResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: to,
            From: senderId,
            Body: message
          })
        }
      )
    } else if (provider === 'msg91') {
      // MSG91 SMS
      smsResponse = await fetch(
        'https://api.msg91.com/api/v5/flow/',
        {
          method: 'POST',
          headers: {
            'authkey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: senderId,
            route: '4',
            country: '91',
            sms: [{
              message: message,
              to: [to.replace(/\D/g, '')]
            }]
          })
        }
      )
    } else if (provider === 'textlocal') {
      // TextLocal SMS
      smsResponse = await fetch(
        'https://api.textlocal.in/send/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            apikey: apiKey,
            numbers: to.replace(/\D/g, ''),
            sender: senderId,
            message: message
          })
        }
      )
    } else {
      return c.json({ 
        success: false, 
        error: 'Unsupported SMS provider' 
      }, 400)
    }
    
    const result = await smsResponse.json()
    
    if (!smsResponse.ok) {
      return c.json({ 
        success: false, 
        error: 'Failed to send SMS',
        details: result
      }, 500)
    }
    
    // Update reminder status if provided
    if (reminderId) {
      await c.env.DB.prepare(
        "UPDATE reminders SET status = 'Sent' WHERE id = ?"
      ).bind(reminderId).run()
    }
    
    return c.json({ 
      success: true, 
      message: 'SMS sent successfully',
      details: result
    })
  } catch (error: any) {
    console.error('SMS send error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== REMINDERS API ====================

// Get all reminders with search and filter
app.get('/api/reminders', async (c) => {
  try {
    const search = c.req.query('search') || ''
    const status = c.req.query('status') || ''
    const type = c.req.query('type') || ''
    
    let query = `
      SELECT r.*, p.name as patient_name, p.phone as patient_phone, p.patient_id
      FROM reminders r
      LEFT JOIN patients p ON r.patient_id = p.id
      INNER JOIN herbs_routes h ON r.prescription_id = h.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.phone LIKE ? OR p.patient_id LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam)
    }
    
    if (status) {
      query += ' AND r.status = ?'
      params.push(status)
    }
    
    if (type) {
      query += ' AND r.reminder_type = ?'
      params.push(type)
    }
    
    query += ' ORDER BY r.reminder_date ASC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get pending reminders
app.get('/api/reminders/pending', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT r.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email
      FROM reminders r
      LEFT JOIN patients p ON r.patient_id = p.id
      INNER JOIN herbs_routes h ON r.prescription_id = h.id
      WHERE r.status = 'pending' AND r.reminder_date <= datetime('now', '+3 days')
      ORDER BY r.reminder_date ASC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create reminder
app.post('/api/reminders', async (c) => {
  try {
    const body = await c.req.json()
    const { patient_id, prescription_id, reminder_type, reminder_date, message, send_whatsapp, send_sms } = body
    
    const result = await c.env.DB.prepare(
      'INSERT INTO reminders (patient_id, prescription_id, reminder_type, reminder_date, message, send_whatsapp, send_sms) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(patient_id, prescription_id, reminder_type, reminder_date, message, send_whatsapp ? 1 : 0, send_sms ? 1 : 0).run()
    
    return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Mark reminder as sent
app.put('/api/reminders/:id/sent', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare(
      'UPDATE reminders SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('sent', id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete reminder
app.delete('/api/reminders/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM reminders WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== SETTINGS API ====================

// Get all settings
app.get('/api/settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM settings'
    ).all()
    
    const settings: Record<string, any> = {}
    for (const setting of results) {
      settings[(setting as any).key] = (setting as any).value
    }
    
    return c.json({ success: true, data: settings })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update setting
app.put('/api/settings/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const body = await c.req.json()
    const { value } = body
    
    await c.env.DB.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP'
    ).bind(key, value, value).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== DASHBOARD STATS API ====================

app.get('/api/stats', async (c) => {
  try {
    // Get total patients
    const patientsCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM patients'
    ).first()
    
    // Get today's appointments
    const todayAppointments = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = DATE('now')"
    ).first()
    
    // Get pending reminders (only for existing herbs_routes records)
    const pendingReminders = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reminders r 
       INNER JOIN herbs_routes h ON r.prescription_id = h.id 
       WHERE r.status = 'pending' AND r.reminder_date <= datetime('now', '+3 days')`
    ).first()
    
    return c.json({ 
      success: true, 
      data: {
        totalPatients: (patientsCount as any)?.count || 0,
        todayAppointments: (todayAppointments as any)?.count || 0,
        pendingReminders: (pendingReminders as any)?.count || 0
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== HOME PAGE ====================

app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - TPS DHANVANTRI AYURVEDA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://accounts.google.com/gsi/client" async defer></script>
    </head>
    <body class="bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div class="text-center mb-8">
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-leaf text-4xl"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">TPS DHANVANTRI</h1>
                <p class="text-gray-600">Ayurveda Clinic Management</p>
            </div>

            <div id="login-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" id="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="tpsdhanvantari@gmail.com" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter your password" required>
                </div>

                <button onclick="loginWithPassword()" class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition duration-200 flex items-center justify-center">
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                </button>
            </div>

            <div id="error-message" class="hidden mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"></div>
            <div id="success-message" class="hidden mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm"></div>

            <p class="text-center text-xs text-gray-500 mt-6">
                <i class="fas fa-lock mr-1"></i>
                Secure authentication powered by session management
            </p>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_BASE = '/api';

            async function loginWithPassword() {
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;

                if (!email || !password) {
                    showError('Please enter both email and password');
                    return;
                }

                if (!email.includes('@')) {
                    showError('Please enter a valid email address');
                    return;
                }

                try {
                    const res = await axios.post(\`\${API_BASE}/auth/login\`, {
                        email: email,
                        password: password
                    });

                    if (res.data.success) {
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    } else {
                        showError(res.data.error || 'Invalid credentials');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    showError(error.response?.data?.error || 'Invalid email or password');
                }
            }
            
            // Enter key support
            document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('password').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        loginWithPassword();
                    }
                });
            });

            async function handleGoogleLogin(response) {
                try {
                    // Decode Google JWT token
                    const payload = JSON.parse(atob(response.credential.split('.')[1]));
                    
                    const res = await axios.post(\`\${API_BASE}/auth/login\`, {
                        email: payload.email,
                        name: payload.name,
                        google_id: payload.sub,
                        profile_picture: payload.picture
                    });

                    if (res.data.success) {
                        showSuccess('Google login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    } else {
                        showError(res.data.error || 'Login failed');
                    }
                } catch (error) {
                    console.error('Google login error:', error);
                    showError('Google login failed. Please try again.');
                }
            }

            function showError(message) {
                const errorDiv = document.getElementById('error-message');
                errorDiv.textContent = message;
                errorDiv.classList.remove('hidden');
                document.getElementById('success-message').classList.add('hidden');
            }

            function showSuccess(message) {
                const successDiv = document.getElementById('success-message');
                successDiv.textContent = message;
                successDiv.classList.remove('hidden');
                document.getElementById('error-message').classList.add('hidden');
            }

            // Allow Enter key to submit
            document.getElementById('email').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loginWithEmail();
            });
            document.getElementById('name').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loginWithEmail();
            });
        </script>
    </body>
    </html>
  `)
})

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TPS DHANVANTRI AYURVEDA - Management System</title>
        <meta name="description" content="Professional Ayurveda clinic management system">
        <meta name="theme-color" content="#059669">
        <link rel="manifest" href="/static/manifest.json">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  ayurveda: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                  }
                }
              }
            }
          }
        </script>
        <style>
          @media print {
            /* Hide everything except print content */
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            
            /* Position print content at top - use absolute for multi-page */
            .print-content {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            
            /* Remove all spacing from modal in print */
            #prescription-summary-modal {
              position: static !important;
              padding: 0 !important;
              margin: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }
            
            #prescription-summary-modal > div {
              padding: 0 !important;
              margin: 0 !important;
              max-height: none !important;
              overflow: visible !important;
              height: auto !important;
            }
            
            /* Remove spacing from first elements */
            .print-content > div:first-child {
              margin-top: 0 !important;
              padding-top: 0 !important;
            }
            
            /* Hide non-print elements */
            .no-print {
              display: none !important;
            }
            
            /* Allow page breaks */
            .print-content {
              page-break-inside: auto;
            }
            
            /* Avoid breaks inside course sections */
            .medicine-row, .border-2 {
              page-break-inside: avoid;
            }
            
            /* Page settings */
            @page {
              margin: 0.8cm;
              size: A4;
            }
            
            /* Ensure body starts at top */
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            
            html, body {
              height: auto !important;
              overflow: visible !important;
            }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-gradient-to-r from-ayurveda-700 to-ayurveda-600 text-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="/static/ayurveda-logo.png" alt="TPS Dhanvantri Ayurveda" class="h-10 w-10 object-contain">
                        <span class="text-xl font-bold">TPS DHANVANTRI AYURVEDA</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="showSection('dashboard')" class="nav-btn hover:bg-ayurveda-800 px-3 py-2 rounded transition">
                            <i class="fas fa-home mr-2"></i>Dashboard
                        </button>
                        <button onclick="showSection('patients')" class="nav-btn hover:bg-ayurveda-800 px-3 py-2 rounded transition">
                            <i class="fas fa-users mr-2"></i>Patients
                        </button>
                        <button onclick="showSection('appointments')" class="nav-btn hover:bg-ayurveda-800 px-3 py-2 rounded transition">
                            <i class="fas fa-calendar-alt mr-2"></i>Appointments
                        </button>
                        <button onclick="showSection('prescriptions')" class="nav-btn hover:bg-ayurveda-800 px-3 py-2 rounded transition">
                            <i class="fas fa-leaf mr-2"></i>Herbs & Routes
                        </button>
                        <button onclick="showSection('reminders')" class="nav-btn hover:bg-ayurveda-800 px-3 py-2 rounded transition">
                            <i class="fas fa-bell mr-2"></i>Reminders
                        </button>
                        <button onclick="showSection('settings')" class="nav-btn hover:bg-ayurveda-800 px-3 py-2 rounded transition">
                            <i class="fas fa-cog mr-2"></i>Settings
                        </button>
                        <div class="border-l border-ayurveda-500 pl-4 ml-2">
                            <div class="flex items-center space-x-3">
                                <div class="text-right">
                                    <p class="text-sm font-semibold" id="user-name">Loading...</p>
                                    <p class="text-xs opacity-75" id="user-email"></p>
                                </div>
                                <img id="user-avatar" src="" alt="User" class="w-10 h-10 rounded-full border-2 border-white hidden">
                                <div id="user-avatar-placeholder" class="w-10 h-10 rounded-full bg-ayurveda-500 flex items-center justify-center font-bold text-lg">
                                    <i class="fas fa-user"></i>
                                </div>
                                <button onclick="logout()" class="hover:bg-ayurveda-800 px-3 py-2 rounded transition" title="Logout">
                                    <i class="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-6">
            <!-- Dashboard Section -->
            <div id="dashboard-section" class="section">
                <h2 class="text-3xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-chart-line mr-3 text-ayurveda-600"></i>Dashboard
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Patients</p>
                                <p id="stat-patients" class="text-3xl font-bold text-gray-800">0</p>
                            </div>
                            <i class="fas fa-users text-4xl text-blue-500"></i>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Today's Appointments</p>
                                <p id="stat-appointments" class="text-3xl font-bold text-gray-800">0</p>
                            </div>
                            <i class="fas fa-calendar-check text-4xl text-green-500"></i>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Pending Reminders</p>
                                <p id="stat-reminders" class="text-3xl font-bold text-gray-800">0</p>
                            </div>
                            <i class="fas fa-bell text-4xl text-yellow-500"></i>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Recent Appointments</h3>
                        <div id="recent-appointments" class="space-y-3">
                            <p class="text-gray-500">Loading...</p>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Upcoming Reminders</h3>
                        <div id="upcoming-reminders" class="space-y-3">
                            <p class="text-gray-500">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PATIENTS SECTION -->
            <div id="patients-section" class="section hidden">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Patients</h2>
                    <button onclick="showPatientModal()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add Patient
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input type="text" id="patient-search" placeholder="Search by name, phone, ID..." class="border rounded px-3 py-2" onkeyup="loadPatients()">
                        <select id="patient-filter-country" class="border rounded px-3 py-2" onchange="loadPatients()">
                            <option value="">All Countries</option>
                            <!-- Options loaded dynamically from /api/patients/countries -->
                        </select>
                        <button onclick="exportPatients('csv')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-file-csv mr-2"></i>CSV
                        </button>
                        <button onclick="exportPatients('excel')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-file-excel mr-2"></i>Excel
                        </button>
                        <button onclick="exportPatients('pdf')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-file-pdf mr-2"></i>PDF
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-6 py-3 text-left">Patient ID</th>
                                    <th class="px-6 py-3 text-left">Name</th>
                                    <th class="px-6 py-3 text-left">Age/Gender</th>
                                    <th class="px-6 py-3 text-left">Phone</th>
                                    <th class="px-6 py-3 text-left">Country</th>
                                    <th class="px-6 py-3 text-left">Added</th>
                                    <th class="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="patients-table-body">
                                <tr><td colspan="7" class="text-center py-4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- APPOINTMENTS SECTION -->
            <div id="appointments-section" class="section hidden">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Appointments</h2>
                    <button onclick="showAppointmentModal()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add Appointment
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" id="appointment-search" placeholder="Search by patient name or phone..." class="border rounded px-3 py-2" onkeyup="loadAppointments()">
                        <select id="appointment-filter-status" class="border rounded px-3 py-2" onchange="loadAppointments()">
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-6 py-3 text-left">Date & Time</th>
                                    <th class="px-6 py-3 text-left">Patient</th>
                                    <th class="px-6 py-3 text-left">Phone</th>
                                    <th class="px-6 py-3 text-left">Reason</th>
                                    <th class="px-6 py-3 text-left">Status</th>
                                    <th class="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="appointments-table-body">
                                <tr><td colspan="6" class="text-center py-4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- HERBS & ROUTES (PRESCRIPTIONS) SECTION -->
            <div id="prescriptions-section" class="section hidden">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800"><i class="fas fa-leaf mr-2 text-ayurveda-600"></i>Herbs & Routes</h2>
                    <button onclick="showHerbsRoutesModal()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>New Record
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="mb-4 flex gap-2 items-center">
                        <input type="text" id="prescription-search" placeholder="Search by patient ID, name, or problem..." class="border rounded px-3 py-2 flex-1" onkeyup="loadHerbsRoutes()">
                        <button onclick="exportToExcel()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            <i class="fas fa-file-excel mr-2"></i>Export Excel
                        </button>
                        <button onclick="exportToPDF()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                            <i class="fas fa-file-pdf mr-2"></i>Export PDF
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-6 py-3 text-left">Given Date</th>
                                    <th class="px-6 py-3 text-left">Patient ID</th>
                                    <th class="px-6 py-3 text-left">Patient</th>
                                    <th class="px-6 py-3 text-left">Problem</th>
                                    <th class="px-6 py-3 text-left">Entire Course</th>
                                    <th class="px-6 py-3 text-left">Amount (Total/Due)</th>
                                    <th class="px-6 py-3 text-left">Completed Months</th>
                                    <th class="px-6 py-3 text-left">Next Follow-up</th>
                                    <th class="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="prescriptions-table-body">
                                <tr><td colspan="8" class="text-center py-4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- REMINDERS SECTION -->
            <div id="reminders-section" class="section hidden">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Reminders</h2>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" id="reminder-search" placeholder="Search by patient name..." class="border rounded px-3 py-2" onkeyup="loadReminders()">
                        <select id="reminder-filter-status" class="border rounded px-3 py-2" onchange="loadReminders()">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="sent">Sent</option>
                        </select>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-6 py-3 text-left">Date</th>
                                    <th class="px-6 py-3 text-left">Patient</th>
                                    <th class="px-6 py-3 text-left">Phone</th>
                                    <th class="px-6 py-3 text-left">Type</th>
                                    <th class="px-6 py-3 text-left">Message</th>
                                    <th class="px-6 py-3 text-left">Status</th>
                                    <th class="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="reminders-table-body">
                                <tr><td colspan="7" class="text-center py-4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- SETTINGS SECTION -->
            <div id="settings-section" class="section hidden">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
                
                <div class="space-y-6">
                    <!-- Admin Profile Management -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-ayurveda-700">
                            <i class="fas fa-user-shield mr-2"></i>Admin Profile
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Name</label>
                                <input type="text" id="profile-name" class="border rounded px-3 py-2 w-full" placeholder="Your name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Email (Cannot be changed)</label>
                                <input type="email" id="profile-email" class="border rounded px-3 py-2 w-full bg-gray-100" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Profile Picture</label>
                                <div class="flex items-start gap-4">
                                    <!-- Current/Preview Image -->
                                    <div class="flex-shrink-0">
                                        <div id="profile-picture-preview" class="w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                                            <i class="fas fa-user text-4xl text-gray-400"></i>
                                        </div>
                                    </div>
                                    
                                    <!-- Upload Controls -->
                                    <div class="flex-1 space-y-2">
                                        <input type="file" id="profile-picture-upload" accept="image/*" class="hidden" onchange="handleProfilePictureUpload(event)">
                                        <button type="button" onclick="document.getElementById('profile-picture-upload').click()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm">
                                            <i class="fas fa-upload mr-2"></i>Upload Photo
                                        </button>
                                        <button type="button" onclick="removeProfilePicture()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm ml-2">
                                            <i class="fas fa-trash mr-2"></i>Remove
                                        </button>
                                        <p class="text-xs text-gray-500 mt-1">Recommended: Square image, at least 200x200px</p>
                                        <p class="text-xs text-gray-500">Supported: JPG, PNG, GIF (Max 2MB)</p>
                                    </div>
                                </div>
                                <input type="hidden" id="profile-picture" value="">
                            </div>
                            <button onclick="updateProfile()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                <i class="fas fa-save mr-2"></i>Update Profile
                            </button>
                        </div>
                    </div>

                    <!-- Change Password -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-red-700">
                            <i class="fas fa-key mr-2"></i>Change Password
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Current Password</label>
                                <input type="password" id="current-password" class="border rounded px-3 py-2 w-full" placeholder="Enter current password">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">New Password</label>
                                <input type="password" id="new-password" class="border rounded px-3 py-2 w-full" placeholder="Enter new password">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Confirm New Password</label>
                                <input type="password" id="confirm-password" class="border rounded px-3 py-2 w-full" placeholder="Re-enter new password">
                            </div>
                            <button onclick="changePassword()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                                <i class="fas fa-lock mr-2"></i>Change Password
                            </button>
                        </div>
                    </div>
                    
                    <!-- Clinic Information -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-ayurveda-700">Clinic Information</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Clinic Name</label>
                                <input type="text" id="setting-clinic_name" class="border rounded px-3 py-2 w-full" value="TPS DHANVANTRI AYURVEDA">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Phone</label>
                                <input type="text" id="setting-clinic_phone" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Email</label>
                                <input type="text" id="setting-clinic_email" class="border rounded px-3 py-2 w-full">
                            </div>
                        </div>
                    </div>
                    
                    <!-- WhatsApp Business API Settings -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-green-700">
                            <i class="fab fa-whatsapp mr-2"></i>WhatsApp Business API
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-center mb-4">
                                <input type="checkbox" id="setting-whatsapp_enabled" class="mr-2 w-5 h-5">
                                <label for="setting-whatsapp_enabled" class="font-medium">Enable WhatsApp Notifications</label>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">WhatsApp Business Phone Number ID</label>
                                <input type="text" id="setting-whatsapp_phone_id" class="border rounded px-3 py-2 w-full" placeholder="Enter your WhatsApp Business Phone Number ID">
                                <p class="text-xs text-gray-500 mt-1">From WhatsApp Business API Dashboard</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">WhatsApp Business Access Token</label>
                                <input type="password" id="setting-whatsapp_token" class="border rounded px-3 py-2 w-full" placeholder="Enter your access token">
                                <p class="text-xs text-gray-500 mt-1">Get from Meta Business Manager</p>
                            </div>
                            <div class="bg-blue-50 border border-blue-200 rounded p-4">
                                <p class="text-sm text-blue-800">
                                    <strong>How to get WhatsApp Business API:</strong><br>
                                    1. Go to <a href="https://business.facebook.com" target="_blank" class="underline">Meta Business Manager</a><br>
                                    2. Create a WhatsApp Business account<br>
                                    3. Get your Phone Number ID and Access Token<br>
                                    4. Enter them here to enable automatic WhatsApp reminders
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SMS Gateway Settings -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-xl font-bold mb-4 text-blue-700">
                            <i class="fas fa-sms mr-2"></i>SMS Gateway
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-center mb-4">
                                <input type="checkbox" id="setting-sms_enabled" class="mr-2 w-5 h-5">
                                <label for="setting-sms_enabled" class="font-medium">Enable SMS Notifications</label>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">SMS Provider</label>
                                <select id="setting-sms_provider" class="border rounded px-3 py-2 w-full">
                                    <option value="twilio">Twilio</option>
                                    <option value="msg91">MSG91</option>
                                    <option value="textlocal">TextLocal</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">API Key / Account SID</label>
                                <input type="password" id="setting-sms_api_key" class="border rounded px-3 py-2 w-full" placeholder="Enter your SMS API key">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Auth Token / Password</label>
                                <input type="password" id="setting-sms_auth_token" class="border rounded px-3 py-2 w-full" placeholder="Enter your auth token">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Sender ID / From Number</label>
                                <input type="text" id="setting-sms_sender_id" class="border rounded px-3 py-2 w-full" placeholder="e.g., TPSDHAN or +1234567890">
                                <p class="text-xs text-gray-500 mt-1">Your registered sender ID or phone number</p>
                            </div>
                            <div class="bg-blue-50 border border-blue-200 rounded p-4">
                                <p class="text-sm text-blue-800">
                                    <strong>Popular SMS Providers:</strong><br>
                                    • <strong>Twilio</strong>: Global, reliable (~$0.01/SMS)<br>
                                    • <strong>MSG91</strong>: India-focused (~₹0.20/SMS)<br>
                                    • <strong>TextLocal</strong>: India, UK (~₹0.15/SMS)<br>
                                    Sign up with any provider and enter credentials here.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Save Button -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <button onclick="saveSettings()" class="bg-ayurveda-600 hover:bg-ayurveda-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                            <i class="fas fa-save mr-2"></i>Save All Settings
                        </button>
                        <p class="text-sm text-gray-600 mt-2">Settings are saved securely and used for automatic notifications.</p>
                    </div>
                </div>
            </div>

            <!-- PATIENT MODAL -->
            <div id="patient-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h3 id="patient-modal-title" class="text-2xl font-bold">Add Patient</h3>
                        <button onclick="closePatientModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <form id="patient-form" onsubmit="event.preventDefault(); savePatient();">
                        <input type="hidden" id="patient-id">
                        
                        <h4 class="font-bold text-lg mb-3 text-ayurveda-700">Basic Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium mb-1">Name *</label>
                                <input type="text" id="patient-name" class="border rounded px-3 py-2 w-full" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Age</label>
                                <input type="number" id="patient-age" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Gender</label>
                                <select id="patient-gender" class="border rounded px-3 py-2 w-full">
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Weight (kg)</label>
                                <input type="number" step="0.1" id="patient-weight" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Height (cm)</label>
                                <input type="number" step="0.1" id="patient-height" class="border rounded px-3 py-2 w-full">
                            </div>
                        </div>
                        
                        <h4 class="font-bold text-lg mb-3 text-ayurveda-700">Contact Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium mb-1">Country *</label>
                                <div class="relative">
                                    <input 
                                        type="text" 
                                        id="patient-country-search" 
                                        class="border rounded px-3 py-2 w-full" 
                                        placeholder="Search country..."
                                        autocomplete="off"
                                        onkeyup="filterCountries()"
                                        onfocus="showCountryDropdown()"
                                    >
                                    <input type="hidden" id="patient-country" value="India">
                                    <input type="hidden" id="patient-country-code" value="+91">
                                    <input type="hidden" id="patient-country-iso3" value="IND">
                                    <div id="country-dropdown" class="hidden absolute z-10 bg-white border rounded-md shadow-lg mt-1 w-full max-h-60 overflow-y-auto">
                                        <!-- Countries populated by JavaScript -->
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Primary Phone Number *</label>
                                <div class="flex items-center gap-2">
                                    <span id="phone-country-code-display" class="px-3 py-2 bg-gray-100 border rounded font-mono text-sm">+91</span>
                                    <input type="text" id="patient-phone" class="border rounded px-3 py-2 w-full flex-1" placeholder="Enter phone number" required>
                                </div>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium mb-1">Additional Phone Numbers</label>
                                <div id="additional-phones-container" class="space-y-2">
                                    <!-- Dynamic phone fields added here -->
                                </div>
                                <button type="button" onclick="addPhoneField()" class="mt-2 text-sm text-ayurveda-600 hover:text-ayurveda-700 font-medium">
                                    <i class="fas fa-plus-circle mr-1"></i> Add Phone Number
                                </button>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Email</label>
                                <input type="email" id="patient-email" class="border rounded px-3 py-2 w-full">
                            </div>
                        </div>
                        
                        <h4 class="font-bold text-lg mb-3 text-ayurveda-700">Detailed Address</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium mb-1">H.No / Door No</label>
                                <input type="text" id="patient-address-hno" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Street</label>
                                <input type="text" id="patient-address-street" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Apartment/Building</label>
                                <input type="text" id="patient-address-apartment" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Area/Locality</label>
                                <input type="text" id="patient-address-area" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">District</label>
                                <input type="text" id="patient-address-district" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">State/Province</label>
                                <input type="text" id="patient-address-state" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Pin Code / Zip</label>
                                <input type="text" id="patient-address-pincode" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium mb-1">Complete Address</label>
                                <textarea id="patient-address" class="border rounded px-3 py-2 w-full" rows="2" placeholder="Full address for reference"></textarea>
                            </div>
                        </div>
                        
                        <h4 class="font-bold text-lg mb-3 text-ayurveda-700">Referred By</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium mb-1">Name</label>
                                <input type="text" id="patient-referred-by" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Phone</label>
                                <input type="text" id="patient-referred-by-phone" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Address</label>
                                <input type="text" id="patient-referred-by-address" class="border rounded px-3 py-2 w-full">
                            </div>
                        </div>
                        
                        <h4 class="font-bold text-lg mb-3 text-ayurveda-700">Medical Information</h4>
                        <div class="mb-4">
                            <label class="block text-sm font-medium mb-2">
                                Diseases <span class="text-xs text-gray-500">(Click "Add Disease" to add multiple diseases)</span>
                            </label>
                            <div id="diseases-container" class="space-y-3 mb-3">
                                <!-- Disease rows will be added here dynamically -->
                            </div>
                            <button type="button" onclick="addDiseaseRow()" class="text-ayurveda-600 hover:text-ayurveda-700 text-sm font-medium">
                                <i class="fas fa-plus mr-1"></i>Add Disease
                            </button>
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-1">Medical History</label>
                            <textarea id="patient-medical-history" class="border rounded px-3 py-2 w-full" rows="3" placeholder="Previous medical conditions, allergies, surgeries, etc."></textarea>
                        </div>
                        
                        <div class="mt-6 flex justify-end space-x-3">
                            <button type="button" onclick="closePatientModal()" class="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
                            <button type="submit" class="px-6 py-2 bg-ayurveda-600 hover:bg-ayurveda-700 text-white rounded-lg">
                                <i class="fas fa-save mr-2"></i>Save Patient
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- APPOINTMENT MODAL -->
            <div id="appointment-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
                    <div class="flex justify-between items-center mb-6">
                        <h3 id="appointment-modal-title" class="text-2xl font-bold">Add Appointment</h3>
                        <button onclick="closeAppointmentModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <form id="appointment-form" onsubmit="event.preventDefault(); saveAppointment();">
                        <input type="hidden" id="appointment-id">
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Patient *</label>
                                <select id="appointment-patient" class="border rounded px-3 py-2 w-full" required>
                                    <option value="">Select Patient</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Date & Time *</label>
                                <input type="datetime-local" id="appointment-date" class="border rounded px-3 py-2 w-full" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Reason</label>
                                <textarea id="appointment-reason" class="border rounded px-3 py-2 w-full" rows="3"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Status</label>
                                <select id="appointment-status" class="border rounded px-3 py-2 w-full">
                                    <option value="scheduled">Scheduled</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex justify-end space-x-3">
                            <button type="button" onclick="closeAppointmentModal()" class="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
                            <button type="submit" class="px-6 py-2 bg-ayurveda-600 hover:bg-ayurveda-700 text-white rounded-lg">Save</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- HERBS & ROUTES MODAL -->
            <div id="prescription-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto mx-4">
                    <div class="flex justify-between items-center mb-6">
                        <h3 id="prescription-modal-title" class="text-2xl font-bold"><i class="fas fa-leaf mr-2 text-ayurveda-600"></i>New Herbs & Routes Record</h3>
                        <button onclick="closeHerbsRoutesModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <form id="prescription-form" onsubmit="event.preventDefault(); saveHerbsRoutes();">
                        <input type="hidden" id="prescription-id">
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-1">Patient *</label>
                            <select id="prescription-patient" class="border rounded px-3 py-2 w-full" required onchange="displayPatientInfo()">
                                <option value="">Select Patient</option>
                            </select>
                        </div>
                        
                        <!-- Patient Information Display -->
                        <div id="patient-info-display" class="hidden mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 class="font-bold text-lg mb-3 text-blue-800"><i class="fas fa-user-circle mr-2"></i>Patient Information</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span class="font-semibold">Patient ID:</span>
                                    <span id="display-patient-id" class="ml-2"></span>
                                </div>
                                <div>
                                    <span class="font-semibold">Age/Gender:</span>
                                    <span id="display-patient-age-gender" class="ml-2"></span>
                                </div>
                                <div>
                                    <span class="font-semibold">Country:</span>
                                    <span id="display-patient-country" class="ml-2"></span>
                                </div>
                                <div>
                                    <span class="font-semibold">Phone:</span>
                                    <span id="display-patient-phone" class="ml-2"></span>
                                </div>
                                <div>
                                    <span class="font-semibold">Email:</span>
                                    <span id="display-patient-email" class="ml-2"></span>
                                </div>
                                <div>
                                    <span class="font-semibold">Weight/Height:</span>
                                    <span id="display-patient-weight-height" class="ml-2"></span>
                                </div>
                                <div class="md:col-span-3">
                                    <span class="font-semibold">Address:</span>
                                    <span id="display-patient-address" class="ml-2"></span>
                                </div>
                                <div class="md:col-span-3">
                                    <span class="font-semibold">Present Health Issue:</span>
                                    <span id="display-patient-health-issue" class="ml-2 text-red-600"></span>
                                </div>
                                <div class="md:col-span-3">
                                    <span class="font-semibold">Medical History:</span>
                                    <span id="display-patient-medical-history" class="ml-2"></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium mb-1">Currency *</label>
                                <select id="prescription-currency" class="border rounded px-3 py-2 w-full" onchange="updateAllCurrencyDisplays()">
                                    <option value="INR">₹ Indian Rupee (INR)</option>
                                    <option value="USD">$ US Dollar (USD)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Entire Course (1-16)</label>
                                <select id="prescription-course" class="border rounded px-3 py-2 w-full">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                    <option value="13">13</option>
                                    <option value="14">14</option>
                                    <option value="15">15</option>
                                    <option value="16">16</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Next Follow-up Date</label>
                                <input type="date" id="prescription-followup" class="border rounded px-3 py-2 w-full bg-gray-100" readonly>
                                <p class="text-xs text-gray-500 mt-1">Auto-calculated from active medicines</p>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-1">Problem/Diagnosis</label>
                            <textarea id="prescription-problem" class="border rounded px-3 py-2 w-full" rows="2" placeholder="Enter diagnosis or problem details"></textarea>
                        </div>
                        
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-bold text-lg">Medicines</h4>
                                <button type="button" onclick="addMedicineRow()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-plus mr-2"></i>Add Course
                                </button>
                            </div>
                            <div id="medicines-list"></div>
                        </div>
                        
                        <div class="border-t pt-6 mb-6">
                            <h4 class="font-bold text-lg mb-4 text-ayurveda-700">Overall Payment Summary</h4>
                            <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div class="text-center">
                                        <p class="text-sm text-gray-600 mb-1">Total Amount</p>
                                        <p class="text-3xl font-bold text-blue-600" id="overall-total-amount">₹0.00</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-sm text-gray-600 mb-1">Total Advance Paid</p>
                                        <p class="text-3xl font-bold text-green-600" id="overall-advance-paid">₹0.00</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-sm text-gray-600 mb-1">Total Balance Due</p>
                                        <p class="text-3xl font-bold text-red-600" id="overall-balance-due">₹0.00</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-sm text-gray-600 mb-1">Active Courses</p>
                                        <p class="text-3xl font-bold text-purple-600" id="overall-active-count">0</p>
                                    </div>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-3 text-center"><i class="fas fa-info-circle mr-1"></i>Summary automatically calculated from individual course payments</p>
                        </div>
                        
                        <!-- Action Buttons - Bottom Right Corner -->
                        <div class="flex justify-end space-x-3 mt-6 pt-4 mb-2">
                            <button type="button" onclick="closeHerbsRoutesModal()" class="px-8 py-3 border-2 border-gray-400 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold">
                                <i class="fas fa-times mr-2"></i>Cancel
                            </button>
                            <button type="submit" class="px-8 py-3 bg-ayurveda-600 hover:bg-ayurveda-700 text-white rounded-lg font-semibold shadow-lg">
                                <i class="fas fa-save mr-2"></i>Save Record
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- PRESCRIPTION SUMMARY/PREVIEW MODAL -->
        <div id="prescription-summary-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-ayurveda-700">
                        <i class="fas fa-file-medical mr-2"></i>Treatment Summary
                    </h3>
                    <button onclick="closeSummaryModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div id="summary-content" class="print-content">
                    <!-- Clinic Header -->
                    <div class="text-center mb-6 pb-4 border-b-2 border-ayurveda-600">
                        <h1 class="text-3xl font-bold text-ayurveda-700">TPS DHANVANTRI AYURVEDA</h1>
                        <p class="text-gray-600 mt-2">Ayurvedic Treatment & Wellness Center</p>
                        <p class="text-sm text-gray-500 mt-1" id="clinic-contact-info"></p>
                    </div>

                    <!-- Patient Information -->
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg mb-3 text-blue-800">
                            <i class="fas fa-user-circle mr-2"></i>Patient Information
                        </h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div><span class="font-semibold">Patient ID:</span> <span id="summary-patient-id"></span></div>
                            <div><span class="font-semibold">Name:</span> <span id="summary-patient-name"></span></div>
                            <div><span class="font-semibold">Age/Gender:</span> <span id="summary-patient-age-gender"></span></div>
                            <div><span class="font-semibold">Phone:</span> <span id="summary-patient-phone"></span></div>
                            <div><span class="font-semibold">Country:</span> <span id="summary-patient-country"></span></div>
                            <div><span class="font-semibold">Weight/Height:</span> <span id="summary-patient-weight-height"></span></div>
                            <div class="col-span-2 md:col-span-3"><span class="font-semibold">Address:</span> <span id="summary-patient-address"></span></div>
                            <div class="col-span-2 md:col-span-3"><span class="font-semibold">Health Issue:</span> <span class="text-red-600" id="summary-patient-health-issue"></span></div>
                        </div>
                    </div>

                    <!-- Treatment Details -->
                    <div class="mb-6">
                        <h4 class="font-bold text-lg mb-3 text-ayurveda-700">
                            <i class="fas fa-leaf mr-2"></i>Treatment Details
                        </h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
                            <div><span class="font-semibold">Given Date:</span> <span id="summary-given-date"></span></div>
                            <div><span class="font-semibold">Treatment Duration:</span> <span id="summary-treatment-months"></span></div>
                            <div><span class="font-semibold">Follow-up Date:</span> <span class="text-red-600 font-bold" id="summary-followup-date"></span></div>
                            <div><span class="font-semibold">Course:</span> <span id="summary-course"></span></div>
                            <div class="col-span-2 md:col-span-4"><span class="font-semibold">Diagnosis:</span> <span id="summary-diagnosis"></span></div>
                        </div>
                    </div>

                    <!-- Medicines List -->
                    <div class="mb-6">
                        <h4 class="font-bold text-lg mb-3 text-ayurveda-700">
                            <i class="fas fa-pills mr-2"></i>Prescribed Medicines
                        </h4>
                        <div id="summary-medicines-list" class="space-y-3"></div>
                    </div>

                    <!-- Payment Details -->
                    <div class="mb-6 bg-green-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg mb-3 text-green-800">
                            <i class="fas fa-rupee-sign mr-2"></i>Payment Details
                        </h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div><span class="font-semibold">Total Amount:</span> <span class="text-lg font-bold" id="summary-total-amount"></span></div>
                            <div><span class="font-semibold">Advance Paid:</span> <span id="summary-advance-paid"></span></div>
                            <div><span class="font-semibold">Balance Due:</span> <span class="text-lg font-bold text-red-600" id="summary-balance-due"></span></div>
                            <div id="summary-collections-info" class="col-span-2 md:col-span-4"></div>
                            <div class="col-span-2 md:col-span-4"><span class="font-semibold">Notes:</span> <span id="summary-payment-notes"></span></div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-8 pt-4 border-t text-center text-sm text-gray-600">
                        <p class="mb-2"><strong>Important Instructions:</strong> Take medicines as prescribed. Follow the dosage schedule strictly.</p>
                        <p>For any queries, please contact the clinic.</p>
                        <p class="mt-4"><strong>Next Follow-up:</strong> <span class="text-red-600 font-bold" id="summary-followup-reminder"></span></p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-3 mt-6 no-print">
                    <button onclick="window.print()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        <i class="fas fa-print mr-2"></i>Print
                    </button>
                    <button onclick="closeSummaryModal()" class="px-6 py-2 bg-ayurveda-600 hover:bg-ayurveda-700 text-white rounded-lg">
                        <i class="fas fa-times mr-2"></i>Close
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                <i class="fas fa-spinner fa-spin text-2xl text-ayurveda-600"></i>
                <span class="text-lg">Loading...</span>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
