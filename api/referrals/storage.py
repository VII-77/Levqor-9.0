"""
Referral Storage Module - HYPERGROWTH CYCLE 6
Safe JSON Lines storage for referral invites (no DB changes)
"""
import json
import os
import tempfile
import logging
from typing import List, Dict

log = logging.getLogger("levqor.referrals.storage")

REFERRALS_FILE = os.path.join(os.getcwd(), "workspace-data", "referrals", "referrals.jsonl")


def _mask_email(email: str) -> str:
    """Mask email for logging (PII protection)."""
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) <= 3:
        return f"{local[0]}***@{domain}"
    return f"{local[:3]}***@{domain}"


def get_referrals_for_email(email: str) -> List[Dict]:
    """
    Get all referrals created by a specific referrer email.
    
    Args:
        email: Referrer email address
    
    Returns:
        List of referral records for this referrer
    """
    if not os.path.exists(REFERRALS_FILE):
        return []
    
    referrals = []
    try:
        with open(REFERRALS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        if record.get('referrer_email') == email:
                            referrals.append(record)
                    except json.JSONDecodeError:
                        log.warning(f"Skipping malformed line in {REFERRALS_FILE}")
    except Exception as e:
        log.error(f"Error reading referrals for {_mask_email(email)}: {e}")
    
    return referrals


def append_referral(referral: Dict) -> None:
    """
    Append a new referral record atomically.
    
    Args:
        referral: Referral record dict with fields:
            - id, referrer_email, invited_email, created_at, source, status
    """
    os.makedirs(os.path.dirname(REFERRALS_FILE), exist_ok=True)
    
    # Read existing submissions
    existing = []
    if os.path.exists(REFERRALS_FILE):
        try:
            with open(REFERRALS_FILE, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        existing.append(json.loads(line))
        except Exception as read_error:
            log.warning(f"Could not read existing referrals: {read_error}")
    
    # Append new referral
    existing.append(referral)
    
    # Atomic write: temp file + fsync + rename (Omega standard)
    dir_path = os.path.dirname(REFERRALS_FILE)
    temp_fd, temp_path = tempfile.mkstemp(dir=dir_path, suffix=".tmp")
    try:
        with os.fdopen(temp_fd, 'w', encoding='utf-8') as f:
            for record in existing:
                f.write(json.dumps(record) + '\n')
            f.flush()
            os.fsync(f.fileno())
        os.rename(temp_path, REFERRALS_FILE)
        log.info(f"Referral appended: {_mask_email(referral.get('referrer_email', ''))} -> {_mask_email(referral.get('invited_email', ''))}")
    except Exception as write_error:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        log.error(f"Failed to write referral: {write_error}")
        raise write_error


def get_referral_stats() -> Dict:
    """
    Get global referral statistics.
    
    Returns:
        Dict with:
            - total_referrals: total count
            - unique_referrers: count of unique referrer emails
    """
    if not os.path.exists(REFERRALS_FILE):
        return {
            "total_referrals": 0,
            "unique_referrers": 0
        }
    
    referrers = set()
    total = 0
    
    try:
        with open(REFERRALS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        total += 1
                        if 'referrer_email' in record:
                            referrers.add(record['referrer_email'])
                    except json.JSONDecodeError:
                        log.warning("Skipping malformed line in referrals file")
    except Exception as e:
        log.error(f"Error reading referral stats: {e}")
    
    return {
        "total_referrals": total,
        "unique_referrers": len(referrers)
    }
