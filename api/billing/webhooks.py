"""
Stripe Webhook Handler
Processes Stripe webhook events for subscription updates, payments, etc.
"""
import os
import json
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify

from security_core import audit, config as sec_config

bp = Blueprint("billing_webhooks", __name__, url_prefix="/api/billing")
log = logging.getLogger("levqor.webhooks")

try:
    import stripe
    from modules.stripe_connector import get_stripe_webhook_secret
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    log.warning("Stripe SDK or connector not available for webhooks")


@bp.post("/webhook")
def stripe_webhook():
    """
    Handle Stripe webhook events
    
    Stripe sends events like:
    - customer.subscription.created
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.payment_succeeded
    - invoice.payment_failed
    
    This endpoint verifies the signature and processes events
    """
    if not STRIPE_AVAILABLE:
        return jsonify({"error": "stripe_not_configured"}), 500
    
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")
    
    if not sig_header:
        log.error("Missing Stripe-Signature header")
        return jsonify({"error": "missing_signature"}), 400
    
    try:
        # Get webhook secret from connector
        webhook_secret = get_stripe_webhook_secret()
        
        if not webhook_secret:
            log.error("Webhook secret not configured")
            return jsonify({"error": "webhook_secret_not_configured"}), 500
        
        # Verify webhook signature with tolerance
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret,
            tolerance=sec_config.STRIPE_TOLERANCE_SECONDS
        )
        
        # Log the event
        log.info(f"Received webhook event: {event['type']} (id: {event['id']})")
        
        # Handle different event types
        event_type = event['type']
        event_data = event['data']['object']
        
        if event_type == 'customer.subscription.created':
            handle_subscription_created(event_data)
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event_data)
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event_data)
        elif event_type == 'invoice.payment_succeeded':
            handle_payment_succeeded(event_data)
        elif event_type == 'invoice.payment_failed':
            handle_payment_failed(event_data)
        else:
            log.info(f"Unhandled event type: {event_type}")
        
        return jsonify({"ok": True, "event_type": event_type}), 200
        
    except ValueError as e:
        log.error(f"Invalid payload: {e}")
        ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.remote_addr or "unknown"
        audit.audit_security_event("stripe_webhook_invalid_payload", {
            "reason": "invalid_json",
            "ip": ip
        })
        return jsonify({"error": "invalid_payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        log.error(f"Invalid signature: {e}")
        ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.remote_addr or "unknown"
        audit.audit_security_event("stripe_webhook_invalid_signature", {
            "reason": str(e)[:100],
            "sig": "masked",
            "ip": ip
        })
        return jsonify({"error": "invalid_signature"}), 400
    except Exception as e:
        log.error(f"Webhook processing error: {e}")
        return jsonify({"error": "webhook_processing_error", "message": str(e)}), 500


def handle_subscription_created(subscription):
    """Handle new subscription creation"""
    customer_id = subscription.get('customer')
    subscription_id = subscription.get('id')
    status = subscription.get('status')
    
    log.info(f"Subscription created: {subscription_id} for customer {customer_id} (status: {status})")
    
    # TODO: Update user record with subscription_id
    # Example:
    # from modules.db_wrapper import execute_query
    # execute_query(
    #     "UPDATE users SET stripe_subscription_id = ?, subscription_status = ? WHERE stripe_customer_id = ?",
    #     (subscription_id, status, customer_id),
    #     fetch=None
    # )


def handle_subscription_updated(subscription):
    """Handle subscription updates (upgrades, downgrades, status changes)"""
    subscription_id = subscription.get('id')
    status = subscription.get('status')
    customer_id = subscription.get('customer', 'unknown')
    
    log.info(f"Subscription updated: {subscription_id} (new status: {status})")
    
    audit.audit_security_event("subscription_update", {
        "customer_id": customer_id[-8:] if len(customer_id) > 8 else customer_id,
        "subscription_id": subscription_id[-8:] if len(subscription_id) > 8 else subscription_id,
        "new_status": status,
    })
    
    # TODO: Update user subscription status
    # execute_query(
    #     "UPDATE users SET subscription_status = ? WHERE stripe_subscription_id = ?",
    #     (status, subscription_id),
    #     fetch=None
    # )


def handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    subscription_id = subscription.get('id')
    
    log.info(f"Subscription deleted: {subscription_id}")
    
    # TODO: Mark subscription as cancelled
    # execute_query(
    #     "UPDATE users SET stripe_subscription_id = NULL, subscription_status = ? WHERE stripe_subscription_id = ?",
    #     ('cancelled', subscription_id),
    #     fetch=None
    # )


def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    invoice_id = invoice.get('id')
    customer_id = invoice.get('customer')
    amount_paid = invoice.get('amount_paid')
    
    log.info(f"Payment succeeded: {invoice_id} for customer {customer_id} (amount: {amount_paid})")
    
    # TODO: Record payment in database
    # Can be used for analytics, billing history, etc.


def handle_payment_failed(invoice):
    """Handle failed payment"""
    invoice_id = invoice.get('id')
    customer_id = invoice.get('customer')
    
    log.error(f"Payment failed: {invoice_id} for customer {customer_id}")


def verify_internal_signature(payload: str, signature: str) -> bool:
    """Verify HMAC-SHA256 signature from frontend webhook handler"""
    import hashlib
    import hmac as hmac_module
    
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
    if not webhook_secret:
        log.warning("STRIPE_WEBHOOK_SECRET not set for internal verification")
        return False
    
    expected_sig = hmac_module.new(
        webhook_secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    expected_sig = f"sha256={expected_sig}"
    
    return hmac_module.compare_digest(signature, expected_sig)


def retrieve_stripe_event_data(event_id: str) -> dict:
    """Retrieve and return actual event data from Stripe (secure fallback)"""
    if not STRIPE_AVAILABLE:
        return None
    try:
        event = stripe.Event.retrieve(event_id)
        return {
            "event_id": event.id,
            "event_type": event.type,
            "created": event.created,
            "data": event.data.object
        }
    except Exception as e:
        log.warning(f"Could not retrieve Stripe event {event_id}: {e}")
        return None


@bp.post("/webhook-event")
def webhook_event():
    """
    Receive and persist webhook events from the frontend webhook handler.
    This endpoint allows the Next.js Edge webhook to forward events for database persistence.
    Requires valid signature or Stripe event verification for security.
    """
    from modules.db_wrapper import execute_query
    
    if request.headers.get("X-Webhook-Source") != "stripe":
        return jsonify({"error": "invalid_source"}), 403
    
    signature = request.headers.get("X-Webhook-Signature", "")
    event_id_header = request.headers.get("X-Stripe-Event-Id", "")
    raw_body = request.get_data(as_text=True)
    
    use_stripe_data = False
    stripe_event_data = None
    
    if not signature or not verify_internal_signature(raw_body, signature):
        if event_id_header:
            stripe_event_data = retrieve_stripe_event_data(event_id_header)
            if stripe_event_data:
                log.info(f"Verified event via Stripe API, using Stripe data: {event_id_header}")
                use_stripe_data = True
            else:
                log.warning("Invalid webhook signature and failed Stripe verification")
                audit.audit_security_event("webhook_event_invalid_signature", {
                    "event_id": event_id_header[:20] if event_id_header else "unknown",
                    "ip": request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.remote_addr or "unknown"
                })
                return jsonify({"error": "invalid_signature"}), 403
        else:
            log.warning("Missing signature and event ID for verification")
            return jsonify({"error": "invalid_signature"}), 403
    
    try:
        if use_stripe_data and stripe_event_data:
            event_id = stripe_event_data.get("event_id")
            event_type = stripe_event_data.get("event_type")
            created = stripe_event_data.get("created")
            event_data = stripe_event_data.get("data", {})
        else:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "missing_body"}), 400
            
            event_id = data.get("event_id")
            event_type = data.get("event_type")
            created = data.get("created")
            event_data = data.get("data", {})
        
        if not event_id or not event_type:
            return jsonify({"error": "missing_event_id_or_type"}), 400
        
        log.info(f"[Webhook Event] Persisting: {event_type} (id: {event_id})")
        
        execute_query("""
            INSERT INTO stripe_events (event_id, event_type, created_at, data, processed_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (event_id) DO NOTHING
        """, (
            event_id,
            event_type,
            datetime.utcfromtimestamp(created) if created else datetime.utcnow(),
            json.dumps(event_data),
            datetime.utcnow()
        ), fetch=None)
        
        if event_type == 'customer.subscription.created':
            handle_subscription_created(event_data)
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event_data)
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event_data)
        elif event_type == 'invoice.paid':
            handle_payment_succeeded(event_data)
        elif event_type == 'invoice.payment_failed':
            handle_payment_failed(event_data)
        elif event_type == 'checkout.session.completed':
            handle_checkout_completed(event_data)
        
        return jsonify({"ok": True, "event_id": event_id}), 200
        
    except Exception as e:
        log.error(f"Error persisting webhook event: {e}")
        return jsonify({"error": "persist_failed", "message": str(e)}), 500


def handle_checkout_completed(session):
    """Handle checkout session completion"""
    session_id = session.get('id')
    customer_id = session.get('customer')
    customer_email = session.get('customer_email') or session.get('customer_details', {}).get('email')
    subscription_id = session.get('subscription')
    mode = session.get('mode')
    
    log.info(f"Checkout completed: {session_id} for customer {customer_id} (mode: {mode})")
    
    if subscription_id:
        try:
            from modules.db_wrapper import execute_query
            execute_query("""
                UPDATE users 
                SET stripe_customer_id = ?, stripe_subscription_id = ?, subscription_status = 'active', updated_at = ?
                WHERE email = ?
            """, (customer_id, subscription_id, datetime.utcnow(), customer_email), fetch=None)
            log.info(f"Updated user {customer_email} with subscription {subscription_id}")
        except Exception as e:
            log.error(f"Failed to update user subscription: {e}")
