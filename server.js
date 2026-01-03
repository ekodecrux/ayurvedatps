const { serve } = require('@hono/node-server');
const { serveStatic } = require('@hono/node-server/serve-static');
const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const dbPath = path.join(__dirname, 'ayurveda.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Apply migrations
console.log('Applying database migrations...');
const migrationFiles = [
  '0001_initial_schema.sql',
  '0002_add_patients_table.sql',
  '0003_add_appointments_table.sql',
  '0004_add_herbs_routes_table.sql',
  '0005_add_reminders_table.sql',
  '0006_add_settings_table.sql',
  '0007_add_admin_users_sessions.sql',
  '0008_add_medicines_tracking.sql',
  '0009_add_payment_collections.sql',
  '0010_add_patient_diseases.sql',
  '0011_add_indexes.sql'
];

const fs = require('fs');
migrationFiles.forEach(file => {
  const filePath = path.join(__dirname, 'migrations', file);
  if (fs.existsSync(filePath)) {
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      db.exec(sql);
      console.log(`✓ Applied ${file}`);
    } catch (err) {
      console.log(`⚠ ${file} already applied or error: ${err.message}`);
    }
  }
});

// Apply seed data
const seedPath = path.join(__dirname, 'seed.sql');
if (fs.existsSync(seedPath)) {
  try {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    db.exec(seedSql);
    console.log('✓ Applied seed data');
  } catch (err) {
    console.log(`⚠ Seed data already applied or error: ${err.message}`);
  }
}

// Load the Hono app from dist/_worker.js
const appModule = require('./dist/_worker.js');
const honoApp = appModule.default;

// Create a DB adapter that mimics Cloudflare D1
class D1Adapter {
  constructor(db) {
    this.db = db;
  }

  prepare(query) {
    return {
      bind: (...params) => {
        return {
          first: () => {
            try {
              const stmt = this.db.prepare(query);
              return stmt.get(...params);
            } catch (err) {
              console.error('Query error:', err);
              throw err;
            }
          },
          all: () => {
            try {
              const stmt = this.db.prepare(query);
              const results = stmt.all(...params);
              return { results };
            } catch (err) {
              console.error('Query error:', err);
              throw err;
            }
          },
          run: () => {
            try {
              const stmt = this.db.prepare(query);
              const info = stmt.run(...params);
              return { 
                meta: { 
                  last_row_id: info.lastInsertRowid,
                  changes: info.changes 
                } 
              };
            } catch (err) {
              console.error('Query error:', err);
              throw err;
            }
          }
        };
      },
      first: () => {
        try {
          const stmt = this.db.prepare(query);
          return stmt.get();
        } catch (err) {
          console.error('Query error:', err);
          throw err;
        }
      },
      all: () => {
        try {
          const stmt = this.db.prepare(query);
          const results = stmt.all();
          return { results };
        } catch (err) {
          console.error('Query error:', err);
          throw err;
        }
      },
      run: () => {
        try {
          const stmt = this.db.prepare(query);
          const info = stmt.run();
          return { 
            meta: { 
              last_row_id: info.lastInsertRowid,
              changes: info.changes 
            } 
          };
        } catch (err) {
          console.error('Query error:', err);
          throw err;
        }
      }
    };
  }
}

// Create Node.js HTTP server
const { createServer } = require('http');

const server = createServer(async (req, res) => {
  // Serve static files from dist/static
  if (req.url.startsWith('/static/')) {
    const staticPath = path.join(__dirname, 'dist', req.url);
    if (fs.existsSync(staticPath)) {
      const ext = path.extname(staticPath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      fs.createReadStream(staticPath).pipe(res);
      return;
    }
  }

  // Create Hono-compatible request
  const url = `http://${req.headers.host}${req.url}`;
  
  // Read body for POST/PUT requests
  let body = '';
  if (req.method === 'POST' || req.method === 'PUT') {
    await new Promise((resolve) => {
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', resolve);
    });
  }

  const honoRequest = new Request(url, {
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers)
        .filter(([key]) => key !== 'host')
        .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
    ),
    body: body || undefined
  });

  // Add DB binding to context
  const context = {
    req: honoRequest,
    env: {
      DB: new D1Adapter(db)
    }
  };

  try {
    // Call Hono app with enhanced context
    const response = await honoApp.fetch(honoRequest, context.env);
    
    // Forward response to Node.js response
    res.writeHead(response.status, Object.fromEntries(response.headers));
    
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 TPS Dhanvantari Ayurveda Server Started!`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌍 Network: http://0.0.0.0:${PORT}`);
  console.log(`💾 Database: ${dbPath}`);
  console.log(`\n✅ Server is ready to accept connections\n`);
});
