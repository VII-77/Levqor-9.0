# COMPLETE CLOUDFLARE DNS SETUP FOR LEVQOR.AI

## CRITICAL INFORMATION

**Replit Autoscale deployments require:**
1. **A record** (IP address provided by Replit)
2. **TXT record** (verification token provided by Replit)
3. **Cloudflare Proxy: MUST BE OFF** (DNS-only mode)
   - If proxy is ON, Replit cannot auto-renew SSL certificates

**CNAME vs A Record:**
- ❌ DO NOT use CNAME for `api.levqor.ai` → Replit doesn't support this
- ✅ MUST use A + TXT records (values from Replit deployment panel)

---

## STEP 1: GET REPLIT DNS VALUES

Before configuring Cloudflare, you need to get the exact A record IP and TXT verification value from Replit:

1. **In Replit**, click on your deployed backend project
2. Go to **Deployments** tab
3. Click on **Settings** → **Domains**
4. Click **"Link a domain"** or **"Manually connect from another registrar"**
5. Enter: `api.levqor.ai`
6. Replit will show you:
   ```
   A Record:
   Type: A
   Name: api
   Content: <IP_ADDRESS>  ← COPY THIS IP
   
   TXT Record:
   Type: TXT
   Name: _replit-challenge.api
   Content: <VERIFICATION_TOKEN>  ← COPY THIS TOKEN
   ```

**WRITE DOWN THESE VALUES** - you'll need them in Step 2.

---

## STEP 2: CLOUDFLARE DNS RECORDS

Log into Cloudflare → Select `levqor.ai` domain → DNS → Records

### DELETE ALL EXISTING RECORDS FIRST
Remove any old A, CNAME, or TXT records that conflict with the new setup.

---

### REQUIRED RECORDS FOR API.LEVQOR.AI (BACKEND)

#### Record 1: A Record for Backend
```
Type:    A
Name:    api
Content: <PASTE IP FROM REPLIT> (e.g., 34.123.45.67)
Proxy:   🔴 OFF (DNS only) ← CRITICAL!
TTL:     Auto
```

#### Record 2: TXT Verification for Backend
```
Type:    TXT
Name:    _replit-challenge.api
Content: <PASTE TOKEN FROM REPLIT> (e.g., replit-verify-abc123...)
Proxy:   N/A
TTL:     Auto
```

---

### REQUIRED RECORDS FOR WWW.LEVQOR.AI & LEVQOR.AI (FRONTEND)

#### Record 3: CNAME for www
```
Type:    CNAME
Name:    www
Content: cname.vercel-dns.com
Proxy:   🟢 ON (Proxied) ← Can be proxied for Vercel
TTL:     Auto
```

#### Record 4: A Records for Root Domain (Vercel)
Vercel requires these specific IPs for root domain:
```
Type:    A
Name:    @
Content: 76.76.21.21
Proxy:   🟢 ON (Proxied)
TTL:     Auto

Type:    A
Name:    @
Content: 76.76.21.142
Proxy:   🟢 ON (Proxied)
TTL:     Auto
```

---

### OPTIONAL: EMAIL SECURITY RECORDS

#### Record 5: SPF Record
```
Type:    TXT
Name:    @
Content: v=spf1 -all
Proxy:   N/A
TTL:     Auto
```

#### Record 6: DMARC Record
```
Type:    TXT
Name:    _dmarc
Content: v=DMARC1; p=reject; rua=mailto:postmaster@levqor.ai
Proxy:   N/A
TTL:     Auto
```

#### Record 7: DKIM Record (if you have email)
```
Type:    TXT
Name:    default._domainkey
Content: v=DKIM1; p=<your_dkim_public_key>
Proxy:   N/A
TTL:     Auto
```

---

## STEP 3: VERIFY IN REPLIT

After adding DNS records to Cloudflare:

1. Go back to Replit deployment → Domains
2. Wait 5-10 minutes for DNS propagation
3. Click **"Verify"** next to `api.levqor.ai`
4. Status should change to **"Verified" ✅**
5. Replit will automatically issue SSL certificate

---

## STEP 4: TEST YOUR DEPLOYMENT

### Test Backend API
```bash
curl https://api.levqor.ai/health
```
Should return: HTTP 200 with JSON response

### Test Billing Health
```bash
curl https://api.levqor.ai/api/billing/health
```
Should return: HTTP 200 with Stripe pricing configuration

### Test Frontend
```bash
curl https://www.levqor.ai
curl https://levqor.ai
```
Should return: HTTP 200 with HTML

---

## COMPLETE DNS RECORD SUMMARY

| Type | Name | Content | Proxy | Purpose |
|------|------|---------|-------|---------|
| A | api | `<REPLIT_IP>` | 🔴 OFF | Backend API |
| TXT | _replit-challenge.api | `<REPLIT_TOKEN>` | N/A | Domain verification |
| CNAME | www | cname.vercel-dns.com | 🟢 ON | Frontend (www) |
| A | @ | 76.76.21.21 | 🟢 ON | Frontend (root) |
| A | @ | 76.76.21.142 | 🟢 ON | Frontend (root) |
| TXT | @ | v=spf1 -all | N/A | Email security |
| TXT | _dmarc | v=DMARC1; p=reject; rua=mailto:postmaster@levqor.ai | N/A | Email security |

---

## TROUBLESHOOTING

### Issue: "Verification Failed" in Replit
**Cause**: DNS hasn't propagated yet
**Solution**: Wait 5-30 minutes and click "Verify" again

### Issue: SSL Certificate Error
**Cause**: Cloudflare proxy is ON for api.levqor.ai
**Solution**: Turn proxy OFF (DNS-only mode) and wait 10 minutes

### Issue: 404 Errors on api.levqor.ai
**Cause**: Deployment not active or DNS not verified
**Solution**: 
1. Verify deployment is running in Replit
2. Confirm domain shows "Verified" status
3. Check DNS propagation: `nslookup api.levqor.ai`

### Issue: Frontend not loading
**Cause**: Vercel domain not configured
**Solution**: 
1. Go to Vercel project settings → Domains
2. Add `www.levqor.ai` and `levqor.ai`
3. Verify DNS records match above

---

## DNS PROPAGATION CHECK

After adding records, check propagation:

```bash
# Check A record
nslookup api.levqor.ai

# Check TXT record
nslookup -type=TXT _replit-challenge.api.levqor.ai

# Check www CNAME
nslookup www.levqor.ai
```

Expected results:
- `api.levqor.ai` → IP from Replit
- `_replit-challenge.api.levqor.ai` → TXT token
- `www.levqor.ai` → cname.vercel-dns.com

---

## CRITICAL CHECKLIST

Before marking as complete, verify:

- [ ] Got A record IP from Replit deployment panel
- [ ] Got TXT token from Replit deployment panel
- [ ] Added A record for `api` with Proxy OFF
- [ ] Added TXT record for `_replit-challenge.api`
- [ ] Added CNAME for `www` → Vercel
- [ ] Added A records for `@` → Vercel IPs
- [ ] Waited 5-10 minutes for DNS propagation
- [ ] Clicked "Verify" in Replit → shows "Verified"
- [ ] SSL certificate issued (https:// works)
- [ ] API returns HTTP 200 at https://api.levqor.ai/health
- [ ] Frontend loads at https://www.levqor.ai

---

**Last Updated**: November 22, 2025
**Deployment Type**: Replit Autoscale (Backend) + Vercel (Frontend)
**DNS Provider**: Cloudflare
**SSL**: Auto-issued by Replit & Vercel

