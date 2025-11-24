import hashlib
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


def compute_file_checksum(file_path: str) -> str:
    try:
        with open(file_path, "rb") as f:
            file_hash = hashlib.sha256()
            while chunk := f.read(8192):
                file_hash.update(chunk)
            return file_hash.hexdigest()
    except FileNotFoundError:
        logger.warning(f"compute_file_checksum: file not found: {file_path}")
        return ""
    except Exception as e:
        logger.error(f"compute_file_checksum error for {file_path}: {e}")
        return ""


def compute_config_checksum(config_paths: List[str]) -> Dict[str, str]:
    checksums = {}
    
    for path in config_paths:
        checksum = compute_file_checksum(path)
        if checksum:
            checksums[path] = checksum
    
    return checksums


def verify_checksums(stored: Dict[str, str], current: Dict[str, str]) -> List[str]:
    changed_files = []
    
    for path, stored_checksum in stored.items():
        current_checksum = current.get(path, "")
        
        if not current_checksum:
            logger.warning(f"verify_checksums: file missing: {path}")
            changed_files.append(path)
        elif stored_checksum != current_checksum:
            logger.warning(f"verify_checksums: checksum mismatch: {path}")
            changed_files.append(path)
    
    for path in current.keys():
        if path not in stored:
            logger.info(f"verify_checksums: new file detected: {path}")
    
    return changed_files
