"""
Legal Omega Auditor - File Integrity Monitoring for Legal Documents

This module ensures the integrity of legal documentation and compliance pages.
It monitors critical legal files for unauthorized modifications and maintains
an audit trail with checksum verification.

MEGA-PHASE Ω - Legal Omega Phase
"""

import os
import json
import hashlib
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

log = logging.getLogger("levqor.legal_auditor")

# Critical legal files to monitor (frontend)
MONITORED_LEGAL_FILES = [
    "levqor-site/src/app/privacy/page.tsx",
    "levqor-site/src/app/terms/page.tsx",
    "levqor-site/src/app/gdpr/page.tsx",
    "levqor-site/src/app/security/page.tsx",
    "levqor-site/src/app/dpa/page.tsx",
    "levqor-site/src/app/ai-transparency/page.tsx",
    "levqor-site/src/app/data-rights/page.tsx",
    "levqor-site/src/app/cookies/page.tsx",
    "levqor-site/src/components/CookieBanner.tsx"
]

# State file for tracking checksums
STATE_FILE = "legal_file_checksums.json"


def compute_sha256(file_path: str) -> Optional[str]:
    """Compute SHA-256 checksum of a file."""
    try:
        if not os.path.exists(file_path):
            return None
        
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        log.warning(f"Failed to compute checksum for {file_path}: {e}")
        return None


def load_checksums() -> Dict[str, str]:
    """Load previously stored checksums from state file."""
    if not os.path.exists(STATE_FILE):
        return {}
    
    try:
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        log.warning(f"Failed to load checksum state: {e}")
        return {}


def save_checksums(checksums: Dict[str, str]) -> None:
    """Save checksums to state file using atomic write pattern (Omega standard)."""
    try:
        # Atomic write pattern (omega_operator.py lines 208-228)
        temp_path = f"{STATE_FILE}.tmp"
        with open(temp_path, 'w') as f:
            json.dump(checksums, f, indent=2)
        
        # Atomic rename
        os.replace(temp_path, STATE_FILE)
    except Exception as e:
        log.error(f"Failed to save checksum state: {e}")


def audit_legal_files() -> Dict[str, Any]:
    """
    Audit all monitored legal files for changes.
    
    Returns:
        Dictionary with audit results including:
        - status: "ok" or "changes_detected"
        - files_checked: Number of files audited
        - changes: List of changed files
        - checksums: Current checksums for all files
    """
    log.info("🔒 Legal Omega Auditor: Starting file integrity check")
    
    current_checksums = {}
    previous_checksums = load_checksums()
    changes = []
    files_checked = 0
    
    for file_path in MONITORED_LEGAL_FILES:
        checksum = compute_sha256(file_path)
        if checksum is None:
            log.warning(f"⚠️  Legal file not found: {file_path}")
            continue
        
        files_checked += 1
        current_checksums[file_path] = checksum
        
        # Compare with previous checksum
        if file_path in previous_checksums:
            if previous_checksums[file_path] != checksum:
                log.warning(f"⚠️  Legal file modified: {file_path}")
                changes.append({
                    "file": file_path,
                    "previous_checksum": previous_checksums[file_path],
                    "current_checksum": checksum,
                    "timestamp": datetime.utcnow().isoformat()
                })
        else:
            log.info(f"📝 New legal file registered: {file_path}")
    
    # Save current checksums
    save_checksums(current_checksums)
    
    status = "ok" if len(changes) == 0 else "changes_detected"
    
    result = {
        "status": status,
        "files_checked": files_checked,
        "changes_detected": len(changes),
        "changes": changes,
        "checksums": current_checksums,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if status == "ok":
        log.info(f"✅ Legal Omega Auditor: All {files_checked} legal files verified")
    else:
        log.warning(f"⚠️  Legal Omega Auditor: {len(changes)} changes detected in legal files")
    
    return result


def get_legal_compliance_status() -> Dict[str, Any]:
    """
    Get compliance status for legal documentation.
    
    Returns:
        Dictionary with compliance metrics including:
        - required_pages: List of required legal pages
        - missing_pages: List of missing required pages
        - monitored_files: Number of files under monitoring
        - last_audit: Timestamp of last audit
    """
    required_pages = [
        "/privacy",
        "/terms",
        "/cookies",
        "/data-rights",
        "/gdpr",
        "/security",
        "/dpa",
        "/ai-transparency"
    ]
    
    # Check which pages exist
    existing_pages = []
    missing_pages = []
    
    for page in required_pages:
        # Convert page path to file path
        file_path = f"levqor-site/src/app{page}/page.tsx"
        if os.path.exists(file_path):
            existing_pages.append(page)
        else:
            missing_pages.append(page)
    
    # Get last audit timestamp from state file
    last_audit = None
    if os.path.exists(STATE_FILE):
        try:
            stat = os.stat(STATE_FILE)
            last_audit = datetime.fromtimestamp(stat.st_mtime).isoformat()
        except:
            pass
    
    return {
        "status": "compliant" if len(missing_pages) == 0 else "missing_pages",
        "required_pages": required_pages,
        "existing_pages": existing_pages,
        "missing_pages": missing_pages,
        "monitored_files": len(MONITORED_LEGAL_FILES),
        "last_audit": last_audit,
        "timestamp": datetime.utcnow().isoformat()
    }


def initialize_checksums() -> None:
    """
    Initialize checksum database for all legal files.
    This should be run once during deployment to establish baseline.
    """
    log.info("📝 Legal Omega Auditor: Initializing checksum baseline")
    
    checksums = {}
    for file_path in MONITORED_LEGAL_FILES:
        checksum = compute_sha256(file_path)
        if checksum:
            checksums[file_path] = checksum
            log.info(f"✅ Baseline checksum: {file_path}")
    
    save_checksums(checksums)
    log.info(f"✅ Legal Omega Auditor: Initialized {len(checksums)} file checksums")


# Run initialization if called directly
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_checksums()
    print("\n📊 Legal Compliance Status:")
    status = get_legal_compliance_status()
    print(json.dumps(status, indent=2))
    print("\n🔒 Running audit:")
    audit_result = audit_legal_files()
    print(json.dumps(audit_result, indent=2))
