# 🔧 PORT CONFLICT - VISUAL DIAGRAM

## Current Problem (BEFORE FIX)

```
┌──────────────────────────────────────────────────────────────┐
│                        Internet                               │
│                           ↓                                   │
│          https://tpsdhanvantariayurveda.in                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    Nginx (Port 80/443)                        │
│                                                               │
│   ❌ PROBLEM: Nginx might be proxying to wrong port          │
│                                                               │
│   Current Config:                                             │
│   server_name tpsdhanvantariayurveda.in;                     │
│   proxy_pass http://127.0.0.1:????;  ← Wrong port!          │
└──────────────────────────────────────────────────────────────┘
                            ↓ (Wrong routing)
                ┌───────────┴───────────┐
                ↓                       ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Port 3000              │  │   Port 3001              │
│   ❌ MySchool Chatbot    │  │   ✅ Ayurveda Clinic     │
│   (Wrong App!)           │  │   (Correct App!)         │
│   Status: Running        │  │   Status: Not accessible │
└──────────────────────────┘  └──────────────────────────┘
       ↑                              ↑
       │                              │
  PM2: myschool-app            PM2: ayurveda-clinic
       (or confused)                  (not started correctly)
```

**Result**: Users see **MySchool AI Assistant** instead of **TPS Dhanvantari Ayurveda** 😱

---

## Solution (AFTER FIX)

```
┌──────────────────────────────────────────────────────────────┐
│                        Internet                               │
│                           ↓                                   │
│          https://tpsdhanvantariayurveda.in                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    Nginx (Port 80/443)                        │
│                                                               │
│   ✅ FIXED: Nginx correctly configured                       │
│                                                               │
│   server_name tpsdhanvantariayurveda.in;                     │
│   proxy_pass http://127.0.0.1:3001;  ← Correct!             │
└──────────────────────────────────────────────────────────────┘
                            ↓ (Correct routing)
                            ↓
                ┌───────────┴───────────┐
                ↓                       ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Port 3000              │  │   Port 3001              │
│   ❌ MySchool Chatbot    │  │   ✅ Ayurveda Clinic     │
│   Status: Stopped        │  │   Status: Running ✓      │
│   (Removed/Disabled)     │  │   Accessible: YES ✓      │
└──────────────────────────┘  └──────────────────────────┘
                                      ↑
                                      │
                              PM2: ayurveda-clinic
                              (Started correctly on port 3001)
                                      ↓
                        ┌─────────────────────────┐
                        │   Node.js Server        │
                        │   (server.js)           │
                        │                         │
                        │   - Hono Framework      │
                        │   - SQLite Database     │
                        │   - Static Files        │
                        └─────────────────────────┘
```

**Result**: Users see **TPS Dhanvantari Ayurveda Clinic Management System** ✅

---

## What the Fix Does

### Step 1: Clean Up Conflicts
```
┌─────────────────────────────────────┐
│  pm2 stop all                       │
│  fuser -k 3000/tcp                  │
│  fuser -k 3001/tcp                  │
│                                     │
│  → Stops all running processes      │
│  → Kills processes using ports      │
└─────────────────────────────────────┘
```

### Step 2: Start Correct Application
```
┌─────────────────────────────────────┐
│  cd /var/www/ayurveda               │
│  PORT=3001 pm2 start server.js \    │
│    --name ayurveda-clinic           │
│                                     │
│  → Starts Ayurveda on port 3001     │
│  → Names process ayurveda-clinic    │
└─────────────────────────────────────┘
```

### Step 3: Fix Nginx Configuration
```
┌─────────────────────────────────────────────────┐
│  sed -i 's|proxy_pass http://127.0.0.1:[0-9]*|\ │
│         proxy_pass http://127.0.0.1:3001|' \    │
│    /etc/nginx/sites-available/                  │
│      tpsdhanvantariayurveda                     │
│                                                 │
│  nginx -t && systemctl reload nginx             │
│                                                 │
│  → Updates Nginx to proxy to port 3001         │
│  → Reloads Nginx with new config               │
└─────────────────────────────────────────────────┘
```

---

## Port Usage Map

### BEFORE FIX (Incorrect):
```
┌──────────┬─────────────────────────────────────┐
│  Port    │  Application                        │
├──────────┼─────────────────────────────────────┤
│  80      │  Nginx (HTTP)                       │
│  443     │  Nginx (HTTPS)                      │
│  3000    │  ❌ MySchool Chatbot (Wrong!)       │
│  3001    │  ❓ Not running or not accessible   │
└──────────┴─────────────────────────────────────┘
```

