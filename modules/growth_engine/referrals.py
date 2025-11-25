"""
Growth Engine Referrals - MEGA PHASE v11-v14
Provides referral code generation and tracking
Uses JSONL file storage (consistent with existing referrals pattern)
"""
import os
import json
import time
import hashlib
import tempfile
import logging
from typing import Dict, List, Optional

log = logging.getLogger("levqor.growth_engine.referrals")

REFERRAL_CODES_FILE = os.path.join(os.getcwd(), "workspace-data", "growth", "referral_codes.jsonl")
REFERRAL_CONVERSIONS_FILE = os.path.join(os.getcwd(), "workspace-data", "growth", "referral_conversions.jsonl")


def _ensure_dirs():
    os.makedirs(os.path.dirname(REFERRAL_CODES_FILE), exist_ok=True)


def generate_referral_code(user_id: str) -> str:
    existing = get_user_referral_code(user_id)
    if existing:
        return existing
    
    hash_input = f"{user_id}:{time.time()}:levqor"
    code = hashlib.sha256(hash_input.encode()).hexdigest()[:8].upper()
    
    _ensure_dirs()
    
    record = {
        "user_id": user_id,
        "code": code,
        "created_at": time.time(),
        "uses": 0,
        "conversions": 0
    }
    
    _append_jsonl(REFERRAL_CODES_FILE, record)
    
    log.info(f"Generated referral code {code} for user {user_id[:8]}...")
    return code


def get_user_referral_code(user_id: str) -> Optional[str]:
    if not os.path.exists(REFERRAL_CODES_FILE):
        return None
    
    try:
        with open(REFERRAL_CODES_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        if record.get('user_id') == user_id:
                            return record.get('code')
                    except json.JSONDecodeError:
                        pass
    except Exception as e:
        log.error(f"Error reading referral codes: {e}")
    
    return None


def get_code_info(code: str) -> Optional[Dict]:
    if not os.path.exists(REFERRAL_CODES_FILE):
        return None
    
    try:
        with open(REFERRAL_CODES_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        if record.get('code') == code.upper():
                            return record
                    except json.JSONDecodeError:
                        pass
    except Exception as e:
        log.error(f"Error reading referral code info: {e}")
    
    return None


def record_referral(code: str, new_user_id: str) -> bool:
    code_info = get_code_info(code)
    if not code_info:
        log.warning(f"Referral code not found: {code}")
        return False
    
    _ensure_dirs()
    
    conversion = {
        "code": code.upper(),
        "referrer_user_id": code_info.get('user_id'),
        "new_user_id": new_user_id,
        "created_at": time.time(),
        "status": "pending"
    }
    
    _append_jsonl(REFERRAL_CONVERSIONS_FILE, conversion)
    
    log.info(f"Recorded referral: code={code}, new_user={new_user_id[:8]}...")
    return True


def get_user_referrals(user_id: str) -> List[Dict]:
    code = get_user_referral_code(user_id)
    if not code:
        return []
    
    if not os.path.exists(REFERRAL_CONVERSIONS_FILE):
        return []
    
    conversions = []
    try:
        with open(REFERRAL_CONVERSIONS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        if record.get('referrer_user_id') == user_id:
                            conversions.append(record)
                    except json.JSONDecodeError:
                        pass
    except Exception as e:
        log.error(f"Error reading referral conversions: {e}")
    
    return conversions


def get_referral_stats(user_id: str) -> Dict:
    code = get_user_referral_code(user_id)
    conversions = get_user_referrals(user_id)
    
    return {
        "code": code,
        "total_referrals": len(conversions),
        "pending": len([c for c in conversions if c.get('status') == 'pending']),
        "converted": len([c for c in conversions if c.get('status') == 'converted']),
        "referral_url": f"https://levqor.ai/?ref={code}" if code else None
    }


def _append_jsonl(filepath: str, record: Dict):
    existing = []
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        existing.append(json.loads(line))
        except Exception as e:
            log.warning(f"Could not read existing records: {e}")
    
    existing.append(record)
    
    dir_path = os.path.dirname(filepath)
    temp_fd, temp_path = tempfile.mkstemp(dir=dir_path, suffix=".tmp")
    try:
        with os.fdopen(temp_fd, 'w', encoding='utf-8') as f:
            for rec in existing:
                f.write(json.dumps(rec) + '\n')
            f.flush()
            os.fsync(f.fileno())
        os.rename(temp_path, filepath)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        log.error(f"Failed to write record: {e}")
        raise
