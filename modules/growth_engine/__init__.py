"""
Growth Engine Module - MEGA PHASE v11-v14
Provides templates and referral management for platform growth
"""
from .templates import get_starter_templates, get_template_by_id, TEMPLATE_CATEGORIES
from .referrals import generate_referral_code, record_referral, get_user_referrals

__all__ = [
    'get_starter_templates',
    'get_template_by_id',
    'TEMPLATE_CATEGORIES',
    'generate_referral_code',
    'record_referral',
    'get_user_referrals'
]
