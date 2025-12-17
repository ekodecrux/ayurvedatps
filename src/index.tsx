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

// Create patient with auto-generated patient_id
app.post('/api/patients', async (c) => {
  try {
    const body = await c.req.json()
    const { name, age, gender, phone, email, address, medical_history } = body
    
    // Get the next patient number
    const lastPatient = await c.env.DB.prepare(
      'SELECT id FROM patients ORDER BY id DESC LIMIT 1'
    ).first()
    
    const nextId = lastPatient ? (lastPatient as any).id + 1 : 1
    const patientId = 'PAT' + String(nextId).padStart(5, '0')
    
    const result = await c.env.DB.prepare(
      'INSERT INTO patients (patient_id, name, age, gender, phone, email, address, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(patientId, name, age, gender, phone, email, address, medical_history).run()
    
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
    const { name, age, gender, phone, email, address, medical_history } = body
    
    await c.env.DB.prepare(
      'UPDATE patients SET name = ?, age = ?, gender = ?, phone = ?, email = ?, address = ?, medical_history = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, age, gender, phone, email, address, medical_history, id).run()
    
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

// ==================== MEDICINES API ====================

// Get all medicines with search and filter
app.get('/api/medicines', async (c) => {
  try {
    const search = c.req.query('search') || ''
    const category = c.req.query('category') || ''
    const lowStock = c.req.query('lowStock') || ''
    
    let query = 'SELECT * FROM medicines WHERE 1=1'
    const params: any[] = []
    
    if (search) {
      query += ' AND (name LIKE ? OR manufacturer LIKE ? OR category LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam)
    }
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    if (lowStock === 'true') {
      query += ' AND quantity < 20'
    }
    
    query += ' ORDER BY name ASC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get single medicine
app.get('/api/medicines/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const medicine = await c.env.DB.prepare(
      'SELECT * FROM medicines WHERE id = ?'
    ).bind(id).first()
    
    if (!medicine) {
      return c.json({ success: false, error: 'Medicine not found' }, 404)
    }
    
    return c.json({ success: true, data: medicine })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create medicine
app.post('/api/medicines', async (c) => {
  try {
    const body = await c.req.json()
    const { name, category, quantity, unit, price, description, expiry_date, manufacturer } = body
    
    const result = await c.env.DB.prepare(
      'INSERT INTO medicines (name, category, quantity, unit, price, description, expiry_date, manufacturer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(name, category, quantity, unit, price, description, expiry_date, manufacturer).run()
    
    return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update medicine
app.put('/api/medicines/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { name, category, quantity, unit, price, description, expiry_date, manufacturer } = body
    
    await c.env.DB.prepare(
      'UPDATE medicines SET name = ?, category = ?, quantity = ?, unit = ?, price = ?, description = ?, expiry_date = ?, manufacturer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, category, quantity, unit, price, description, expiry_date, manufacturer, id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete medicine
app.delete('/api/medicines/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM medicines WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get pharmacy stock report
app.get('/api/pharmacy/stock-report', async (c) => {
  try {
    const { results: medicines } = await c.env.DB.prepare(
      'SELECT * FROM medicines ORDER BY quantity ASC'
    ).all()
    
    const totalMedicines = medicines.length
    const lowStockCount = medicines.filter((m: any) => m.quantity < 20).length
    const outOfStockCount = medicines.filter((m: any) => m.quantity === 0).length
    const totalValue = medicines.reduce((sum: number, m: any) => sum + (m.price * m.quantity || 0), 0)
    
    // Get expiring soon (within 3 months)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
    const expiringSoon = medicines.filter((m: any) => {
      if (!m.expiry_date) return false
      return new Date(m.expiry_date) <= threeMonthsFromNow && new Date(m.expiry_date) >= new Date()
    })
    
    // Get categories
    const categories = [...new Set(medicines.map((m: any) => m.category).filter(Boolean))]
    
    return c.json({ 
      success: true, 
      data: {
        totalMedicines,
        lowStockCount,
        outOfStockCount,
        totalValue: totalValue.toFixed(2),
        expiringSoonCount: expiringSoon.length,
        categories: categories.length,
        categoryList: categories,
        lowStockItems: medicines.filter((m: any) => m.quantity < 20 && m.quantity > 0),
        outOfStockItems: medicines.filter((m: any) => m.quantity === 0),
        expiringSoonItems: expiringSoon
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== PRESCRIPTIONS API ====================

// Get all prescriptions with search and filter
app.get('/api/prescriptions', async (c) => {
  try {
    const search = c.req.query('search') || ''
    const dateFrom = c.req.query('dateFrom') || ''
    const dateTo = c.req.query('dateTo') || ''
    
    let query = `
      SELECT p.*, pt.name as patient_name, pt.phone as patient_phone, pt.patient_id
      FROM prescriptions p
      LEFT JOIN patients pt ON p.patient_id = pt.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (search) {
      query += ' AND (pt.name LIKE ? OR pt.phone LIKE ? OR pt.patient_id LIKE ? OR p.diagnosis LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam, searchParam)
    }
    
    if (dateFrom) {
      query += ' AND DATE(p.created_at) >= ?'
      params.push(dateFrom)
    }
    
    if (dateTo) {
      query += ' AND DATE(p.created_at) <= ?'
      params.push(dateTo)
    }
    
    query += ' ORDER BY p.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get prescriptions by patient
app.get('/api/patients/:id/prescriptions', async (c) => {
  try {
    const patientId = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC'
    ).bind(patientId).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get single prescription with medicines
app.get('/api/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Get prescription details
    const prescription = await c.env.DB.prepare(`
      SELECT p.*, pt.name as patient_name, pt.phone as patient_phone, pt.email as patient_email
      FROM prescriptions p
      LEFT JOIN patients pt ON p.patient_id = pt.id
      WHERE p.id = ?
    `).bind(id).first()
    
    if (!prescription) {
      return c.json({ success: false, error: 'Prescription not found' }, 404)
    }
    
    // Get medicines for this prescription
    const { results: medicines } = await c.env.DB.prepare(`
      SELECT pm.*, m.name as medicine_name, m.category
      FROM prescription_medicines pm
      LEFT JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
    `).bind(id).all()
    
    return c.json({ 
      success: true, 
      data: { 
        ...prescription, 
        medicines 
      } 
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create prescription
app.post('/api/prescriptions', async (c) => {
  try {
    const body = await c.req.json()
    const { patient_id, appointment_id, diagnosis, notes, next_followup_date, medicines } = body
    
    // Insert prescription
    const result = await c.env.DB.prepare(
      'INSERT INTO prescriptions (patient_id, appointment_id, diagnosis, notes, next_followup_date) VALUES (?, ?, ?, ?, ?)'
    ).bind(patient_id, appointment_id, diagnosis, notes, next_followup_date).run()
    
    const prescriptionId = result.meta.last_row_id
    
    // Insert medicines if provided
    if (medicines && medicines.length > 0) {
      for (const med of medicines) {
        await c.env.DB.prepare(
          'INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(prescriptionId, med.medicine_id, med.dosage, med.frequency, med.duration, med.instructions).run()
      }
    }
    
    // Create follow-up reminder if date is set
    if (next_followup_date) {
      await c.env.DB.prepare(
        'INSERT INTO reminders (patient_id, prescription_id, reminder_type, reminder_date, message, send_whatsapp, send_sms) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        patient_id, 
        prescriptionId, 
        'followup', 
        next_followup_date, 
        'Follow-up appointment reminder', 
        1, 
        1
      ).run()
    }
    
    return c.json({ success: true, data: { id: prescriptionId } }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update prescription
app.put('/api/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { patient_id, appointment_id, diagnosis, notes, next_followup_date, medicines } = body
    
    // Update prescription
    await c.env.DB.prepare(
      'UPDATE prescriptions SET patient_id = ?, appointment_id = ?, diagnosis = ?, notes = ?, next_followup_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(patient_id, appointment_id, diagnosis, notes, next_followup_date, id).run()
    
    // Delete existing medicines
    await c.env.DB.prepare(
      'DELETE FROM prescription_medicines WHERE prescription_id = ?'
    ).bind(id).run()
    
    // Insert updated medicines
    if (medicines && medicines.length > 0) {
      for (const med of medicines) {
        await c.env.DB.prepare(
          'INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(id, med.medicine_id, med.dosage, med.frequency, med.duration, med.instructions).run()
      }
    }
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Delete prescription
app.delete('/api/prescriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM prescriptions WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
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
    
    // Get low stock medicines (less than 20 units)
    const lowStockMedicines = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM medicines WHERE quantity < 20'
    ).first()
    
    return c.json({ 
      success: true, 
      data: {
        totalPatients: (patientsCount as any)?.count || 0,
        todayAppointments: (todayAppointments as any)?.count || 0,
        pendingReminders: (pendingReminders as any)?.count || 0,
        lowStockMedicines: (lowStockMedicines as any)?.count || 0
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
        <title>Ayurveda Clinic Management System</title>
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
                        <span class="text-xl font-bold">Ayurveda Clinic</span>
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
                            <i class="fas fa-file-prescription mr-2"></i>Prescriptions
                        </button>
                        <button onclick="showSection('pharmacy')" class="nav-btn hover:bg-ayurveda-800 px-3 py-2 rounded transition">
                            <i class="fas fa-pills mr-2"></i>Pharmacy
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
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    
                    <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Low Stock Items</p>
                                <p id="stat-lowstock" class="text-3xl font-bold text-gray-800">0</p>
                            </div>
                            <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
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

            <!-- Other sections will be loaded dynamically -->
            <div id="patients-section" class="section hidden"></div>
            <div id="appointments-section" class="section hidden"></div>
            <div id="prescriptions-section" class="section hidden"></div>
            <div id="pharmacy-section" class="section hidden"></div>
            <div id="reminders-section" class="section hidden"></div>
            <div id="settings-section" class="section hidden"></div>
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
