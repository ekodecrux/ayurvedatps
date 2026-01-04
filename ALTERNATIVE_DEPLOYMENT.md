# 🚀 Alternative Deployment Method - Manual File Upload

## ⚠️ Issue Found
The server directory `/var/www/ayurveda` is **NOT a git repository**, so we need to use a different deployment method.

---

## 🎯 Solution: Direct File Upload

Since git is not set up on the server, we'll upload the built files directly.

---

## 📋 Method 1: Download and Upload via FTP/SFTP (Recommended)

### Step 1: Download Files from GitHub
1. Go to: https://github.com/ekodecrux/ayurvedatps
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file

### Step 2: Build the Files Locally (if needed)
If you have Node.js installed locally:
```bash
cd ayurvedatps-main
npm install
npm run build
```

This creates the `dist` folder with built files.

### Step 3: Upload Files via FTP
Using FileZilla or any SFTP client:

**Server Details**:
- Host: `88.222.244.84`
- Port: `22` (SFTP)
- Username: `root`
- Password: `Yourkpo@202425`

**Upload These Files**:
- `dist/_worker.js` → `/var/www/ayurveda/dist/_worker.js`
- `dist/static/app.js` → `/var/www/ayurveda/dist/static/app.js`
- `public/static/styles.css` → `/var/www/ayurveda/dist/static/styles.css`

### Step 4: Restart Service
SSH into server:
```bash
ssh root@88.222.244.84
pm2 restart ayurveda-clinic
pm2 status
```

---

## 📋 Method 2: Use Pre-Built Files (Fastest)

I've already built the files. You can download them directly:

### Download These Files:
1. **dist/_worker.js** (146.29 kB)
2. **dist/static/app.js** (141 kB)
3. **public/static/styles.css** (11.7 kB)

**GitHub Links**:
- Worker: https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js
- App JS: https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js
- Styles: https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css

### Upload via SFTP:
Use FileZilla, WinSCP, or Cyberduck:
1. Connect to `88.222.244.84` as `root`
2. Navigate to `/var/www/ayurveda/dist/`
3. Upload `_worker.js`
4. Navigate to `/var/www/ayurveda/dist/static/`
5. Upload `app.js` and `styles.css`

### Restart:
```bash
ssh root@88.222.244.84
pm2 restart ayurveda-clinic
```

---

## 📋 Method 3: Manual Copy-Paste via SSH

### Step 1: Connect to Server
```bash
ssh root@88.222.244.84
```
Password: `Yourkpo@202425`

### Step 2: Backup Current Files
```bash
cd /var/www/ayurveda
cp dist/_worker.js dist/_worker.js.backup
cp dist/static/app.js dist/static/app.js.backup
```

### Step 3: Download Files from GitHub
```bash
cd /var/www/ayurveda/dist
curl -o _worker.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js

cd /var/www/ayurveda/dist/static
curl -o app.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js
curl -o styles.css https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css
```

### Step 4: Verify Files
```bash
ls -lh /var/www/ayurveda/dist/_worker.js
ls -lh /var/www/ayurveda/dist/static/app.js
```

### Step 5: Restart Service
```bash
pm2 restart ayurveda-clinic
pm2 status
pm2 logs ayurveda-clinic --nostream --lines 10
```

---

## 📋 Method 4: Initialize Git Repository (For Future)

If you want to use git in the future:

### On Your Server:
```bash
ssh root@88.222.244.84
cd /var/www/ayurveda

# Initialize git
git init
git remote add origin https://github.com/ekodecrux/ayurvedatps.git

# Get GitHub credentials
git config --global user.name "ekodecrux"
git config --global user.email "parimi.prasad@gmail.com"

# Pull code
git fetch origin
git checkout -b main origin/main
git pull origin main

# Build
npm install
npm run build

# Restart
pm2 restart ayurveda-clinic
```

---

## 🎯 Recommended: Method 3 (Curl Download)

This is the fastest and easiest:

### Complete Commands:
```bash
ssh root@88.222.244.84 << 'ENDSSH'
cd /var/www/ayurveda
cp dist/_worker.js dist/_worker.js.backup
cp dist/static/app.js dist/static/app.js.backup
curl -o dist/_worker.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/_worker.js
curl -o dist/static/app.js https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/dist/static/app.js
curl -o dist/static/styles.css https://raw.githubusercontent.com/ekodecrux/ayurvedatps/main/public/static/styles.css
pm2 restart ayurveda-clinic
pm2 status
ENDSSH
```

---

## ✅ Verification After Upload

### 1. Check File Sizes
```bash
ssh root@88.222.244.84 "ls -lh /var/www/ayurveda/dist/_worker.js /var/www/ayurveda/dist/static/app.js"
```

**Expected**:
- `_worker.js`: ~146 KB
- `app.js`: ~141 KB

### 2. Check Service Status
```bash
ssh root@88.222.244.84 "pm2 status ayurveda-clinic"
```

**Expected**: `status: online`

### 3. Test URL
```bash
curl -I https://tpsdhanvantariayurveda.in
```

**Expected**: `HTTP/2 200`

---

## 🧪 Test Mobile Features

After deployment:

1. Clear browser cache: **Ctrl+Shift+R**
2. Open DevTools: **F12**
3. Enable mobile view: **Ctrl+Shift+M**
4. Select: **iPhone 12 Pro**

### Check:
- [ ] 3-dot menu (⋮) in top-right
- [ ] No gaps on sides/bottom
- [ ] Menu slides from right
- [ ] Export buttons in 3 columns
- [ ] All features work

---

## 📞 Support

**If you need help with SFTP**:
- **Windows**: Use WinSCP (free) - https://winscp.net/
- **Mac**: Use Cyberduck (free) - https://cyberduck.io/
- **All platforms**: FileZilla - https://filezilla-project.org/

**Server Details**:
- Host: `88.222.244.84`
- Port: `22`
- Protocol: `SFTP`
- Username: `root`
- Password: `Yourkpo@202425`

---

## 🎉 Summary

Since `/var/www/ayurveda` is not a git repository, use one of these methods:

1. ✅ **Method 3 (curl)** - Fastest via SSH
2. ✅ **Method 2 (SFTP)** - Easiest with GUI
3. ✅ **Method 4 (git init)** - Best for future

**Recommendation**: Use Method 3 (curl download) for quick deployment now!
