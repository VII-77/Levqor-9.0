#!/usr/bin/env python3
"""
Cloudflare DNS Configuration Script for Levqor X 9.0
Automatically configures DNS records using Cloudflare API
"""

import os
import sys
import json
import requests
from typing import Dict, List, Optional

class CloudflareAPI:
    def __init__(self):
        self.api_token = os.environ.get('CLOUDFLARE_API_TOKEN')
        self.zone_id = os.environ.get('CLOUDFLARE_ZONE_ID')
        self.account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
        
        if not all([self.api_token, self.zone_id]):
            print("❌ ERROR: Missing Cloudflare credentials")
            print("Required secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID")
            sys.exit(1)
        
        self.base_url = f"https://api.cloudflare.com/client/v4/zones/{self.zone_id}/dns_records"
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    def list_records(self) -> List[Dict]:
        """List all DNS records in the zone"""
        response = requests.get(self.base_url, headers=self.headers)
        response.raise_for_status()
        return response.json()['result']
    
    def delete_record(self, record_id: str, record_name: str):
        """Delete a DNS record"""
        response = requests.delete(f"{self.base_url}/{record_id}", headers=self.headers)
        if response.status_code == 200:
            print(f"  ✅ Deleted: {record_name}")
        else:
            print(f"  ⚠️  Failed to delete: {record_name}")
    
    def create_record(self, record_type: str, name: str, content: str, 
                     proxied: bool = False, ttl: int = 1) -> bool:
        """Create a DNS record"""
        data = {
            "type": record_type,
            "name": name,
            "content": content,
            "proxied": proxied,
            "ttl": ttl
        }
        
        response = requests.post(self.base_url, headers=self.headers, json=data)
        if response.status_code == 200:
            proxy_status = "🟢 Proxied" if proxied else "🔴 DNS Only"
            print(f"  ✅ Created: {record_type} {name} → {content} ({proxy_status})")
            return True
        else:
            print(f"  ❌ Failed: {record_type} {name}")
            print(f"     Error: {response.json()}")
            return False


def get_replit_dns_values():
    """Prompt user for Replit DNS values"""
    print("\n" + "="*70)
    print("STEP 1: GET DNS VALUES FROM REPLIT")
    print("="*70)
    print("\n📋 Instructions:")
    print("1. In Replit, click the 'Deploy' button (top-right)")
    print("2. Go to: Deployments → Settings → Domains")
    print("3. Click 'Link a domain' → Enter: api.levqor.ai")
    print("4. Replit will show you:")
    print("   - A Record IP address")
    print("   - TXT verification token")
    print("\n")
    
    replit_ip = input("📝 Enter the A Record IP from Replit: ").strip()
    if not replit_ip:
        print("❌ ERROR: IP address is required")
        sys.exit(1)
    
    replit_txt = input("📝 Enter the TXT verification token from Replit: ").strip()
    if not replit_txt:
        print("❌ ERROR: TXT token is required")
        sys.exit(1)
    
    return replit_ip, replit_txt


def configure_dns():
    """Main configuration function"""
    print("\n" + "="*70)
    print("🔧 CLOUDFLARE DNS CONFIGURATION FOR LEVQOR.AI")
    print("="*70)
    
    # Initialize API
    cf = CloudflareAPI()
    print("\n✅ Connected to Cloudflare API")
    
    # Get Replit DNS values
    replit_ip, replit_txt = get_replit_dns_values()
    
    print("\n" + "="*70)
    print("STEP 2: CLEAN UP EXISTING DNS RECORDS")
    print("="*70)
    
    # List current records
    records = cf.list_records()
    print(f"\n📊 Found {len(records)} existing DNS records")
    
    # Delete conflicting records for api.levqor.ai
    print("\n🧹 Removing conflicting records for api.levqor.ai...")
    deleted_count = 0
    for record in records:
        name = record['name']
        if name == 'api.levqor.ai' or name.startswith('_replit-challenge.api'):
            cf.delete_record(record['id'], f"{record['type']} {name}")
            deleted_count += 1
    
    if deleted_count == 0:
        print("  ℹ️  No conflicting records found")
    
    print("\n" + "="*70)
    print("STEP 3: CREATE DNS RECORDS")
    print("="*70)
    
    success_count = 0
    total_count = 0
    
    # Backend records (api.levqor.ai)
    print("\n🔧 Backend API (api.levqor.ai):")
    total_count += 1
    if cf.create_record("A", "api.levqor.ai", replit_ip, proxied=False):
        success_count += 1
    
    total_count += 1
    if cf.create_record("TXT", f"_replit-challenge.api.levqor.ai", replit_txt, proxied=False):
        success_count += 1
    
    # Frontend records (www & root)
    print("\n🔧 Frontend (www.levqor.ai & levqor.ai):")
    
    # Check if www CNAME exists
    www_exists = any(r['name'] == 'www.levqor.ai' and r['type'] == 'CNAME' for r in records)
    if not www_exists:
        total_count += 1
        if cf.create_record("CNAME", "www.levqor.ai", "cname.vercel-dns.com", proxied=True):
            success_count += 1
    else:
        print("  ℹ️  CNAME www → cname.vercel-dns.com already exists")
    
    # Check if root A records exist
    root_ips = ["76.76.21.21", "76.76.21.142"]
    existing_root_ips = [r['content'] for r in records if r['name'] == 'levqor.ai' and r['type'] == 'A']
    
    for ip in root_ips:
        if ip not in existing_root_ips:
            total_count += 1
            if cf.create_record("A", "levqor.ai", ip, proxied=True):
                success_count += 1
        else:
            print(f"  ℹ️  A @ → {ip} already exists")
    
    # Email security records
    print("\n🔧 Email Security (Optional):")
    
    spf_exists = any(r['name'] == 'levqor.ai' and r['type'] == 'TXT' and 'spf1' in r['content'] for r in records)
    if not spf_exists:
        total_count += 1
        if cf.create_record("TXT", "levqor.ai", "v=spf1 -all", proxied=False):
            success_count += 1
    else:
        print("  ℹ️  SPF record already exists")
    
    dmarc_exists = any(r['name'] == '_dmarc.levqor.ai' for r in records)
    if not dmarc_exists:
        total_count += 1
        if cf.create_record("TXT", "_dmarc.levqor.ai", 
                          "v=DMARC1; p=reject; rua=mailto:postmaster@levqor.ai", 
                          proxied=False):
            success_count += 1
    else:
        print("  ℹ️  DMARC record already exists")
    
    print("\n" + "="*70)
    print("STEP 4: DNS CONFIGURATION SUMMARY")
    print("="*70)
    
    print(f"\n📊 Results: {success_count}/{total_count} records configured successfully")
    
    if success_count > 0:
        print("\n✅ DNS configuration complete!")
        print("\n⏳ Next Steps:")
        print("1. Wait 5-10 minutes for DNS propagation")
        print("2. Go to Replit → Deployments → Domains")
        print("3. Click 'Verify' next to api.levqor.ai")
        print("4. Status should change to 'Verified' ✅")
        print("5. Test: curl https://api.levqor.ai/health")
    else:
        print("\n⚠️  No new records were created (all already exist)")
    
    print("\n" + "="*70)


if __name__ == "__main__":
    try:
        configure_dns()
    except KeyboardInterrupt:
        print("\n\n❌ Configuration cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
