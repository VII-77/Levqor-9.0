# 🚀 AUTOMATED CLOUDFLARE DNS CONFIGURATION

## ✅ CURRENT STATUS

Your Cloudflare API credentials are configured and ready to use!

**DNS Issues Found:**
- ❌ api.levqor.ai: Using CNAME (should be A record)
- ⚠️ Missing Replit verification TXT record  
- ⚠️ Root domain: Missing Vercel A records

## 📋 AUTOMATED SOLUTION

I've created **2 Python scripts** that use your Cloudflare API credentials to automatically manage DNS:

### 1. Check DNS Status
```bash
python3 check_cloudflare_dns.py
```
- Shows all current DNS records
- Identifies issues
- Provides recommendations

### 2. Auto-Configure DNS
```bash
python3 configure_cloudflare_dns.py
```
- Automatically fixes all DNS issues
- Deletes conflicting CNAME records
- Creates correct A + TXT records for Replit
- Adds Vercel records for frontend
- Sets up email security (SPF, DMARC)

---

## 🎯 STEP-BY-STEP DEPLOYMENT

### Step 1: Deploy Backend to Replit
1. Click the **"Deploy"** button in Replit (top-right)
2. Select **Autoscale** deployment type
3. Wait 2-3 minutes for deployment to complete

### Step 2: Get Replit DNS Values
1. In Replit → Go to **Deployments** tab
2. Click **Settings** → **Domains**
3. Click **"Link a domain"**
4. Enter: `api.levqor.ai`
5. Replit will show you:
   ```
   A Record IP: 34.123.45.67 (example)
   TXT Token: replit-verify-abc123... (example)
   ```
6. **COPY BOTH VALUES** - you'll need them next

### Step 3: Run Auto-Configuration Script
```bash
python3 configure_cloudflare_dns.py
```

The script will ask for:
1. The A record IP from Replit
2. The TXT verification token from Replit

Then it will automatically:
- ✅ Delete the conflicting CNAME for api.levqor.ai
- ✅ Create A record: api.levqor.ai → Replit IP (Proxy OFF)
- ✅ Create TXT record: _replit-challenge.api → Verification token
- ✅ Create CNAME: www.levqor.ai → cname.vercel-dns.com
- ✅ Create A records: @ → 76.76.21.21, 76.76.21.142 (Vercel IPs)
- ✅ Create SPF + DMARC email security records

### Step 4: Verify in Replit
1. Wait 5-10 minutes for DNS propagation
2. Go back to Replit → Deployments → Domains
3. Click **"Verify"** next to api.levqor.ai
4. Status changes to **"Verified"** ✅
5. SSL certificate auto-issues

### Step 5: Test Production API
```bash
# Health check
curl https://api.levqor.ai/health

# Billing health (all LIVE Stripe prices)
curl https://api.levqor.ai/api/billing/health

# Frontend
curl https://www.levqor.ai
```

All should return HTTP 200!

---

## 🔍 WHAT EACH SCRIPT DOES

### check_cloudflare_dns.py
- **Purpose**: Diagnostic tool
- **Actions**: Read-only, no changes
- **Output**: Shows current DNS, identifies issues
- **When to use**: Any time you want to see DNS status

### configure_cloudflare_dns.py
- **Purpose**: Automated configuration
- **Actions**: Creates/deletes DNS records via API
- **Output**: Fixes all DNS issues automatically
- **When to use**: After deploying backend to Replit

---

## 🎯 CRITICAL SETTINGS

The automation ensures:
- ✅ **api.levqor.ai**: Proxy OFF (grey cloud) - Required for SSL!
- ✅ **www/root**: Proxy ON (orange cloud) - OK for Vercel
- ✅ **No CNAME conflicts**: Deletes old CNAME, uses A record
- ✅ **TXT verification**: Adds _replit-challenge record

---

## 📊 EXPECTED RESULTS

After running `configure_cloudflare_dns.py`, you should see:

```
✅ Created: A api.levqor.ai → <REPLIT_IP> (🔴 DNS Only)
✅ Created: TXT _replit-challenge.api.levqor.ai → <TOKEN> (🔴 DNS Only)
✅ Created: CNAME www.levqor.ai → cname.vercel-dns.com (🟢 Proxied)
✅ Created: A @ → 76.76.21.21 (🟢 Proxied)
✅ Created: A @ → 76.76.21.142 (🟢 Proxied)
✅ Created: TXT @ → v=spf1 -all
✅ Created: TXT _dmarc → v=DMARC1; p=reject; rua=mailto:postmaster@levqor.ai

📊 Results: 7/7 records configured successfully
```

---

## 🐛 TROUBLESHOOTING

### "Missing Cloudflare credentials"
**Cause**: API token or Zone ID not set
**Solution**: Verify secrets exist:
```bash
python3 -c "import os; print('Token:', 'OK' if os.getenv('CLOUDFLARE_API_TOKEN') else 'MISSING'); print('Zone:', 'OK' if os.getenv('CLOUDFLARE_ZONE_ID') else 'MISSING')"
```

### "Failed to create record"
**Cause**: Cloudflare API error (usually permission issue)
**Solution**: Check API token has "Edit DNS" permission

### "Verification failed" in Replit
**Cause**: DNS hasn't propagated yet
**Solution**: Wait 5-30 minutes, click "Verify" again

---

## ⚡ QUICK COMMANDS

```bash
# Check current DNS status
python3 check_cloudflare_dns.py

# Auto-configure DNS (after deploying backend)
python3 configure_cloudflare_dns.py

# Test backend API
curl https://api.levqor.ai/health

# Test billing endpoint
curl https://api.levqor.ai/api/billing/health
```

---

## ✅ COMPLETION CHECKLIST

- [ ] Backend deployed in Replit
- [ ] Got A record IP from Replit
- [ ] Got TXT token from Replit
- [ ] Ran `python3 configure_cloudflare_dns.py`
- [ ] Waited 5-10 minutes for DNS propagation
- [ ] Clicked "Verify" in Replit → shows "Verified"
- [ ] Tested: `curl https://api.levqor.ai/health` → HTTP 200
- [ ] Tested: All LIVE Stripe prices configured
- [ ] Frontend accessible at https://www.levqor.ai

---

**Total Time**: 15-20 minutes
**Automation**: 7 DNS records configured automatically via API
**Next Action**: Deploy backend, then run configure_cloudflare_dns.py

