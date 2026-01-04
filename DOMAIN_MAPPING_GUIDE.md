# Domain Mapping Guide: tpsdhanvantariayurveda.in → 88.222.244.84:3001

## Current Status

✅ **Application Running**: http://88.222.244.84:3001/ (Working)  
✅ **Domain Purchased**: tpsdhanvantariayurveda.in (via Hostinger)  
✅ **Nginx Configured**: Reverse proxy setup complete  
✅ **SSL Ready**: Hostinger provides SSL via CDN  
❌ **Domain Not Mapped**: Shows Hostinger parking page

---

## Problem

The domain `tpsdhanvantariayurveda.in` is currently showing a **Hostinger parking page** instead of your application because:
1. DNS points to Hostinger's CDN (84.32.84.32), not your server (88.222.244.84)
2. Hostinger needs to be configured to forward traffic to your server

---

## Solution: Configure via Hostinger hPanel

You need to configure the domain in your Hostinger control panel. Here are the steps:

### Option 1: Point Domain Directly to Your Server (Recommended)

1. **Login to Hostinger hPanel**:
   - Go to: https://hpanel.hostinger.com/
   - Email: parimi.prasad@gmail.com
   - Password: Yourkpo@202425

2. **Navigate to DNS Settings**:
   - Click on **Domains**
   - Select `tpsdhanvantariayurveda.in`
   - Click on **DNS / Name Servers**

3. **Update DNS Records**:
   
   **Delete existing A records pointing to 84.32.84.32**
   
   **Add new A records**:
   ```
   Type: A
   Name: @
   Points to: 88.222.244.84
   TTL: 14400 (or default)
   
   Type: A  
   Name: www
   Points to: 88.222.244.84
   TTL: 14400 (or default)
   ```

4. **Wait for DNS Propagation**:
   - DNS changes take 0-48 hours to propagate
   - Usually works within 1-2 hours

5. **Set Up SSL Certificate**:
   
   After DNS propagates, SSH into your server and run:
   ```bash
   ssh root@88.222.244.84
   
   # Install SSL certificate
   certbot --nginx -d tpsdhanvantariayurveda.in -d www.tpsdhanvantariayurveda.in \
     --non-interactive --agree-tos --email parimi.prasad@gmail.com --redirect
   ```

---

### Option 2: Use Hostinger Forwarding (Quick but Limited)

If you want a quicker setup (but less control):

1. **Login to Hostinger hPanel**:
   - https://hpanel.hostinger.com/

2. **Set Up Domain Forwarding**:
   - Go to **Domains** → `tpsdhanvantariayurveda.in`
   - Click on **Forwarding**
   - Set:
     - **Forward to**: http://88.222.244.84:3001
     - **Forward type**: 301 (Permanent) or 302 (Temporary)
     - **Enable**: Forward www as well

**Note**: This method won't give you HTTPS and shows the IP in the URL bar.

---

### Option 3: Cloudflare Proxy (Advanced - Best Performance)

For better performance, DDoS protection, and free SSL:

1. **Add Site to Cloudflare**:
   - Sign up at https://dash.cloudflare.com/
   - Add site: `tpsdhanvantariayurveda.in`

2. **Update Nameservers at Hostinger**:
   - In Hostinger hPanel → Domains → Name Servers
   - Change to Cloudflare's nameservers (provided during setup)

3. **Configure DNS at Cloudflare**:
   ```
   Type: A
   Name: @
   Content: 88.222.244.84
   Proxy: Enabled (Orange cloud)
   
   Type: A
   Name: www
   Content: 88.222.244.84
   Proxy: Enabled (Orange cloud)
   ```

4. **SSL/TLS Settings in Cloudflare**:
   - Go to SSL/TLS → Overview
   - Select: **Full** or **Full (Strict)**

---

## Current Server Configuration

Your server is already configured to handle the domain:

**Nginx Configuration** (`/etc/nginx/sites-available/tpsdhanvantari`):
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name tpsdhanvantariayurveda.in www.tpsdhanvantariayurveda.in;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Status**: ✅ Enabled and running

---

## Testing After Configuration

### 1. Test DNS Propagation
```bash
# Check if DNS points to your server
dig +short tpsdhanvantariayurveda.in
# Should show: 88.222.244.84

dig +short www.tpsdhanvantariayurveda.in
# Should show: 88.222.244.84
```

### 2. Test HTTP Access
```bash
curl -I http://tpsdhanvantariayurveda.in
# Should return HTTP/1.1 200 OK with your application content
```

### 3. Test in Browser
- Visit: http://tpsdhanvantariayurveda.in
- Should show your TPS DHANVANTARI AYURVEDA application
- Login: Shankaranherbaltreatment@gmail.com / 123456

---

## Recommended Approach

**I recommend Option 1** (Point DNS directly to your server) because:
- ✅ Full control over SSL/TLS
- ✅ Can use Let's Encrypt for free SSL
- ✅ Better performance (no extra proxy)
- ✅ Professional setup
- ✅ Can use Cloudflare later if needed

---

## SSL Certificate Setup (After DNS Propagation)

Once DNS points to your server (88.222.244.84), run this:

```bash
# SSH into your server
ssh root@88.222.244.84

# Install SSL certificate
sudo certbot --nginx -d tpsdhanvantariayurveda.in -d www.tpsdhanvantariayurveda.in \
  --non-interactive --agree-tos --email parimi.prasad@gmail.com --redirect

# Test SSL renewal
sudo certbot renew --dry-run
```

This will:
- Obtain SSL certificate from Let's Encrypt
- Configure Nginx to use HTTPS
- Set up HTTP → HTTPS redirect
- Auto-renew every 90 days

---

## Final URLs

After successful setup:

- **Main URL**: https://tpsdhanvantariayurveda.in
- **With WWW**: https://www.tpsdhanvantariayurveda.in
- **HTTP (redirects to HTTPS)**: http://tpsdhanvantariayurveda.in

All URLs will show your TPS DHANVANTARI AYURVEDA application.

---

## Hostinger Login Details

**hPanel URL**: https://hpanel.hostinger.com/  
**Email**: parimi.prasad@gmail.com  
**Password**: Yourkpo@202425  
**Domain**: tpsdhanvantariayurveda.in

---

## Need Help?

If you encounter issues:
1. Check DNS propagation: https://dnschecker.org/
2. Verify Nginx is running: `systemctl status nginx`
3. Check application is running: `curl http://localhost:3001`
4. View Nginx logs: `tail -f /var/log/nginx/error.log`

---

## Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Purchase Domain | ✅ Done |
| 2 | Configure Server | ✅ Done |
| 3 | Setup Nginx | ✅ Done |
| 4 | **Update DNS in Hostinger** | ⏳ **YOU NEED TO DO THIS** |
| 5 | Wait for DNS Propagation | ⏳ Pending |
| 6 | Install SSL Certificate | ⏳ Pending |
| 7 | Test Domain | ⏳ Pending |

---

**Next Action**: Login to Hostinger hPanel and update DNS records (Option 1 above).
