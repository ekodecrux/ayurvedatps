# TPS Dhanvantari - Hostinger Deployment Instructions

## Quick Deploy

### 1. Upload to Server
```bash
scp -r /home/user/webapp/deploy-package/* root@88.222.244.84:/var/www/ayurveda/
```

### 2. SSH into Server
```bash
ssh root@88.222.244.84
```

### 3. Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

### 4. Start Application
```bash
cd /var/www/ayurveda
bash start.sh
```

## Access URLs

- **Application**: http://88.222.244.84:3001
- **Domain**: http://ayurveda.myschoolct.com:3001 (after DNS configuration)

## Nginx Configuration (Optional - for domain)

If you want to use http://ayurveda.myschoolct.com without port:

```nginx
server {
    listen 80;
    server_name ayurveda.myschoolct.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save to `/etc/nginx/sites-available/ayurveda` and enable:
```bash
ln -s /etc/nginx/sites-available/ayurveda /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Commands

- **Start**: `pm2 start ayurveda-clinic`
- **Stop**: `pm2 stop ayurveda-clinic`
- **Restart**: `pm2 restart ayurveda-clinic`
- **Logs**: `pm2 logs ayurveda-clinic`
- **Status**: `pm2 status`

## Database

- Location: `/var/www/ayurveda/ayurveda.db`
- Automatic migrations applied on first start
- Default admin: admin@tpsdhanvantari.com / admin123

## Troubleshooting

### Port already in use
```bash
lsof -i :3001
kill -9 <PID>
```

### Permission issues
```bash
chown -R root:root /var/www/ayurveda
chmod -R 755 /var/www/ayurveda
```
