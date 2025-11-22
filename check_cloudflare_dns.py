#!/usr/bin/env python3
"""
Check current Cloudflare DNS configuration for levqor.ai
"""

import os
import sys
import requests
from typing import Dict, List

def check_dns():
    """Check current DNS records"""
    api_token = os.environ.get('CLOUDFLARE_API_TOKEN')
    zone_id = os.environ.get('CLOUDFLARE_ZONE_ID')
    
    if not all([api_token, zone_id]):
        print("❌ ERROR: Missing Cloudflare credentials")
        print("Required secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID")
        sys.exit(1)
    
    base_url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    print("\n" + "="*70)
    print("📊 CURRENT CLOUDFLARE DNS RECORDS FOR LEVQOR.AI")
    print("="*70)
    
    response = requests.get(base_url, headers=headers)
    response.raise_for_status()
    records = response.json()['result']
    
    print(f"\n✅ Found {len(records)} DNS records\n")
    
    # Group records by type
    backend_records = []
    frontend_records = []
    email_records = []
    other_records = []
    
    for record in records:
        name = record['name']
        if 'api.levqor.ai' in name or '_replit-challenge' in name:
            backend_records.append(record)
        elif name in ['www.levqor.ai', 'levqor.ai']:
            frontend_records.append(record)
        elif any(x in name for x in ['_dmarc', 'spf', '_domainkey']):
            email_records.append(record)
        else:
            other_records.append(record)
    
    # Display backend records
    if backend_records:
        print("🔧 BACKEND (api.levqor.ai):")
        for r in backend_records:
            proxy = "🟢 Proxied" if r.get('proxied') else "🔴 DNS Only"
            print(f"  {r['type']:6} {r['name']:40} → {r['content']:50} {proxy}")
    else:
        print("🔧 BACKEND (api.levqor.ai):")
        print("  ⚠️  No records found - needs configuration!")
    
    # Display frontend records
    print("\n🌐 FRONTEND (www & root):")
    if frontend_records:
        for r in frontend_records:
            proxy = "🟢 Proxied" if r.get('proxied') else "🔴 DNS Only"
            name_display = "@" if r['name'] == 'levqor.ai' else r['name']
            print(f"  {r['type']:6} {name_display:40} → {r['content']:50} {proxy}")
    else:
        print("  ⚠️  No records found")
    
    # Display email records
    if email_records:
        print("\n📧 EMAIL SECURITY:")
        for r in email_records:
            name_display = r['name'].replace('.levqor.ai', '')
            if name_display == 'levqor.ai':
                name_display = '@'
            content_short = r['content'][:60] + '...' if len(r['content']) > 60 else r['content']
            print(f"  {r['type']:6} {name_display:40} → {content_short}")
    
    # Display other records
    if other_records:
        print("\n🔍 OTHER RECORDS:")
        for r in other_records:
            print(f"  {r['type']:6} {r['name']:40} → {r['content'][:50]}")
    
    # Analysis
    print("\n" + "="*70)
    print("🔍 ANALYSIS")
    print("="*70)
    
    has_api_a = any(r['type'] == 'A' and r['name'] == 'api.levqor.ai' for r in backend_records)
    has_api_txt = any(r['type'] == 'TXT' and '_replit-challenge.api' in r['name'] for r in backend_records)
    has_api_cname = any(r['type'] == 'CNAME' and r['name'] == 'api.levqor.ai' for r in backend_records)
    
    api_proxied = any(r['type'] == 'A' and r['name'] == 'api.levqor.ai' and r.get('proxied') for r in backend_records)
    
    has_www = any(r['type'] == 'CNAME' and r['name'] == 'www.levqor.ai' for r in frontend_records)
    has_root = any(r['type'] == 'A' and r['name'] == 'levqor.ai' for r in frontend_records)
    
    print("\n✅ = Correct | ⚠️ = Missing | ❌ = Wrong Configuration\n")
    
    if has_api_a:
        if api_proxied:
            print("❌ api.levqor.ai A record: EXISTS but PROXIED (should be DNS only)")
        else:
            print("✅ api.levqor.ai A record: EXISTS and DNS only")
    else:
        if has_api_cname:
            print("❌ api.levqor.ai: Using CNAME (Replit requires A record)")
        else:
            print("⚠️  api.levqor.ai A record: MISSING")
    
    if has_api_txt:
        print("✅ Replit verification TXT: EXISTS")
    else:
        print("⚠️  Replit verification TXT: MISSING")
    
    if has_www:
        print("✅ www.levqor.ai CNAME: EXISTS")
    else:
        print("⚠️  www.levqor.ai CNAME: MISSING")
    
    if has_root:
        print("✅ levqor.ai root A records: EXISTS")
    else:
        print("⚠️  levqor.ai root A records: MISSING")
    
    # Recommendations
    print("\n" + "="*70)
    print("💡 RECOMMENDATIONS")
    print("="*70)
    
    needs_config = False
    
    if not has_api_a:
        print("\n🔧 Run: python3 configure_cloudflare_dns.py")
        print("   This will automatically configure all required DNS records")
        needs_config = True
    elif api_proxied:
        print("\n⚠️  CRITICAL: api.levqor.ai proxy must be turned OFF")
        print("   1. Go to Cloudflare DNS settings")
        print("   2. Click the orange cloud next to api.levqor.ai")
        print("   3. Change to grey cloud (DNS only)")
        needs_config = True
    
    if has_api_cname:
        print("\n❌ CONFLICT: api.levqor.ai has CNAME record")
        print("   Replit requires A record, not CNAME")
        print("   Run: python3 configure_cloudflare_dns.py (will fix this)")
        needs_config = True
    
    if not has_api_txt:
        print("\n⚠️  Missing Replit verification TXT record")
        print("   Run: python3 configure_cloudflare_dns.py")
        needs_config = True
    
    if not needs_config and has_api_a and has_api_txt and not api_proxied:
        print("\n✅ DNS configuration looks correct!")
        print("\n📋 Next steps:")
        print("1. Make sure backend is deployed in Replit")
        print("2. Go to Replit → Deployments → Domains")
        print("3. Click 'Verify' next to api.levqor.ai")
        print("4. Test: curl https://api.levqor.ai/health")
    
    print("\n" + "="*70)


if __name__ == "__main__":
    try:
        check_dns()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
