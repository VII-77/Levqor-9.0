#!/usr/bin/env python3
"""
Non-interactive Cloudflare DNS configuration
Usage: python3 configure_dns_with_values.py <REPLIT_IP> <REPLIT_TXT_TOKEN>
"""

import os
import sys
import requests

if len(sys.argv) != 3:
    print("\n" + "="*70)
    print("❌ ERROR: Missing DNS values")
    print("="*70)
    print("\nUsage:")
    print("  python3 configure_dns_with_values.py <REPLIT_IP> <TXT_TOKEN>\n")
    print("Example:")
    print("  python3 configure_dns_with_values.py 34.123.45.67 replit-verify-abc123...\n")
    print("Get these values from:")
    print("  1. Deploy backend in Replit (click Deploy button)")
    print("  2. Go to: Deployments → Settings → Domains")
    print("  3. Enter: api.levqor.ai")
    print("  4. Copy the IP and TXT token shown\n")
    sys.exit(1)

replit_ip = sys.argv[1]
replit_txt = sys.argv[2]

# Initialize Cloudflare API
api_token = os.environ.get('CLOUDFLARE_API_TOKEN')
zone_id = os.environ.get('CLOUDFLARE_ZONE_ID')

if not all([api_token, zone_id]):
    print("❌ ERROR: Missing Cloudflare credentials")
    sys.exit(1)

base_url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

print("\n" + "="*70)
print("🔧 CLOUDFLARE DNS CONFIGURATION")
print("="*70)
print(f"\n✅ Replit IP: {replit_ip}")
print(f"✅ TXT Token: {replit_txt[:30]}...")
print(f"✅ Connected to Cloudflare API")

# Get existing records
response = requests.get(base_url, headers=headers)
response.raise_for_status()
records = response.json()['result']

print("\n" + "="*70)
print("STEP 1: CLEAN UP CONFLICTING RECORDS")
print("="*70)

# Delete old api.levqor.ai records
deleted = 0
for record in records:
    if record['name'] == 'api.levqor.ai' or '_replit-challenge.api' in record['name']:
        resp = requests.delete(f"{base_url}/{record['id']}", headers=headers)
        if resp.status_code == 200:
            print(f"  ✅ Deleted: {record['type']} {record['name']}")
            deleted += 1

if deleted == 0:
    print("  ℹ️  No conflicting records found")

print("\n" + "="*70)
print("STEP 2: CREATE DNS RECORDS")
print("="*70)

success = 0
total = 0

# Backend A record
print("\n🔧 Backend API:")
total += 1
resp = requests.post(base_url, headers=headers, json={
    "type": "A",
    "name": "api.levqor.ai",
    "content": replit_ip,
    "proxied": False,
    "ttl": 1
})
if resp.status_code == 200:
    print(f"  ✅ Created: A api.levqor.ai → {replit_ip} (🔴 DNS Only)")
    success += 1
else:
    print(f"  ❌ Failed: A record")
    print(f"     {resp.json()}")

# Backend TXT record
total += 1
resp = requests.post(base_url, headers=headers, json={
    "type": "TXT",
    "name": "_replit-challenge.api.levqor.ai",
    "content": replit_txt,
    "proxied": False,
    "ttl": 1
})
if resp.status_code == 200:
    print(f"  ✅ Created: TXT _replit-challenge.api → {replit_txt[:30]}...")
    success += 1
else:
    print(f"  ❌ Failed: TXT record")
    print(f"     {resp.json()}")

# Frontend records
print("\n🔧 Frontend:")

# www CNAME
www_exists = any(r['name'] == 'www.levqor.ai' and r['type'] == 'CNAME' for r in records)
if not www_exists:
    total += 1
    resp = requests.post(base_url, headers=headers, json={
        "type": "CNAME",
        "name": "www.levqor.ai",
        "content": "cname.vercel-dns.com",
        "proxied": True,
        "ttl": 1
    })
    if resp.status_code == 200:
        print(f"  ✅ Created: CNAME www → cname.vercel-dns.com (🟢 Proxied)")
        success += 1
else:
    print("  ℹ️  CNAME www already exists")

# Root A records for Vercel
vercel_ips = ["76.76.21.21", "76.76.21.142"]
existing_root = [r['content'] for r in records if r['name'] == 'levqor.ai' and r['type'] == 'A']

for ip in vercel_ips:
    if ip not in existing_root:
        total += 1
        resp = requests.post(base_url, headers=headers, json={
            "type": "A",
            "name": "levqor.ai",
            "content": ip,
            "proxied": True,
            "ttl": 1
        })
        if resp.status_code == 200:
            print(f"  ✅ Created: A @ → {ip} (🟢 Proxied)")
            success += 1
    else:
        print(f"  ℹ️  A @ → {ip} already exists")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print(f"\n📊 Successfully configured {success}/{total} new records")
print("\n✅ DNS configuration complete!")
print("\n⏳ Next steps:")
print("1. Wait 5-10 minutes for DNS propagation")
print("2. Go to Replit → Deployments → Domains")
print("3. Click 'Verify' next to api.levqor.ai")
print("4. Test: curl https://api.levqor.ai/health")
print("\n" + "="*70 + "\n")
