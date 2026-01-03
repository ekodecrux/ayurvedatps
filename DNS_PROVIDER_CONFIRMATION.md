# DNS Provider Confirmation

**Date:** January 3, 2026 04:10 UTC

---

## 🎯 CONFIRMED: DNS Provider Status

### ✅ tpsdhanvantariayurveda.com
**It's using CLOUDFLARE DNS**

**Details:**
- Nameservers: june.ns.cloudflare.com, trevor.ns.cloudflare.com
- Current A Records: 104.21.26.186, 172.67.138.90 (Cloudflare IPs)
- Cloudflare Proxy: Enabled (orange cloud)

**What You Need To Do:**
1. Login to **Cloudflare Dashboard**
2. Select **tpsdhanvantariayurveda.com**
3. Go to **DNS** → **Records**
4. Update A records:
   - @ → 88.222.244.84 (Turn proxy OFF - gray cloud)
   - www → 88.222.244.84 (Turn proxy OFF - gray cloud)

---

### ⚠️ tpsdhanvantariayurveda.in
**It's using DNS PARKING (Not properly configured)**

**Details:**
- Nameservers: ns1.dns-parking.com, ns2.dns-parking.com
- Current A Record: 84.32.84.32 (parking page IP)
- Status: Domain purchased but parked/not active

**What You Need To Do:**

**Option 1: Use Hostinger DNS (Recommended)**
1. Login to **Hostinger Control Panel**
2. Go to **Domains** → **tpsdhanvantariayurveda.in**
3. Click **Manage Nameservers**
4. Change to Hostinger nameservers (or keep current if it's already Hostinger)
5. Go to **DNS Zone**
6. Add A records:
   - @ → 88.222.244.84
   - www → 88.222.244.84

**Option 2: Use Cloudflare DNS (Advanced)**
1. Add domain to Cloudflare
2. Change nameservers at registrar to Cloudflare
3. Add A records in Cloudflare
4. Turn proxy OFF

---

## 📊 Summary

| Domain | DNS Provider | Status | Action Required |
|--------|--------------|--------|-----------------|
| tpsdhanvantariayurveda.com | ✅ Cloudflare | Active | Update A records + Turn OFF proxy |
| tpsdhanvantariayurveda.in | ⚠️ DNS Parking | Not configured | Setup DNS + Add A records |

---

## 🎯 Recommendation

**For tpsdhanvantariayurveda.com:**
- Keep using Cloudflare DNS
- Just update the A records and turn OFF proxy

**For tpsdhanvantariayurveda.in:**
- Use Hostinger DNS (simpler)
- If you prefer Cloudflare, you'll need to:
  1. Add domain to Cloudflare account
  2. Change nameservers at domain registrar
  3. Wait for propagation
  4. Add A records

**Simplest Approach:**
1. tpsdhanvantariayurveda.com → Cloudflare DNS (already there)
2. tpsdhanvantariayurveda.in → Hostinger DNS (easier to set up)

Both will work perfectly and point to your server at 88.222.244.84.

---

## 📝 Next Steps

### For .com domain (Cloudflare):
1. Login to Cloudflare
2. DNS → Records
3. Edit A records to 88.222.244.84
4. Turn OFF proxy (orange → gray)
5. Save

### For .in domain (Hostinger - Recommended):
1. Login to Hostinger
2. Domains → tpsdhanvantariayurveda.in
3. DNS Zone → Add Records
4. Add: @ → 88.222.244.84
5. Add: www → 88.222.244.84
6. Save

### After DNS Setup:
1. Wait 10-30 minutes for propagation
2. Test: `nslookup tpsdhanvantariayurveda.com`
3. Test: `nslookup tpsdhanvantariayurveda.in`
4. Both should show: 88.222.244.84
5. SSH into server and run certbot command

---

**Last Verified:** January 3, 2026 04:10 UTC
