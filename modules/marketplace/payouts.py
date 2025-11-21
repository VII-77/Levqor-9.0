"""
Stripe Connect Payouts System
Handles automated revenue sharing with partners
"""
import os
import stripe
from time import time
import sqlite3
from typing import Optional, Dict, Any

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "").strip()

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def calculate_revenue_split(
    amount_cents: int,
    revenue_share: float = 0.7
) -> Dict[str, int]:
    """
    Calculate revenue split between partner and platform
    
    Args:
        amount_cents: Total transaction amount in cents
        revenue_share: Partner's share (default 0.7 = 70%)
        
    Returns:
        Dict with partner_share_cents and platform_fee_cents
    """
    partner_share_cents = int(amount_cents * revenue_share)
    platform_fee_cents = amount_cents - partner_share_cents
    
    return {
        "partner_share_cents": partner_share_cents,
        "platform_fee_cents": platform_fee_cents
    }

def create_payout(
    partner_account_id: str,
    amount_cents: int,
    description: str = "Levqor Marketplace Payout"
) -> Optional[Dict[str, Any]]:
    """
    Create a Stripe Connect transfer to partner
    
    Args:
        partner_account_id: Partner's Stripe Connect account ID
        amount_cents: Amount to transfer in cents
        description: Transfer description
        
    Returns:
        Stripe Transfer object or None if failed
    """
    if not stripe.api_key:
        print("⚠️ Stripe API key not configured")
        return None
    
    try:
        transfer = stripe.Transfer.create(
            amount=amount_cents,
            currency="usd",
            destination=partner_account_id,
            description=description
        )
        
        print(f"✅ Payout created: ${amount_cents/100:.2f} to {partner_account_id}")
        
        return {
            "id": transfer.id,
            "amount_cents": transfer.amount,
            "destination": transfer.destination,
            "status": transfer.status,
            "created": transfer.created
        }
        
    except stripe.error.StripeError as e:
        print(f"❌ Stripe payout failed: {e}")
        return None
    except Exception as e:
        print(f"❌ Payout error: {e}")
        return None

def process_pending_payouts() -> Dict[str, Any]:
    """
    Process all pending payouts for completed orders
    
    Returns:
        Summary of processed payouts
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get completed orders that haven't been paid out
    cursor.execute("""
        SELECT o.id, o.partner_id, o.partner_share_cents, o.listing_id,
               p.stripe_connect_id, p.name, l.name
        FROM marketplace_orders o
        JOIN partners p ON o.partner_id = p.id
        JOIN listings l ON o.listing_id = l.id
        WHERE o.status = 'completed'
          AND p.stripe_connect_id IS NOT NULL
          AND p.is_active = 1
          AND p.is_verified = 1
    """)
    
    pending = cursor.fetchall()
    
    results = {
        "total_orders": len(pending),
        "successful": 0,
        "failed": 0,
        "total_paid_cents": 0,
        "errors": []
    }
    
    for order in pending:
        order_id, partner_id, amount_cents, listing_id, connect_id, partner_name, listing_name = order
        
        if amount_cents <= 0:
            results["failed"] += 1
            results["errors"].append(f"Order {order_id}: Invalid amount")
            continue
        
        payout = create_payout(
            connect_id,
            amount_cents,
            f"Marketplace sale: {listing_name}"
        )
        
        if payout:
            # Update order status to paid
            cursor.execute("""
                UPDATE marketplace_orders
                SET status = 'paid_out'
                WHERE id = ?
            """, (order_id,))
            
            results["successful"] += 1
            results["total_paid_cents"] += amount_cents
        else:
            results["failed"] += 1
            results["errors"].append(f"Order {order_id}: Payout failed")
    
    db.commit()
    db.close()
    
    print(f"📊 Payout summary: {results['successful']} successful, {results['failed']} failed")
    print(f"💰 Total paid out: ${results['total_paid_cents']/100:.2f}")
    
    return results

def get_partner_earnings(partner_id: str) -> Dict[str, Any]:
    """
    Get earnings summary for a partner
    
    Args:
        partner_id: Partner UUID
        
    Returns:
        Earnings summary
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT
            COUNT(*) as total_sales,
            SUM(partner_share_cents) as total_earned_cents,
            SUM(CASE WHEN status = 'paid_out' THEN partner_share_cents ELSE 0 END) as paid_out_cents,
            SUM(CASE WHEN status = 'completed' THEN partner_share_cents ELSE 0 END) as pending_cents
        FROM marketplace_orders
        WHERE partner_id = ?
    """, (partner_id,))
    
    row = cursor.fetchone()
    db.close()
    
    return {
        "partner_id": partner_id,
        "total_sales": row[0] or 0,
        "total_earned": (row[1] or 0) / 100.0,
        "paid_out": (row[2] or 0) / 100.0,
        "pending_payout": (row[3] or 0) / 100.0
    }

def create_marketplace_order(
    listing_id: str,
    user_id: Optional[str] = None,
    stripe_payment_intent_id: Optional[str] = None
) -> Optional[str]:
    """
    Create a marketplace order
    
    Args:
        listing_id: Listing UUID
        user_id: Buyer user ID (optional)
        stripe_payment_intent_id: Stripe Payment Intent ID
        
    Returns:
        Order ID or None if failed
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get listing and partner info
    cursor.execute("""
        SELECT l.price_cents, l.partner_id, p.revenue_share
        FROM listings l
        JOIN partners p ON l.partner_id = p.id
        WHERE l.id = ? AND l.is_active = 1 AND l.is_verified = 1
    """, (listing_id,))
    
    listing = cursor.fetchone()
    
    if not listing:
        print(f"❌ Listing {listing_id} not found or inactive")
        db.close()
        return None
    
    price_cents, partner_id, revenue_share = listing
    
    # Calculate revenue split
    split = calculate_revenue_split(price_cents, revenue_share)
    
    # Create order
    from uuid import uuid4
    order_id = str(uuid4())
    now = time()
    
    cursor.execute("""
        INSERT INTO marketplace_orders (
            id, listing_id, partner_id, user_id, amount_cents,
            partner_share_cents, platform_fee_cents, status,
            stripe_payment_intent_id, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
    """, (
        order_id,
        listing_id,
        partner_id,
        user_id,
        price_cents,
        split["partner_share_cents"],
        split["platform_fee_cents"],
        stripe_payment_intent_id,
        now,
        now
    ))
    
    # Increment download count
    cursor.execute("""
        UPDATE listings
        SET downloads = downloads + 1
        WHERE id = ?
    """, (listing_id,))
    
    db.commit()
    db.close()
    
    print(f"✅ Order created: {order_id} for listing {listing_id}")
    
    return order_id
