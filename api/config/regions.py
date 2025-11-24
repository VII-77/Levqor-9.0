"""
Multi-Region Configuration (Logical Only)
MEGA-PHASE 10: Global operations readiness without infrastructure changes

Current deployment: Single region (eu-west)
Future support: Logical config-based multi-region (us-east, ap-south)
"""

SUPPORTED_REGIONS = ["eu-west", "us-east", "ap-south"]
DEFAULT_REGION = "eu-west"


def get_current_region():
    """
    Returns the current deployment region
    
    In production multi-region deployments, this would read from:
    - Environment variable: LEVQOR_REGION
    - Container orchestration metadata
    - Cloud provider instance metadata
    
    For now, returns DEFAULT_REGION (eu-west)
    """
    return DEFAULT_REGION


def is_supported_region(region: str) -> bool:
    """
    Check if a region code is supported
    
    Args:
        region: Region code (e.g., 'eu-west', 'us-east')
    
    Returns:
        bool: True if region is in SUPPORTED_REGIONS
    """
    return region in SUPPORTED_REGIONS


def get_region_info():
    """
    Get detailed information about the current region
    
    Returns:
        dict: Region metadata
    """
    current = get_current_region()
    
    region_details = {
        "eu-west": {
            "name": "Europe West",
            "description": "Primary EU region (London/Dublin)",
            "status": "active"
        },
        "us-east": {
            "name": "US East",
            "description": "North America East Coast (Virginia/New York)",
            "status": "planned"
        },
        "ap-south": {
            "name": "Asia Pacific South",
            "description": "Asia Pacific (Mumbai/Singapore)",
            "status": "planned"
        }
    }
    
    return {
        "code": current,
        "details": region_details.get(current, {}),
        "all_regions": SUPPORTED_REGIONS
    }
