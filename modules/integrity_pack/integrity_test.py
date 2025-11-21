"""
Integrity Test Engine
Runs E2E verification of workflows, DB writes, external API calls
Produces JSON summary of test results
"""
import os
import sys
import time
import json
import requests
import sqlite3
from datetime import datetime
from typing import Dict, List, Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))


class IntegrityTester:
    """E2E integrity verification for Levqor platform"""
    
    def __init__(self):
        self.results = []
        self.start_time = None
        self.end_time = None
        
    def run_all_tests(self) -> Dict[str, Any]:
        """Run complete integrity test suite"""
        self.start_time = datetime.utcnow()
        
        print("🔍 Starting Integrity Test Suite...")
        
        # Test categories
        self.test_backend_health()
        self.test_database_connectivity()
        self.test_external_apis()
        self.test_workflow_execution()
        self.test_security_headers()
        
        self.end_time = datetime.utcnow()
        
        return self.generate_summary()
    
    def test_backend_health(self):
        """Test all backend health endpoints"""
        print("\n📋 Testing Backend Health Endpoints...")
        
        endpoints = [
            {"name": "Main Health", "url": "https://api.levqor.ai/health"},
            {"name": "Public Metrics", "url": "https://api.levqor.ai/public/metrics"},
            {"name": "Ops Uptime", "url": "https://api.levqor.ai/ops/uptime"},
            {"name": "Queue Health", "url": "https://api.levqor.ai/ops/queue_health"},
            {"name": "Billing Health", "url": "https://api.levqor.ai/billing/health"},
        ]
        
        for endpoint in endpoints:
            start = time.time()
            try:
                response = requests.get(endpoint["url"], timeout=10)
                latency = int((time.time() - start) * 1000)
                
                result = {
                    "test": f"Backend: {endpoint['name']}",
                    "category": "backend_health",
                    "status": "passed" if response.status_code == 200 else "failed",
                    "latency_ms": latency,
                    "status_code": response.status_code,
                    "timestamp": datetime.utcnow().isoformat(),
                }
                
                if response.status_code == 200:
                    print(f"  ✅ {endpoint['name']}: OK ({latency}ms)")
                else:
                    print(f"  ❌ {endpoint['name']}: HTTP {response.status_code}")
                    result["error"] = f"HTTP {response.status_code}"
                
                self.results.append(result)
                
            except Exception as e:
                print(f"  ❌ {endpoint['name']}: {str(e)}")
                self.results.append({
                    "test": f"Backend: {endpoint['name']}",
                    "category": "backend_health",
                    "status": "failed",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                })
    
    def test_database_connectivity(self):
        """Test database connectivity and operations"""
        print("\n📋 Testing Database Connectivity...")
        
        db_path = os.getenv("DATABASE_URL", "levqor.db")
        
        # For SQLite
        if db_path.startswith("sqlite") or db_path.endswith(".db"):
            db_file = db_path.replace("sqlite:///", "")
            try:
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                
                # Test read
                cursor.execute("SELECT COUNT(*) FROM users")
                user_count = cursor.fetchone()[0]
                
                print(f"  ✅ Database Read: {user_count} users")
                self.results.append({
                    "test": "Database: Read Users",
                    "category": "database",
                    "status": "passed",
                    "user_count": user_count,
                    "timestamp": datetime.utcnow().isoformat(),
                })
                
                # Test tables exist
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in cursor.fetchall()]
                
                required_tables = ["users", "sessions", "referrals"]
                missing = [t for t in required_tables if t not in tables]
                
                if not missing:
                    print(f"  ✅ Schema Validation: All tables exist")
                    self.results.append({
                        "test": "Database: Schema Validation",
                        "category": "database",
                        "status": "passed",
                        "tables": tables,
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                else:
                    print(f"  ❌ Schema Validation: Missing tables {missing}")
                    self.results.append({
                        "test": "Database: Schema Validation",
                        "category": "database",
                        "status": "failed",
                        "error": f"Missing tables: {missing}",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                
                conn.close()
                
            except Exception as e:
                print(f"  ❌ Database Connection: {str(e)}")
                self.results.append({
                    "test": "Database: Connectivity",
                    "category": "database",
                    "status": "failed",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                })
    
    def test_external_apis(self):
        """Test external API integrations"""
        print("\n📋 Testing External API Integrations...")
        
        # Test Stripe
        stripe_key = os.getenv("STRIPE_SECRET_KEY", "").strip()
        if stripe_key and stripe_key.startswith("sk_"):
            try:
                headers = {"Authorization": f"Bearer {stripe_key}"}
                response = requests.get("https://api.stripe.com/v1/balance", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    print("  ✅ Stripe API: Connected")
                    self.results.append({
                        "test": "External API: Stripe",
                        "category": "external_api",
                        "status": "passed",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                else:
                    print(f"  ❌ Stripe API: HTTP {response.status_code}")
                    self.results.append({
                        "test": "External API: Stripe",
                        "category": "external_api",
                        "status": "failed",
                        "error": f"HTTP {response.status_code}",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
            except Exception as e:
                print(f"  ❌ Stripe API: {str(e)}")
                self.results.append({
                    "test": "External API: Stripe",
                    "category": "external_api",
                    "status": "failed",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                })
        else:
            print("  ⚠️  Stripe API: Not configured")
            self.results.append({
                "test": "External API: Stripe",
                "category": "external_api",
                "status": "skipped",
                "reason": "API key not configured",
                "timestamp": datetime.utcnow().isoformat(),
            })
    
    def test_workflow_execution(self):
        """Test workflow execution capabilities"""
        print("\n📋 Testing Workflow Execution...")
        
        # Test scheduler status
        try:
            from monitors.scheduler import get_scheduler
            
            scheduler = get_scheduler()
            if scheduler and scheduler.running:
                jobs = scheduler.get_jobs()
                print(f"  ✅ APScheduler: {len(jobs)} jobs running")
                self.results.append({
                    "test": "Workflow: APScheduler Status",
                    "category": "workflow",
                    "status": "passed",
                    "job_count": len(jobs),
                    "timestamp": datetime.utcnow().isoformat(),
                })
            else:
                print("  ❌ APScheduler: Not running")
                self.results.append({
                    "test": "Workflow: APScheduler Status",
                    "category": "workflow",
                    "status": "failed",
                    "error": "Scheduler not running",
                    "timestamp": datetime.utcnow().isoformat(),
                })
        except Exception as e:
            print(f"  ❌ Workflow Test: {str(e)}")
            self.results.append({
                "test": "Workflow: APScheduler Status",
                "category": "workflow",
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            })
    
    def test_security_headers(self):
        """Test security headers on frontend"""
        print("\n📋 Testing Security Headers...")
        
        try:
            response = requests.get("https://levqor.ai", timeout=10)
            headers = response.headers
            
            security_checks = {
                "Strict-Transport-Security": "HSTS",
                "X-Content-Type-Options": "Content Type Protection",
                "X-Frame-Options": "Clickjacking Protection",
            }
            
            for header, name in security_checks.items():
                if header in headers:
                    print(f"  ✅ {name}: Present")
                    self.results.append({
                        "test": f"Security: {name}",
                        "category": "security",
                        "status": "passed",
                        "header": header,
                        "value": headers[header],
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                else:
                    print(f"  ⚠️  {name}: Missing")
                    self.results.append({
                        "test": f"Security: {name}",
                        "category": "security",
                        "status": "warning",
                        "header": header,
                        "reason": "Header not present",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
        except Exception as e:
            print(f"  ❌ Security Headers Test: {str(e)}")
            self.results.append({
                "test": "Security: Headers Check",
                "category": "security",
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            })
    
    def generate_summary(self) -> Dict[str, Any]:
        """Generate JSON summary of test results"""
        passed = sum(1 for r in self.results if r["status"] == "passed")
        failed = sum(1 for r in self.results if r["status"] == "failed")
        warnings = sum(1 for r in self.results if r["status"] == "warning")
        skipped = sum(1 for r in self.results if r["status"] == "skipped")
        total = len(self.results)
        
        duration = (self.end_time - self.start_time).total_seconds() if self.end_time and self.start_time else 0
        
        summary = {
            "test_run_id": f"integrity_{int(time.time())}",
            "timestamp": self.start_time.isoformat() if self.start_time else None,
            "duration_seconds": round(duration, 2),
            "summary": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "warnings": warnings,
                "skipped": skipped,
                "success_rate": round((passed / total * 100) if total > 0 else 0, 2),
            },
            "results": self.results,
            "platform": {
                "backend": "api.levqor.ai",
                "frontend": "levqor.ai",
                "database": "PostgreSQL/SQLite",
            }
        }
        
        print(f"\n" + "="*60)
        print(f"📊 INTEGRITY TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"⏭️  Skipped: {skipped}")
        print(f"Success Rate: {summary['summary']['success_rate']}%")
        print(f"Duration: {duration:.2f}s")
        print("="*60)
        
        return summary


if __name__ == "__main__":
    tester = IntegrityTester()
    summary = tester.run_all_tests()
    
    # Save to file
    output_file = f"integrity_report_{int(time.time())}.json"
    with open(output_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Report saved to: {output_file}")
    
    # Exit with error code if tests failed
    exit_code = 0 if summary["summary"]["failed"] == 0 else 1
    exit(exit_code)
