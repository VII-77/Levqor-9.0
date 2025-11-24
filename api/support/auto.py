"""
AI Support Automation Endpoint - MEGA-PHASE 5
Merges AIHelpPanel + AIDebugAssistant logic with smart escalation
"""
from flask import Blueprint, request, jsonify
import logging
from api.ai.utils import normalize_language, get_language_display_name

bp = Blueprint("support_auto", __name__, url_prefix="/api/support/auto")
log = logging.getLogger("levqor.support.auto")


@bp.post("/")
def auto_support():
    """
    AI-first support automation with escalation logic
    
    Request: {
        "question": string,
        "error_code": string (optional),
        "language": string (optional),
        "context": object (optional)
    }
    Response: {
        "success": boolean,
        "answer": string,
        "steps": array (optional),
        "escalation_required": boolean,
        "escalation_reason": string (optional)
    }
    """
    from api.metrics.app import increment_support_auto_request, increment_support_auto_escalation
    
    increment_support_auto_request()
    
    try:
        data = request.get_json()
        
        if not data or "question" not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: question"
            }), 400
        
        question = data.get("question", "").strip()
        error_code = data.get("error_code", "").strip()
        language = normalize_language(data.get("language", "en"))
        context = data.get("context", {})
        
        if not question or len(question) < 3:
            return jsonify({
                "success": False,
                "error": "Question must be at least 3 characters"
            }), 422
        
        if len(question) > 2000:
            return jsonify({
                "success": False,
                "error": "Question too long (max 2000 characters)"
            }), 422
        
        log.info(f"AI support request: question_length={len(question)}, language={language}, has_error_code={bool(error_code)}")
        
        # Determine if escalation is required
        escalation_required, escalation_reason = _check_escalation_needed(question, error_code, context)
        
        if escalation_required:
            increment_support_auto_escalation()
            log.info(f"Support escalation triggered: {escalation_reason}")
            
            return jsonify({
                "success": True,
                "escalation_required": True,
                "escalation_reason": escalation_reason,
                "message": "Your request has been escalated to our support team. We'll get back to you within your tier's SLA timeframe.",
                "meta": {
                    "language": language
                }
            }), 200
        
        # Handle with AI
        if error_code:
            # Error-focused response (AIDebugAssistant logic)
            answer, steps = _generate_error_support(question, error_code, context, language)
        else:
            # General help response (AIHelpPanel logic)
            answer, steps = _generate_general_support(question, context, language)
        
        return jsonify({
            "success": True,
            "answer": answer,
            "steps": steps if steps else [],
            "escalation_required": False,
            "meta": {
                "question_length": len(question),
                "language": language,
                "pattern_based": True
            }
        }), 200
        
    except Exception as e:
        log.error(f"AI support automation error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


def _check_escalation_needed(question: str, error_code: str, context: dict) -> tuple:
    """
    Determine if human escalation is required
    
    Escalation criteria:
    - Billing disputes
    - Security issues
    - Data deletion requests
    - Account termination
    - Legal inquiries
    
    Returns: (escalation_required: bool, reason: str)
    """
    question_lower = question.lower()
    
    # Billing escalations
    billing_keywords = ["refund", "charge", "billing dispute", "overcharged", "cancel subscription", "money back"]
    if any(kw in question_lower for kw in billing_keywords):
        return True, "Billing inquiry requires human review"
    
    # Security escalations
    security_keywords = ["hack", "breach", "unauthorized access", "account compromised", "security incident", "data leak"]
    if any(kw in question_lower for kw in security_keywords):
        return True, "Security issue requires immediate escalation"
    
    # Data deletion escalations (GDPR/compliance)
    deletion_keywords = ["delete my data", "gdpr request", "remove my account", "right to be forgotten", "data deletion"]
    if any(kw in question_lower for kw in deletion_keywords):
        return True, "Data deletion request requires compliance team review"
    
    # Legal escalations
    legal_keywords = ["lawsuit", "legal action", "attorney", "lawyer", "sue", "terms of service violation"]
    if any(kw in question_lower for kw in legal_keywords):
        return True, "Legal inquiry requires escalation to legal team"
    
    # Account termination
    termination_keywords = ["terminate account", "close account permanently", "account suspension appeal"]
    if any(kw in question_lower for kw in termination_keywords):
        return True, "Account termination requires human approval"
    
    # Everything else can be handled by AI
    return False, ""


def _generate_error_support(question: str, error_code: str, context: dict, language: str) -> tuple:
    """
    Generate error-focused support response
    Uses AIDebugAssistant-style logic
    
    Returns: (answer: str, steps: list)
    """
    error_lower = error_code.lower()
    
    # Common error patterns
    if "401" in error_code or "unauthorized" in error_lower:
        answer = f"""The error "{error_code}" indicates an authentication issue. This typically means your API credentials are invalid, expired, or missing.

Common causes:
- API key has been revoked or regenerated
- OAuth token has expired
- Incorrect permissions for the integration
- Service authentication requirements have changed"""
        
        steps = [
            {"step": 1, "action": "Verify API credentials", "description": "Check that your API key/token is still valid"},
            {"step": 2, "action": "Regenerate credentials", "description": "Create new API key in the service's settings"},
            {"step": 3, "action": "Update Levqor integration", "description": "Add the new credentials to your workflow"},
            {"step": 4, "action": "Test connection", "description": "Run a test workflow to verify authentication"}
        ]
    
    elif "403" in error_code or "forbidden" in error_lower:
        answer = f"""The error "{error_code}" means you don't have permission to access the requested resource.

This could be due to:
- Insufficient permissions on your API key
- Service-level restrictions (free tier limitations)
- IP whitelisting requirements
- Resource ownership mismatch"""
        
        steps = [
            {"step": 1, "action": "Check permissions", "description": "Verify your API key has the necessary scopes"},
            {"step": 2, "action": "Review service limits", "description": "Confirm you're within tier limits"},
            {"step": 3, "action": "Contact service provider", "description": "Request elevated permissions if needed"},
            {"step": 4, "action": "Retry with correct credentials", "description": "Update workflow with authorized key"}
        ]
    
    elif "429" in error_code or "rate limit" in error_lower:
        answer = f"""The error "{error_code}" means you've hit a rate limit. The API is throttling your requests to prevent overload.

Rate limiting is common for APIs and usually resets after a time window."""
        
        steps = [
            {"step": 1, "action": "Reduce request frequency", "description": "Space out workflow triggers"},
            {"step": 2, "action": "Implement retry logic", "description": "Use Levqor's built-in exponential backoff"},
            {"step": 3, "action": "Upgrade service tier", "description": "Check if higher tier offers increased limits"},
            {"step": 4, "action": "Monitor usage", "description": "Track API call volume to stay under limits"}
        ]
    
    elif "500" in error_code or "internal server error" in error_lower:
        answer = f"""The error "{error_code}" indicates a server-side issue with the external service. This is not a problem with your Levqor configuration.

The service provider is experiencing technical difficulties."""
        
        steps = [
            {"step": 1, "action": "Check service status", "description": "Visit the service's status page"},
            {"step": 2, "action": "Enable retry", "description": "Let Levqor automatically retry when service recovers"},
            {"step": 3, "action": "Set up alerts", "description": "Get notified when service is back online"},
            {"step": 4, "action": "Contact service support", "description": "Report persistent 500 errors to their team"}
        ]
    
    else:
        answer = f"""I see you're experiencing the error: "{error_code}". Let me help you troubleshoot this.

{question}

First, let's identify the root cause by reviewing recent changes and checking service status."""
        
        steps = [
            {"step": 1, "action": "Review error details", "description": "Check full error message and stack trace"},
            {"step": 2, "action": "Check recent changes", "description": "Identify what changed before error appeared"},
            {"step": 3, "action": "Test in isolation", "description": "Run a simplified version to isolate the issue"},
            {"step": 4, "action": "Contact support", "description": "Escalate if issue persists after troubleshooting"}
        ]
    
    return answer, steps


def _generate_general_support(question: str, context: dict, language: str) -> tuple:
    """
    Generate general help response
    Uses AIHelpPanel-style logic
    
    Returns: (answer: str, steps: list)
    """
    question_lower = question.lower()
    
    # Workflow questions
    if any(kw in question_lower for kw in ["workflow", "create", "automate", "build"]):
        answer = """To create a workflow in Levqor, you have two options:

1. **Natural Language Builder**: Describe what you want in plain English, and our AI will generate the workflow structure for you.

2. **Visual Builder**: Drag and drop triggers, actions, and conditions for more control.

Both approaches let you automate data backups, retention policies, and integrations."""
        
        steps = [
            {"step": 1, "action": "Go to Dashboard → Workflows"},
            {"step": 2, "action": "Click 'New Workflow'"},
            {"step": 3, "action": "Choose Natural Language or Visual mode"},
            {"step": 4, "action": "Configure triggers and actions"},
            {"step": 5, "action": "Test and activate"}
        ]
    
    # Integration questions
    elif any(kw in question_lower for kw in ["integration", "connect", "slack", "email", "webhook"]):
        answer = """Levqor supports multiple integration methods:

- **Native Connectors**: Pre-built integrations for popular services (Slack, email, etc.)
- **Webhooks**: Receive real-time events from external services
- **REST API**: Make custom API calls to any service
- **Email Triggers**: Start workflows based on incoming emails

All integrations can be configured in the Workflows section."""
        
        steps = [
            {"step": 1, "action": "Navigate to Workflows → Integrations"},
            {"step": 2, "action": "Select the service you want to connect"},
            {"step": 3, "action": "Authenticate with OAuth or API key"},
            {"step": 4, "action": "Test connection"},
            {"step": 5, "action": "Build workflows using the integration"}
        ]
    
    # Pricing/billing questions
    elif any(kw in question_lower for kw in ["price", "pricing", "cost", "tier", "plan"]):
        answer = """Levqor offers flexible pricing tiers to match your needs:

- **Starter**: £9/month - Perfect for individuals
- **Growth**: £29/month - Small teams
- **Business**: £59/month - Growing companies
- **Agency**: £149/month - Multi-client management

All plans include a 7-day free trial (card required, cancel anytime before Day 7).

Annual plans save 16% vs monthly billing."""
        
        steps = [
            {"step": 1, "action": "Visit /pricing to compare features"},
            {"step": 2, "action": "Start 7-day free trial"},
            {"step": 3, "action": "Explore all features risk-free"},
            {"step": 4, "action": "Upgrade or cancel before trial ends"}
        ]
    
    # Retention/compliance questions
    elif any(kw in question_lower for kw in ["retention", "compliance", "gdpr", "backup", "archive"]):
        answer = """Levqor's retention management helps you stay compliant with regulations like GDPR, HIPAA, and SOX.

Key features:
- Customizable retention policies (7 days to 10 years)
- Automated data archiving
- Encryption at rest and in transit
- Audit logs for compliance reporting"""
        
        steps = [
            {"step": 1, "action": "Define retention requirements"},
            {"step": 2, "action": "Create retention policies in Workflows"},
            {"step": 3, "action": "Enable automated archiving"},
            {"step": 4, "action": "Set up compliance monitoring"}
        ]
    
    # Account/settings questions
    elif any(kw in question_lower for kw in ["account", "settings", "profile", "password"]):
        answer = """You can manage your account settings in the Dashboard:

- **Profile**: Update name, email, timezone
- **Security**: Change password, enable 2FA
- **Billing**: View invoices, update payment method
- **Team**: Invite members (Growth tier and above)"""
        
        steps = [
            {"step": 1, "action": "Navigate to Dashboard → Settings"},
            {"step": 2, "action": "Update desired settings"},
            {"step": 3, "action": "Save changes"}
        ]
    
    # General/unknown
    else:
        answer = f"""I'm here to help with your question: "{question}"

Levqor is a comprehensive data backup and retention platform. I can assist with:
- Workflow creation and automation
- Integration setup
- Compliance and retention policies
- Troubleshooting errors
- Pricing and billing questions

Could you provide more details about what you're trying to accomplish?"""
        
        steps = [
            {"step": 1, "action": "Use the AI Help Panel in dashboard for contextual help"},
            {"step": 2, "action": "Browse our knowledge base for guides"},
            {"step": 3, "action": "Contact support for personalized assistance"}
        ]
    
    return answer, steps
