"""
Stripe Webhook Handler
Processes Stripe webhook events for subscription updates, payments, etc.
"""
import os
import logging
from flask import Blueprint, request, jsonify

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
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
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
        return jsonify({"error": "invalid_payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        log.error(f"Invalid signature: {e}")
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
    
    log.info(f"Subscription updated: {subscription_id} (new status: {status})")
    
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
    
    # TODO: Handle failed payment
    # - Send notification to user
    # - Update subscription status
    # - Trigger dunning workflow
