# 🚀 Quick Deployment Commands

## One-Time Setup (Run these in order)

```bash
# 1. Extract and navigate
tar -xzf ayurveda-clinic-production-ready.tar.gz
cd webapp

# 2. Install
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Create database
npx wrangler d1 create ayurveda-db-prod
# → Copy the database_id

# 5. Update wrangler.jsonc with database_id

# 6. Run migrations
npx wrangler d1 migrations apply ayurveda-db-prod

# 7. Create admin user
npx wrangler d1 execute ayurveda-db-prod --command="INSERT INTO admin_users (email, name, password_hash, created_at, updated_at) VALUES ('tpsdhanvantari@gmail.com', 'Nilesh', 'e38ad214943daad1d64c102faec29de4afe9da3d', datetime('now'), datetime('now'))"

# 8. Build
npm run build

# 9. Create Pages project
npx wrangler pages project create ayurveda-clinic --production-branch main

# 10. Deploy
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

## Add Custom Domain

```bash
npx wrangler pages domain add tpsdhanvantariayurveda.com --project-name ayurveda-clinic
```

## Future Deployments (Quick Update)

```bash
npm run build
npx wrangler pages deploy dist --project-name ayurveda-clinic
```

## Login Credentials

- **Email**: tpsdhanvantari@gmail.com
- **Password**: 123456

## Useful Commands

```bash
# Check deployments
npx wrangler pages deployment list --project-name ayurveda-clinic

# Check database
npx wrangler d1 execute ayurveda-db-prod --command="SELECT COUNT(*) FROM patients"

# View logs
npx wrangler pages deployment tail --project-name ayurveda-clinic
```
