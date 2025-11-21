"""
Finalizer - Schema & Environment Validation
Validates schema integrity, environment secrets, webhook endpoints
"""
import os
import json
import requests
from typing import Dict, List, Any
from datetime import datetime


class Finalizer:
    """Validates configuration and deployment readiness"""
    
    def __init__(self):
        self.validations = []
        
    def validate_all(self) -> Dict[str, Any]:
        """Run all validation checks"""
        print("🔍 Running Finalizer Validation...")
        
        self.validate_environment_secrets()
        self.validate_database_schema()
        self.validate_webhook_endpoints()
        self.validate_deployment_config()
        
        return self.generate_report()
    
    def validate_environment_secrets(self):
        """Validate required environment variables and secrets"""
        print("\n📋 Validating Environment Secrets...")
        
        required_secrets = [
            ("JWT_SECRET", "Authentication"),
            ("SESSION_SECRET", "Session Management"),
            ("STRIPE_SECRET_KEY", "Payment Processing"),
            ("STRIPE_WEBHOOK_SECRET", "Stripe Webhooks"),
            ("RESEND_API_KEY", "Email Service"),
        ]
        
        optional_secrets = [
            ("SENTRY_DSN", "Error Tracking"),
            ("SLACK_WEBHOOK_URL", "Slack Notifications"),
            ("TELEGRAM_BOT_TOKEN", "Telegram Notifications"),
        ]
        
        for secret_name, purpose in required_secrets:
            value = os.getenv(secret_name, "").strip()
            
            if value and len(value) > 10:
                print(f"  ✅ {secret_name}: Configured")
                self.validations.append({
                    "check": f"Secret: {secret_name}",
                    "category": "environment",
                    "status": "passed",
                    "purpose": purpose,
                    "timestamp": datetime.utcnow().isoformat(),
                })
            else:
                print(f"  ❌ {secret_name}: Missing or invalid")
                self.validations.append({
                    "check": f"Secret: {secret_name}",
                    "category": "environment",
                    "status": "failed",
                    "purpose": purpose,
                    "error": "Secret not configured or too short",
                    "timestamp": datetime.utcnow().isoformat(),
                })
        
        for secret_name, purpose in optional_secrets:
            value = os.getenv(secret_name, "").strip()
            
            if value:
                print(f"  ✅ {secret_name}: Configured (optional)")
                self.validations.append({
                    "check": f"Secret: {secret_name}",
                    "category": "environment",
                    "status": "passed",
                    "purpose": purpose,
                    "optional": True,
                    "timestamp": datetime.utcnow().isoformat(),
                })
            else:
                print(f"  ⚠️  {secret_name}: Not configured (optional)")
                self.validations.append({
                    "check": f"Secret: {secret_name}",
                    "category": "environment",
                    "status": "warning",
                    "purpose": purpose,
                    "optional": True,
                    "reason": "Optional secret not configured",
                    "timestamp": datetime.utcnow().isoformat(),
                })
    
    def validate_database_schema(self):
        """Validate database schema integrity"""
        print("\n📋 Validating Database Schema...")
        
        try:
            import sqlite3
            
            db_path = os.getenv("DATABASE_URL", "levqor.db")
            if db_path.startswith("sqlite") or db_path.endswith(".db"):
                db_file = db_path.replace("sqlite:///", "")
                
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                
                # Check required tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in cursor.fetchall()]
                
                required_tables = {
                    "users": "User management",
                    "sessions": "Session tracking",
                    "referrals": "Referral tracking",
                    "kv": "Key-value store",
                }
                
                for table, purpose in required_tables.items():
                    if table in tables:
                        # Check row count
                        cursor.execute(f"SELECT COUNT(*) FROM {table}")
                        count = cursor.fetchone()[0]
                        
                        print(f"  ✅ Table '{table}': Present ({count} rows)")
                        self.validations.append({
                            "check": f"Schema: {table} table",
                            "category": "database",
                            "status": "passed",
                            "purpose": purpose,
                            "row_count": count,
                            "timestamp": datetime.utcnow().isoformat(),
                        })
                    else:
                        print(f"  ❌ Table '{table}': Missing")
                        self.validations.append({
                            "check": f"Schema: {table} table",
                            "category": "database",
                            "status": "failed",
                            "purpose": purpose,
                            "error": "Table not found",
                            "timestamp": datetime.utcnow().isoformat(),
                        })
                
                conn.close()
                
        except Exception as e:
            print(f"  ❌ Schema Validation: {str(e)}")
            self.validations.append({
                "check": "Schema: Database Access",
                "category": "database",
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            })
    
    def validate_webhook_endpoints(self):
        """Validate webhook endpoint configuration"""
        print("\n📋 Validating Webhook Endpoints...")
        
        # Check Stripe webhook secret
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
        
        if webhook_secret and webhook_secret.startswith("whsec_"):
            print("  ✅ Stripe Webhook Secret: Valid format")
            self.validations.append({
                "check": "Webhook: Stripe Secret Format",
                "category": "webhooks",
                "status": "passed",
                "timestamp": datetime.utcnow().isoformat(),
            })
        else:
            print("  ❌ Stripe Webhook Secret: Invalid or missing")
            self.validations.append({
                "check": "Webhook: Stripe Secret Format",
                "category": "webhooks",
                "status": "failed",
                "error": "Webhook secret invalid or not configured",
                "timestamp": datetime.utcnow().isoformat(),
            })
        
        # Test webhook endpoint accessibility (if deployed)
        try:
            response = requests.post(
                "https://api.levqor.ai/api/webhooks/stripe",
                json={},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            # Expect 400 or 401 (unauthorized) not 404
            if response.status_code in [400, 401]:
                print("  ✅ Stripe Webhook Endpoint: Accessible")
                self.validations.append({
                    "check": "Webhook: Endpoint Accessibility",
                    "category": "webhooks",
                    "status": "passed",
                    "timestamp": datetime.utcnow().isoformat(),
                })
            elif response.status_code == 404:
                print("  ❌ Stripe Webhook Endpoint: Not found")
                self.validations.append({
                    "check": "Webhook: Endpoint Accessibility",
                    "category": "webhooks",
                    "status": "failed",
                    "error": "Webhook endpoint returns 404",
                    "timestamp": datetime.utcnow().isoformat(),
                })
            else:
                print(f"  ⚠️  Stripe Webhook Endpoint: Unexpected status {response.status_code}")
                self.validations.append({
                    "check": "Webhook: Endpoint Accessibility",
                    "category": "webhooks",
                    "status": "warning",
                    "status_code": response.status_code,
                    "timestamp": datetime.utcnow().isoformat(),
                })
                
        except Exception as e:
            print(f"  ⚠️  Webhook Endpoint Test: {str(e)}")
            self.validations.append({
                "check": "Webhook: Endpoint Accessibility",
                "category": "webhooks",
                "status": "warning",
                "reason": "Unable to test endpoint",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            })
    
    def validate_deployment_config(self):
        """Validate deployment configuration"""
        print("\n📋 Validating Deployment Config...")
        
        # Check critical domains
        domains = [
            ("levqor.ai", "Frontend"),
            ("api.levqor.ai", "Backend API"),
        ]
        
        for domain, purpose in domains:
            try:
                response = requests.get(f"https://{domain}", timeout=10)
                
                if response.status_code == 200:
                    print(f"  ✅ {domain}: Accessible")
                    self.validations.append({
                        "check": f"Deployment: {domain}",
                        "category": "deployment",
                        "status": "passed",
                        "purpose": purpose,
                        "status_code": 200,
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                else:
                    print(f"  ⚠️  {domain}: HTTP {response.status_code}")
                    self.validations.append({
                        "check": f"Deployment: {domain}",
                        "category": "deployment",
                        "status": "warning",
                        "purpose": purpose,
                        "status_code": response.status_code,
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                    
            except Exception as e:
                print(f"  ❌ {domain}: {str(e)}")
                self.validations.append({
                    "check": f"Deployment: {domain}",
                    "category": "deployment",
                    "status": "failed",
                    "purpose": purpose,
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                })
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate validation report"""
        passed = sum(1 for v in self.validations if v["status"] == "passed")
        failed = sum(1 for v in self.validations if v["status"] == "failed")
        warnings = sum(1 for v in self.validations if v["status"] == "warning")
        total = len(self.validations)
        
        report = {
            "validation_id": f"finalizer_{int(datetime.utcnow().timestamp())}",
            "timestamp": datetime.utcnow().isoformat(),
            "summary": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "warnings": warnings,
                "success_rate": round((passed / total * 100) if total > 0 else 0, 2),
                "deployment_ready": failed == 0,
            },
            "validations": self.validations,
        }
        
        print(f"\n" + "="*60)
        print(f"📊 FINALIZER VALIDATION REPORT")
        print("="*60)
        print(f"Total Checks: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"Deployment Ready: {'YES' if report['summary']['deployment_ready'] else 'NO'}")
        print("="*60)
        
        return report


if __name__ == "__main__":
    finalizer = Finalizer()
    report = finalizer.validate_all()
    
    # Save to file
    output_file = f"finalizer_report_{int(datetime.utcnow().timestamp())}.json"
    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n💾 Report saved to: {output_file}")
    
    # Exit with error if not deployment ready
    exit_code = 0 if report["summary"]["deployment_ready"] else 1
    exit(exit_code)