### AFTER FIX (Correct):
```
┌──────────┬─────────────────────────────────────┐
│  Port    │  Application                        │
├──────────┼─────────────────────────────────────┤
│  80      │  Nginx (HTTP) → redirects to 443    │
│  443     │  Nginx (HTTPS) → proxy to 3001      │
│  3000    │  (Free - not in use)                │
│  3001    │  ✅ Ayurveda Clinic (Correct!)      │
└──────────┴─────────────────────────────────────┘
```

---

## Request Flow (After Fix)

```
1. User visits:
   https://tpsdhanvantariayurveda.in
   
2. DNS Resolution:
   tpsdhanvantariayurveda.in → 88.222.244.84
   
3. Nginx receives request on port 443:
   Server block matches: tpsdhanvantariayurveda.in
   
4. Nginx proxies to backend:
   proxy_pass http://127.0.0.1:3001
   
5. Node.js server handles request:
   server.js listening on port 3001
   
6. Hono app processes request:
   - Checks routes
   - Queries SQLite database if needed
   - Returns HTML/JSON response
   
7. Response sent back through Nginx:
   443 → User's browser
   
8. User sees:
   TPS DHANVANTARI AYURVEDA ✅
```

---

## File Structure (Server)

```
/var/www/ayurveda/
├── server.js                 ← Main entry point (PORT 3001)
├── dist/
│   ├── _worker.js           ← Compiled Hono app
│   └── static/
│       ├── app.js           ← Frontend JavaScript
│       └── styles.css       ← Frontend CSS
├── public/
│   └── static/              ← Source static files
├── ayurveda.db              ← SQLite database
├── package.json
└── node_modules/

/etc/nginx/sites-available/
└── tpsdhanvantariayurveda   ← Nginx config (proxy to 3001)

PM2 Process:
└── ayurveda-clinic          ← Running server.js on port 3001
```

---

## Verification Commands

```bash
# 1. Check PM2 process
pm2 list
#    Expected output:
#    ┌─────┬──────────────────┬─────────┬─────────┐
#    │ id  │ name             │ status  │ port    │
#    ├─────┼──────────────────┼─────────┼─────────┤
#    │ 0   │ ayurveda-clinic  │ online  │ 3001    │
#    └─────┴──────────────────┴─────────┴─────────┘

# 2. Check local endpoint
curl http://localhost:3001/ | grep "Dhanvantari"
#    Expected: HTML containing "TPS DHANVANTARI AYURVEDA"

# 3. Check Nginx config
cat /etc/nginx/sites-available/tpsdhanvantariayurveda | grep proxy_pass
#    Expected: proxy_pass http://127.0.0.1:3001;

# 4. Check public endpoint
curl https://tpsdhanvantariayurveda.in/ | grep "Dhanvantari"
#    Expected: HTML containing "TPS DHANVANTARI AYURVEDA"

# 5. Check port usage
netstat -tulpn | grep 3001
#    Expected: node server.js listening on 0.0.0.0:3001
```

---

## Common Scenarios

### Scenario 1: Both apps on port 3001
```
Problem: Port conflict - both apps trying to use 3001
Solution: Stop all, then start only Ayurveda on 3001
Commands: pm2 stop all && fuser -k 3001/tcp
```

### Scenario 2: Nginx pointing to wrong port
```
Problem: Nginx proxying to port 3000 (MySchool)
Solution: Update Nginx config to proxy to 3001
Commands: sed -i 's/3000/3001/' nginx.conf && reload
```

### Scenario 3: Wrong PM2 process
```
Problem: PM2 running wrong application
Solution: Delete wrong process, start correct one
Commands: pm2 delete myschool && pm2 start server.js
```

---

## Success Indicators

✅ PM2 shows `ayurveda-clinic` as **online**  
✅ Port 3001 shows **TPS Dhanvantari** content  
✅ Nginx config proxies to **port 3001**  
✅ Public URL shows **correct application**  
✅ Login works successfully  
✅ No errors in PM2 logs  
✅ No errors in Nginx logs  

---

**Fix Time**: 5-10 minutes  
**Complexity**: Low  
**Risk**: Low (reversible with backup)  
**Impact**: High (fixes entire site)  
