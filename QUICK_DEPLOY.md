# 🚀 Quick Deployment Reference Card

## 📦 Package
**Download**: https://www.genspark.ai/api/files/s/4R80zHaV

## ⚡ Quick Deploy (Copy & Paste)

```bash
wget https://www.genspark.ai/api/files/s/4R80zHaV -O tps-dhanvantari.tar.gz
tar -xzf tps-dhanvantari.tar.gz
cd home/user/webapp
npx wrangler login
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

## 🔗 URLs
- **Production**: https://tpsdhanvantariayurveda.com
- **Pages**: https://ayurveda-clinic.pages.dev
- **Sandbox**: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai

## 🔐 Login
- **Email**: admin@tpsdhanvantari.com
- **Password**: admin123

## ✅ Verify Deployment

```bash
curl -I https://tpsdhanvantariayurveda.com
# Should return: HTTP/2 200

curl https://tpsdhanvantariayurveda.com | grep "app.js"
# Should show: app.js?v=2.3.0
```

## 🐛 If Deployment Fails

```bash
# Login again
npx wrangler logout
npx wrangler login

# Check you're in right directory
pwd
# Should show: /path/to/home/user/webapp

# List projects
npx wrangler pages project list
# Should show: ayurveda-clinic

# Try deploy again
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

## 📋 Post-Deployment Checklist
- [ ] Open https://tpsdhanvantariayurveda.com
- [ ] Clear cache (Ctrl+Shift+R)
- [ ] Login works
- [ ] Dashboard loads
- [ ] Medicine schedule shows side-by-side layout
- [ ] Additional phones feature works
- [ ] Address fields (8 fields) work

## 📚 Full Guide
See `COMPLETE_DEPLOYMENT_GUIDE.md` for detailed instructions.

---
**Version**: v2.3.0 | **Status**: ✅ Production Ready
