import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== PATIENTS API ====================

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

// Create patient with auto-generated COUNTRYNAME0001 patient_id
app.post('/api/patients', async (c) => {
  try {
    const body = await c.req.json()
    
    // Generate patient ID based on country
    const country = body.country || 'INDIA'
    const countryUpper = country.toUpperCase()
    
    const lastPatientWithCountry = await c.env.DB.prepare(
      'SELECT patient_id FROM patients WHERE patient_id LIKE ? ORDER BY patient_id DESC LIMIT 1'
    ).bind(`${countryUpper}%`).first()
    
    let patientId
    if (lastPatientWithCountry) {
      const lastNumber = parseInt((lastPatientWithCountry as any).patient_id.replace(countryUpper, ''))
      patientId = countryUpper + String(lastNumber + 1).padStart(4, '0')
    } else {
      patientId = countryUpper + '0001'
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO patients (
        patient_id, name, age, gender, phone, email, address, medical_history,
        country, country_code, weight, height,
        referred_by_name, referred_by_phone, referred_by_address,
        address_hno, address_street, address_apartment, address_area, 
        address_district, address_state, address_pincode,
        address_latitude, address_longitude,
        photo_url, present_health_issue, present_medicine, mg_value,
        additional_phones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      patientId, body.name, body.age, body.gender, body.phone, body.email || null, body.address || null, body.medical_history || null,
      body.country || 'India', body.country_code || '+91', body.weight || null, body.height || null,
      body.referred_by_name || null, body.referred_by_phone || null, body.referred_by_address || null,
      body.address_hno || null, body.address_street || null, body.address_apartment || null, body.address_area || null,
      body.address_district || null, body.address_state || null, body.address_pincode || null,
      body.address_latitude || null, body.address_longitude || null,
      body.photo_url || null, body.present_health_issue || null, body.present_medicine || null, body.mg_value || null,
      body.additional_phones || null
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
        country = ?, country_code = ?, weight = ?, height = ?,
        referred_by_name = ?, referred_by_phone = ?, referred_by_address = ?,
        address_hno = ?, address_street = ?, address_apartment = ?, address_area = ?,
        address_district = ?, address_state = ?, address_pincode = ?,
        address_latitude = ?, address_longitude = ?,
        photo_url = ?, present_health_issue = ?, present_medicine = ?, mg_value = ?,
        additional_phones = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.name, body.age, body.gender, body.phone, body.email || null, body.address || null, body.medical_history || null,
      body.country || null, body.country_code || null, body.weight || null, body.height || null,
      body.referred_by_name || null, body.referred_by_phone || null, body.referred_by_address || null,
      body.address_hno || null, body.address_street || null, body.address_apartment || null, body.address_area || null,
      body.address_district || null, body.address_state || null, body.address_pincode || null,
      body.address_latitude || null, body.address_longitude || null,
      body.photo_url || null, body.present_health_issue || null, body.present_medicine || null, body.mg_value || null,
      body.additional_phones || null,
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
app.get('/api/patients/export/csv', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM patients ORDER BY created_at DESC').all()
    
    if (results.length === 0) {
      return c.text('No patients to export', 404)
    }
    
    // CSV headers
    const headers = [
      'Patient ID', 'Name', 'Age', 'Gender', 'Country', 'Phone', 'Country Code',
      'Email', 'Weight', 'Height', 'Address H.No', 'Street', 'Apartment', 'Area',
      'District', 'State', 'Pin Code', 'Present Health Issue', 'Present Medicine',
      'MG Value', 'Referred By Name', 'Referred By Phone', 'Medical History', 'Created At'
    ].join(',')
    
    // CSV rows
    const rows = results.map((patient: any) => {
      return [
        patient.patient_id || '',
        `"${(patient.name || '').replace(/"/g, '""')}"`,
        patient.age || '',
        patient.gender || '',
        patient.country || '',
        patient.phone || '',
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
        `"${(patient.present_health_issue || '').replace(/"/g, '""')}"`,
        `"${(patient.present_medicine || '').replace(/"/g, '""')}"`,
        patient.mg_value || '',
        patient.referred_by_name || '',
        patient.referred_by_phone || '',
        `"${(patient.medical_history || '').replace(/"/g, '""')}"`,
        patient.created_at || ''
      ].join(',')
    }).join('\n')
    
    const csv = `${headers}\n${rows}`
    
    return c.text(csv, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="patients_export_${new Date().toISOString().split('T')[0]}.csv"`
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

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
    return c.json({ success: true, data: results })
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
      SELECT h.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email, 
             p.patient_id, p.age, p.gender, p.country, p.weight, p.height,
             p.present_health_issue, p.present_medicine, p.mg_value
      FROM herbs_routes h
      LEFT JOIN patients p ON h.patient_id = p.id
      WHERE h.id = ?
    `).bind(id).first()
    
    if (!herbsRoute) {
      return c.json({ success: false, error: 'Herbs & Routes not found' }, 404)
    }
    
    // Get medicines for this herbs & routes
    const { results: medicines } = await c.env.DB.prepare(
      'SELECT * FROM medicines_tracking WHERE herbs_route_id = ? ORDER BY roman_id'
    ).bind(id).all()
    
    return c.json({ 
      success: true, 
      data: { 
        ...herbsRoute, 
        medicines 
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
    
    // Insert herbs_routes record
    const result = await c.env.DB.prepare(`
      INSERT INTO herbs_routes (
        patient_id, given_date, treatment_months, follow_up_date,
        diagnosis, notes, payment_amount, advance_payment, 
        due_balance, payment_notes, course
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.patient_id,
      body.given_date,
      body.treatment_months,
      body.follow_up_date,
      body.diagnosis || null,
      body.notes || null,
      body.payment_amount || 0,
      body.advance_payment || 0,
      body.due_balance || 0,
      body.payment_notes || null,
      body.course || null
    ).run()
    
    const herbsRouteId = result.meta.last_row_id
    
    // Insert medicines
    if (body.medicines && body.medicines.length > 0) {
      for (const med of body.medicines) {
        await c.env.DB.prepare(`
          INSERT INTO medicines_tracking (
            herbs_route_id, roman_id, medicine_name, given_date, treatment_months,
            morning_before, morning_after, afternoon_before, afternoon_after,
            evening_before, evening_after, night_before, night_after
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          herbsRouteId,
          med.roman_id,
          med.medicine_name,
          med.given_date,
          med.treatment_months,
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
    
    // Create follow-up reminder
    if (body.follow_up_date) {
      await c.env.DB.prepare(`
        INSERT INTO reminders (
          patient_id, type, scheduled_date, title, message, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        body.patient_id,
        'Follow-up',
        body.follow_up_date,
        'Follow-up Consultation',
        'Time for your follow-up consultation',
        'Pending'
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
    
    // Update herbs_routes record
    await c.env.DB.prepare(`
      UPDATE herbs_routes SET 
        patient_id = ?, given_date = ?, treatment_months = ?, follow_up_date = ?,
        diagnosis = ?, notes = ?, payment_amount = ?, advance_payment = ?, 
        due_balance = ?, payment_notes = ?, course = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.patient_id,
      body.given_date,
      body.treatment_months,
      body.follow_up_date,
      body.diagnosis || null,
      body.notes || null,
      body.payment_amount || 0,
      body.advance_payment || 0,
      body.due_balance || 0,
      body.payment_notes || null,
      body.course || null,
      id
    ).run()
    
    // Delete existing medicines
    await c.env.DB.prepare(
      'DELETE FROM medicines_tracking WHERE herbs_route_id = ?'
    ).bind(id).run()
    
    // Insert updated medicines
    if (body.medicines && body.medicines.length > 0) {
      for (const med of body.medicines) {
        await c.env.DB.prepare(`
          INSERT INTO medicines_tracking (
            herbs_route_id, roman_id, medicine_name, given_date, treatment_months,
            morning_before, morning_after, afternoon_before, afternoon_after,
            evening_before, evening_after, night_before, night_after
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          med.roman_id,
          med.medicine_name,
          med.given_date,
          med.treatment_months,
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

// ==================== NOTIFICATION APIs ====================

// Send WhatsApp message
app.post('/api/send-whatsapp', async (c) => {
  try {
    const { to, message, reminderId } = await c.req.json()
    
    // Get WhatsApp settings
    const phoneIdSetting = await c.env.DB.prepare(
      "SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_phone_id'"
    ).first()
    
    const tokenSetting = await c.env.DB.prepare(
      "SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_token'"
    ).first()
    
    if (!phoneIdSetting || !tokenSetting) {
      return c.json({ 
        success: false, 
        error: 'WhatsApp not configured. Please add Phone ID and Access Token in Settings.' 
      }, 400)
    }
    
    const phoneNumberId = (phoneIdSetting as any).setting_value
    const accessToken = (tokenSetting as any).setting_value
    
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
      "SELECT setting_value FROM settings WHERE setting_key = 'sms_provider'"
    ).first()
    
    const apiKeySetting = await c.env.DB.prepare(
      "SELECT setting_value FROM settings WHERE setting_key = 'sms_api_key'"
    ).first()
    
    const authTokenSetting = await c.env.DB.prepare(
      "SELECT setting_value FROM settings WHERE setting_key = 'sms_auth_token'"
    ).first()
    
    const senderIdSetting = await c.env.DB.prepare(
      "SELECT setting_value FROM settings WHERE setting_key = 'sms_sender_id'"
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
    
    // Get pending reminders
    const pendingReminders = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM reminders WHERE status = 'pending' AND reminder_date <= datetime('now', '+3 days')"
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
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-gradient-to-r from-ayurveda-700 to-ayurveda-600 text-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-leaf text-2xl"></i>
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
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                        </select>
                        <button onclick="exportPatients()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-download mr-2"></i>Export CSV
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
                    <div class="mb-4">
                        <input type="text" id="prescription-search" placeholder="Search by patient name or problem..." class="border rounded px-3 py-2 w-full" onkeyup="loadHerbsRoutes()">
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-6 py-3 text-left">Given Date</th>
                                    <th class="px-6 py-3 text-left">Patient</th>
                                    <th class="px-6 py-3 text-left">Problem</th>
                                    <th class="px-6 py-3 text-left">Course</th>
                                    <th class="px-6 py-3 text-left">Amount</th>
                                    <th class="px-6 py-3 text-left">Duration</th>
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
                                <label class="block text-sm font-medium mb-1">C/o (Care of)</label>
                                <input type="text" id="patient-co" class="border rounded px-3 py-2 w-full">
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
                                <select id="patient-country" class="border rounded px-3 py-2 w-full" onchange="updateCountryCode()" required>
                                    <option value="India">India</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Australia">Australia</option>
                                    <option value="Canada">Canada</option>
                                    <option value="UAE">UAE</option>
                                    <option value="Singapore">Singapore</option>
                                    <option value="Malaysia">Malaysia</option>
                                    <option value="Saudi Arabia">Saudi Arabia</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Country Code</label>
                                <input type="text" id="patient-country-code" class="border rounded px-3 py-2 w-full" value="+91" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Phone 1 *</label>
                                <input type="text" id="patient-phone" class="border rounded px-3 py-2 w-full" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Phone 2</label>
                                <input type="text" id="patient-phone2" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Phone 3</label>
                                <input type="text" id="patient-phone3" class="border rounded px-3 py-2 w-full">
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
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium mb-1">Present Health Issue</label>
                                <input type="text" id="patient-present-health-issue" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Present Medicine</label>
                                <input type="text" id="patient-present-medicine" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">MG Value</label>
                                <input type="text" id="patient-mg" class="border rounded px-3 py-2 w-full">
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-1">Medical History</label>
                            <textarea id="patient-medical-history" class="border rounded px-3 py-2 w-full" rows="3" placeholder="Previous medical conditions, allergies, surgeries, etc."></textarea>
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2">Multiple Diseases <span class="text-xs text-gray-500">(Add multiple if needed)</span></label>
                            <div id="diseases-list" class="space-y-2 mb-2"></div>
                            <button type="button" onclick="addDiseaseField()" class="text-ayurveda-600 hover:text-ayurveda-700 text-sm">
                                <i class="fas fa-plus mr-1"></i>Add Disease
                            </button>
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
                <div class="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h3 id="prescription-modal-title" class="text-2xl font-bold"><i class="fas fa-leaf mr-2 text-ayurveda-600"></i>New Herbs & Routes Record</h3>
                        <button onclick="closeHerbsRoutesModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <form id="prescription-form" onsubmit="event.preventDefault(); saveHerbsRoutes();">
                        <input type="hidden" id="prescription-id">
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium mb-1">Patient *</label>
                                <select id="prescription-patient" class="border rounded px-3 py-2 w-full" required>
                                    <option value="">Select Patient</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Given Date *</label>
                                <input type="date" id="prescription-date" class="border rounded px-3 py-2 w-full" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Treatment Months *</label>
                                <select id="prescription-months" class="border rounded px-3 py-2 w-full" required>
                                    <option value="1">1 Month</option>
                                    <option value="2">2 Months</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="12">12 Months</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Problem/Diagnosis</label>
                                <input type="text" id="prescription-problem" class="border rounded px-3 py-2 w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Course (1-16)</label>
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
                        </div>
                        
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-bold text-lg">Medicines</h4>
                                <button type="button" onclick="addMedicineRow()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-plus mr-2"></i>Add Medicine
                                </button>
                            </div>
                            <div id="medicines-list"></div>
                        </div>
                        
                        <div class="border-t pt-6 mb-6">
                            <h4 class="font-bold text-lg mb-4 text-ayurveda-700">Payment Details</h4>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">Total Amount (₹)</label>
                                    <input type="number" step="0.01" id="prescription-amount" class="border rounded px-3 py-2 w-full" oninput="calculateBalance()" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Advance Paid (₹)</label>
                                    <input type="number" step="0.01" id="prescription-advance" class="border rounded px-3 py-2 w-full" oninput="calculateBalance()" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Balance Due</label>
                                    <div class="border rounded px-3 py-2 bg-gray-100 text-lg font-bold text-red-600" id="prescription-balance-display">₹0.00</div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Payment Notes</label>
                                    <input type="text" id="prescription-payment-notes" class="border rounded px-3 py-2 w-full" placeholder="Optional notes">
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="closeHerbsRoutesModal()" class="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
                            <button type="submit" class="px-6 py-2 bg-ayurveda-600 hover:bg-ayurveda-700 text-white rounded-lg">Save Record</button>
                        </div>
                    </form>
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
