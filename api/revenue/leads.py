"""
Levqor Revenue Autopilot Wave v1: Lead Capture & DFY Requests
PASSIVE MODE - Data capture and pipeline tracking only.
No auto-charges, no Stripe changes, no billing modifications.
"""
import time
import uuid
import json
import logging
from flask import Blueprint, request, jsonify
from modules.db_wrapper import execute_query, commit

log = logging.getLogger("levqor.revenue.leads")

revenue_leads_bp = Blueprint("revenue_leads", __name__)

VALID_STAGES = ['new', 'contacted', 'qualified', 'won', 'lost']
VALID_DFY_STATUSES = ['new', 'in_progress', 'delivered', 'closed']


def validate_email(email: str) -> bool:
    """Basic email validation."""
    if not email or not isinstance(email, str):
        return False
    return '@' in email and '.' in email.split('@')[-1]


@revenue_leads_bp.route("/api/revenue/leads", methods=["POST"])
def create_lead():
    """
    POST /api/revenue/leads
    
    Create a new sales lead from any source (pricing, homepage, dashboard, brain, etc.)
    
    Request body:
    {
        "email": "user@example.com",  (required)
        "name": "John Doe",           (optional)
        "source": "pricing",          (required)
        "plan_intent": "launch",      (optional)
        "metadata": {...}             (optional)
    }
    
    Response:
    { "ok": true, "id": "<lead_id>" }
    """
    try:
        data = request.get_json() or {}
        
        email = (data.get("email") or "").strip().lower()
        source = (data.get("source") or "").strip().lower()
        
        if not email or not validate_email(email):
            return jsonify({"ok": False, "error": "valid_email_required"}), 400
        
        if not source:
            return jsonify({"ok": False, "error": "source_required"}), 400
        
        lead_id = uuid.uuid4().hex
        created_at = time.time()
        name = (data.get("name") or "").strip() or None
        plan_intent = (data.get("plan_intent") or "").strip().lower() or "unknown"
        stage = "new"
        notes = None
        metadata = json.dumps(data.get("metadata") or {})
        
        execute_query("""
            INSERT INTO sales_leads (id, created_at, email, name, source, plan_intent, stage, notes, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (lead_id, created_at, email, name, source, plan_intent, stage, notes, metadata), fetch=None)
        commit()
        
        log.info(f"Lead created: id={lead_id}, email={email[:20]}..., source={source}, plan_intent={plan_intent}")
        
        return jsonify({"ok": True, "id": lead_id}), 201
        
    except Exception as e:
        log.error(f"Error creating lead: {e}")
        return jsonify({"ok": False, "error": str(e)[:100]}), 500


@revenue_leads_bp.route("/api/revenue/leads", methods=["GET"])
def list_leads():
    """
    GET /api/revenue/leads
    
    List recent leads with optional filters.
    
    Query params:
    - stage: filter by stage (new, contacted, qualified, won, lost)
    - limit: max results (default 50, max 200)
    
    Response:
    { "ok": true, "leads": [...] }
    """
    try:
        stage_filter = request.args.get("stage", "").strip().lower()
        limit = min(int(request.args.get("limit", 50)), 200)
        
        if stage_filter and stage_filter in VALID_STAGES:
            leads = execute_query("""
                SELECT id, email, name, source, plan_intent, stage, created_at
                FROM sales_leads
                WHERE stage = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (stage_filter, limit), fetch='all') or []
        else:
            leads = execute_query("""
                SELECT id, email, name, source, plan_intent, stage, created_at
                FROM sales_leads
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit,), fetch='all') or []
        
        return jsonify({"ok": True, "leads": leads, "count": len(leads)}), 200
        
    except Exception as e:
        log.error(f"Error listing leads: {e}")
        return jsonify({"ok": False, "error": str(e)[:100]}), 500


@revenue_leads_bp.route("/api/revenue/leads/summary", methods=["GET"])
def leads_summary():
    """
    GET /api/revenue/leads/summary
    
    Aggregate lead statistics for the last 30 days.
    
    Response:
    {
        "ok": true,
        "total_leads": 42,
        "by_source": {"pricing": 20, "homepage": 15, ...},
        "by_stage": {"new": 30, "contacted": 10, ...},
        "by_plan_intent": {"launch": 15, "growth": 10, ...}
    }
    """
    try:
        cutoff_30_days = time.time() - (30 * 24 * 3600)
        
        total = execute_query("""
            SELECT COUNT(*) as cnt FROM sales_leads WHERE created_at >= ?
        """, (cutoff_30_days,), fetch='one') or {}
        total_leads = total.get('cnt', 0) or 0
        
        by_source_rows = execute_query("""
            SELECT source, COUNT(*) as cnt FROM sales_leads 
            WHERE created_at >= ? GROUP BY source
        """, (cutoff_30_days,), fetch='all') or []
        by_source = {row['source']: row['cnt'] for row in by_source_rows}
        
        by_stage_rows = execute_query("""
            SELECT stage, COUNT(*) as cnt FROM sales_leads 
            WHERE created_at >= ? GROUP BY stage
        """, (cutoff_30_days,), fetch='all') or []
        by_stage = {row['stage']: row['cnt'] for row in by_stage_rows}
        
        by_intent_rows = execute_query("""
            SELECT plan_intent, COUNT(*) as cnt FROM sales_leads 
            WHERE created_at >= ? GROUP BY plan_intent
        """, (cutoff_30_days,), fetch='all') or []
        by_plan_intent = {row['plan_intent']: row['cnt'] for row in by_intent_rows}
        
        return jsonify({
            "ok": True,
            "total_leads": total_leads,
            "by_source": by_source,
            "by_stage": by_stage,
            "by_plan_intent": by_plan_intent,
            "time_window_days": 30
        }), 200
        
    except Exception as e:
        log.error(f"Error getting leads summary: {e}")
        return jsonify({"ok": False, "error": str(e)[:100]}), 500


@revenue_leads_bp.route("/api/revenue/dfy-request", methods=["POST"])
def create_dfy_request():
    """
    POST /api/revenue/dfy-request
    
    Create a DFY (Done-For-You) service request.
    Automatically creates or reuses a sales lead.
    
    Request body:
    {
        "email": "user@example.com",  (required)
        "name": "John Doe",           (optional)
        "use_case": "Zapier + CRM",   (required)
        "detail": "Set up workflows", (optional)
        "source": "pricing_dfy",      (required)
        "plan_intent": "dfy_professional"  (optional)
    }
    
    Response:
    { "ok": true, "dfy_id": "<id>", "lead_id": "<id>" }
    """
    try:
        data = request.get_json() or {}
        
        email = (data.get("email") or "").strip().lower()
        use_case = (data.get("use_case") or "").strip()
        source = (data.get("source") or "").strip().lower()
        
        if not email or not validate_email(email):
            return jsonify({"ok": False, "error": "valid_email_required"}), 400
        
        if not use_case:
            return jsonify({"ok": False, "error": "use_case_required"}), 400
        
        if not source:
            return jsonify({"ok": False, "error": "source_required"}), 400
        
        name = (data.get("name") or "").strip() or None
        detail = (data.get("detail") or "").strip() or None
        plan_intent = (data.get("plan_intent") or "").strip().lower() or "dfy"
        metadata = json.dumps(data.get("metadata") or {})
        
        now = time.time()
        cutoff_recent = now - (7 * 24 * 3600)
        
        existing_lead = execute_query("""
            SELECT id FROM sales_leads 
            WHERE email = ? AND created_at >= ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (email, cutoff_recent), fetch='one')
        
        if existing_lead:
            lead_id = existing_lead['id']
            log.info(f"Reusing existing lead: {lead_id}")
        else:
            lead_id = uuid.uuid4().hex
            execute_query("""
                INSERT INTO sales_leads (id, created_at, email, name, source, plan_intent, stage, notes, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (lead_id, now, email, name, source, plan_intent, 'new', f"DFY request: {use_case[:50]}", metadata), fetch=None)
            log.info(f"Created new lead for DFY request: {lead_id}")
        
        dfy_id = uuid.uuid4().hex
        execute_query("""
            INSERT INTO dfy_requests (id, created_at, lead_id, email, name, use_case, detail, status, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (dfy_id, now, lead_id, email, name, use_case, detail, 'new', metadata), fetch=None)
        commit()
        
        log.info(f"DFY request created: dfy_id={dfy_id}, lead_id={lead_id}, use_case={use_case[:30]}...")
        
        return jsonify({
            "ok": True,
            "dfy_id": dfy_id,
            "lead_id": lead_id
        }), 201
        
    except Exception as e:
        log.error(f"Error creating DFY request: {e}")
        return jsonify({"ok": False, "error": str(e)[:100]}), 500


@revenue_leads_bp.route("/api/revenue/dfy/summary", methods=["GET"])
def dfy_summary():
    """
    GET /api/revenue/dfy/summary
    
    Aggregate DFY request statistics.
    
    Response:
    {
        "ok": true,
        "total_requests": 15,
        "by_status": {"new": 10, "in_progress": 3, ...},
        "by_use_case": [{"use_case": "CRM Setup", "count": 5}, ...]
    }
    """
    try:
        cutoff_30_days = time.time() - (30 * 24 * 3600)
        
        total = execute_query("""
            SELECT COUNT(*) as cnt FROM dfy_requests WHERE created_at >= ?
        """, (cutoff_30_days,), fetch='one') or {}
        total_requests = total.get('cnt', 0) or 0
        
        by_status_rows = execute_query("""
            SELECT status, COUNT(*) as cnt FROM dfy_requests 
            WHERE created_at >= ? GROUP BY status
        """, (cutoff_30_days,), fetch='all') or []
        by_status = {row['status']: row['cnt'] for row in by_status_rows}
        
        by_use_case_rows = execute_query("""
            SELECT use_case, COUNT(*) as cnt FROM dfy_requests 
            WHERE created_at >= ? 
            GROUP BY use_case 
            ORDER BY cnt DESC 
            LIMIT 5
        """, (cutoff_30_days,), fetch='all') or []
        by_use_case = [{"use_case": row['use_case'], "count": row['cnt']} for row in by_use_case_rows]
        
        return jsonify({
            "ok": True,
            "total_requests": total_requests,
            "by_status": by_status,
            "by_use_case": by_use_case,
            "time_window_days": 30
        }), 200
        
    except Exception as e:
        log.error(f"Error getting DFY summary: {e}")
        return jsonify({"ok": False, "error": str(e)[:100]}), 500
