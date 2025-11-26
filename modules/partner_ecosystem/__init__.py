"""
Partner Ecosystem Module - V10 Completion
Partner registration, dashboard, revenue sharing, templates.
"""
import time
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import uuid

log = logging.getLogger("levqor.partner_ecosystem")


class PartnerTier(str, Enum):
    AFFILIATE = "affiliate"
    CERTIFIED = "certified"
    AGENCY = "agency"
    ENTERPRISE = "enterprise"


class PartnerStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CHURNED = "churned"


@dataclass
class Partner:
    id: str
    company_name: str
    contact_email: str
    tier: PartnerTier = PartnerTier.AFFILIATE
    status: PartnerStatus = PartnerStatus.PENDING
    revenue_share_pct: float = 20.0
    created_at: float = field(default_factory=time.time)
    approved_at: Optional[float] = None
    
    referrals: int = 0
    revenue_generated: float = 0
    templates_published: int = 0


@dataclass
class PartnerReferral:
    id: str
    partner_id: str
    referred_user_id: str
    created_at: float = field(default_factory=time.time)
    converted: bool = False
    revenue: float = 0


_partners: Dict[str, Partner] = {}
_referrals: List[PartnerReferral] = []

TIER_CONFIG = {
    PartnerTier.AFFILIATE: {"revenue_share": 20, "min_referrals": 0, "benefits": ["Basic link tracking", "Monthly payouts"]},
    PartnerTier.CERTIFIED: {"revenue_share": 25, "min_referrals": 10, "benefits": ["Priority support", "Co-marketing", "Badge"]},
    PartnerTier.AGENCY: {"revenue_share": 30, "min_referrals": 50, "benefits": ["White-label options", "API access", "Dedicated manager"]},
    PartnerTier.ENTERPRISE: {"revenue_share": 35, "min_referrals": 100, "benefits": ["Custom terms", "Joint ventures", "Revenue share negotiable"]}
}


def register_partner(company_name: str, contact_email: str, tier: str = "affiliate") -> Dict[str, Any]:
    partner_id = str(uuid.uuid4())
    
    partner = Partner(
        id=partner_id,
        company_name=company_name,
        contact_email=contact_email,
        tier=PartnerTier(tier) if tier in [t.value for t in PartnerTier] else PartnerTier.AFFILIATE
    )
    
    partner.revenue_share_pct = TIER_CONFIG[partner.tier]["revenue_share"]
    
    _partners[partner_id] = partner
    
    log.info(f"Partner registered: {partner_id} ({company_name})")
    
    return {
        "success": True,
        "partner_id": partner_id,
        "status": partner.status.value,
        "tier": partner.tier.value,
        "referral_link": f"https://levqor.ai/ref/{partner_id[:8]}"
    }


def approve_partner(partner_id: str) -> Dict[str, Any]:
    if partner_id not in _partners:
        return {"success": False, "error": "Partner not found"}
    
    partner = _partners[partner_id]
    partner.status = PartnerStatus.ACTIVE
    partner.approved_at = time.time()
    
    log.info(f"Partner approved: {partner_id}")
    
    return {
        "success": True,
        "partner_id": partner_id,
        "status": partner.status.value
    }


def record_referral(partner_id: str, referred_user_id: str) -> Dict[str, Any]:
    if partner_id not in _partners:
        return {"success": False, "error": "Partner not found"}
    
    partner = _partners[partner_id]
    
    referral = PartnerReferral(
        id=str(uuid.uuid4()),
        partner_id=partner_id,
        referred_user_id=referred_user_id
    )
    
    _referrals.append(referral)
    partner.referrals += 1
    
    check_tier_upgrade(partner)
    
    return {
        "success": True,
        "referral_id": referral.id,
        "partner_referrals": partner.referrals
    }


def record_conversion(referral_id: str, revenue: float) -> Dict[str, Any]:
    for referral in _referrals:
        if referral.id == referral_id:
            referral.converted = True
            referral.revenue = revenue
            
            if referral.partner_id in _partners:
                partner = _partners[referral.partner_id]
                partner.revenue_generated += revenue
            
            return {"success": True, "revenue": revenue}
    
    return {"success": False, "error": "Referral not found"}


def check_tier_upgrade(partner: Partner):
    for tier in [PartnerTier.ENTERPRISE, PartnerTier.AGENCY, PartnerTier.CERTIFIED]:
        if partner.referrals >= TIER_CONFIG[tier]["min_referrals"] and partner.tier.value != tier.value:
            partner.tier = tier
            partner.revenue_share_pct = TIER_CONFIG[tier]["revenue_share"]
            log.info(f"Partner {partner.id} upgraded to {tier.value}")
            break


def get_partner_dashboard(partner_id: str) -> Dict[str, Any]:
    if partner_id not in _partners:
        return {"success": False, "error": "Partner not found"}
    
    partner = _partners[partner_id]
    partner_referrals = [r for r in _referrals if r.partner_id == partner_id]
    
    conversions = sum(1 for r in partner_referrals if r.converted)
    total_revenue = sum(r.revenue for r in partner_referrals)
    commission = total_revenue * (partner.revenue_share_pct / 100)
    
    return {
        "success": True,
        "partner": {
            "id": partner.id,
            "company_name": partner.company_name,
            "tier": partner.tier.value,
            "status": partner.status.value,
            "revenue_share_pct": partner.revenue_share_pct
        },
        "stats": {
            "referrals": partner.referrals,
            "conversions": conversions,
            "conversion_rate": (conversions / partner.referrals * 100) if partner.referrals > 0 else 0,
            "total_revenue": total_revenue,
            "commission_earned": commission,
            "templates_published": partner.templates_published
        },
        "tier_info": TIER_CONFIG[partner.tier],
        "next_tier": get_next_tier_info(partner)
    }


def get_next_tier_info(partner: Partner) -> Optional[Dict[str, Any]]:
    tier_order = [PartnerTier.AFFILIATE, PartnerTier.CERTIFIED, PartnerTier.AGENCY, PartnerTier.ENTERPRISE]
    current_idx = tier_order.index(partner.tier)
    
    if current_idx >= len(tier_order) - 1:
        return None
    
    next_tier = tier_order[current_idx + 1]
    referrals_needed = TIER_CONFIG[next_tier]["min_referrals"] - partner.referrals
    
    return {
        "tier": next_tier.value,
        "referrals_needed": max(0, referrals_needed),
        "benefits": TIER_CONFIG[next_tier]["benefits"]
    }


def get_all_partners(status: Optional[str] = None) -> List[Dict[str, Any]]:
    partners = list(_partners.values())
    
    if status:
        partners = [p for p in partners if p.status.value == status]
    
    return [
        {
            "id": p.id,
            "company_name": p.company_name,
            "contact_email": p.contact_email,
            "tier": p.tier.value,
            "status": p.status.value,
            "referrals": p.referrals,
            "revenue_generated": p.revenue_generated,
            "created_at": p.created_at
        }
        for p in sorted(partners, key=lambda x: x.created_at, reverse=True)
    ]
