"""
Smart Database Wrapper for Levqor Backend
Automatically uses PostgreSQL if DATABASE_URL is set, falls back to SQLite
Handles query placeholder conversion (? → %s for PostgreSQL)
"""
import os
import sqlite3
import logging
from typing import Optional, Any, Tuple, List

log = logging.getLogger("levqor.db")

_db_connection = None
_db_type = None

def get_db_type() -> str:
    """Detect which database to use"""
    global _db_type
    if _db_type is None:
        _db_type = 'postgresql' if os.environ.get("DATABASE_URL") else 'sqlite'
        log.info(f"Database type: {_db_type}")
    return _db_type

def get_db():
    """
    Get database connection - automatically uses PostgreSQL if DATABASE_URL is set
    Returns a connection object compatible with both SQLite and PostgreSQL
    """
    global _db_connection
    
    db_type = get_db_type()
    
    if _db_connection is not None:
        return _db_connection
    
    if db_type == 'postgresql':
        log.info("Initializing PostgreSQL connection")
        import psycopg2
        
        _db_connection = psycopg2.connect(
            os.environ.get("DATABASE_URL")
        )
        _db_connection.autocommit = False  # Manual transaction control
        
        # Initialize schema for PostgreSQL
        _init_postgresql_schema(_db_connection)
        
    else:
        log.info("Initializing SQLite connection")
        db_path = os.environ.get("SQLITE_PATH", "levqor.db")
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            
        _db_connection = sqlite3.connect(db_path, check_same_thread=False)
        _db_connection.row_factory = sqlite3.Row  # Dict-like rows
        
        # Initialize schema for SQLite
        _init_sqlite_schema(_db_connection)
    
    return _db_connection

def convert_query_placeholders(query: str, db_type: str) -> str:
    """
    Convert query placeholders based on database type
    SQLite uses ?, PostgreSQL uses %s
    """
    if db_type == 'postgresql':
        # Replace ? with %s for PostgreSQL
        return query.replace('?', '%s')
    return query

def execute_query(query: str, params: Optional[Tuple] = None, fetch: str = 'all') -> Any:
    """
    Execute query with automatic placeholder conversion
    
    Args:
        query: SQL query with ? placeholders
        params: Query parameters tuple
        fetch: 'all', 'one', or None (for INSERT/UPDATE/DELETE)
    
    Returns:
        Query results or None
    """
    db = get_db()
    db_type = get_db_type()
    
    # Convert placeholders if needed
    converted_query = convert_query_placeholders(query, db_type)
    
    cursor = db.cursor()
    
    try:
        if params:
            cursor.execute(converted_query, params)
        else:
            cursor.execute(converted_query)
        
        if fetch == 'all':
            result = cursor.fetchall()
            # Convert to list of dicts for consistency
            if db_type == 'postgresql':
                return result  # Already dict-like with RealDictCursor
            else:
                return [dict(row) for row in result]
        elif fetch == 'one':
            result = cursor.fetchone()
            if db_type == 'postgresql':
                return result
            else:
                return dict(result) if result else None
        else:
            return None
            
    except Exception as e:
        log.error(f"Query execution error: {e}")
        log.error(f"Query: {converted_query}")
        log.error(f"Params: {params}")
        db.rollback()
        raise

def execute(query: str, params: Optional[Tuple] = None):
    """
    Execute query with automatic placeholder conversion
    Returns cursor for fetchone/fetchall
    """
    db = get_db()
    db_type = get_db_type()
    
    # Convert placeholders if needed
    converted_query = convert_query_placeholders(query, db_type)
    
    cursor = db.cursor()
    
    try:
        if params:
            cursor.execute(converted_query, params)
        else:
            cursor.execute(converted_query)
        return cursor
    except Exception as e:
        log.error(f"Execute error: {e}")
        log.error(f"Query: {converted_query}")
        log.error(f"Params: {params}")
        db.rollback()
        raise

def commit():
    """Commit current transaction"""
    db = get_db()
    db.commit()

def rollback():
    """Rollback current transaction"""
    db = get_db()
    db.rollback()

def _init_postgresql_schema(conn):
    """Initialize PostgreSQL schema - create tables if not exist"""
    log.info("Initializing PostgreSQL schema")
    cursor = conn.cursor()
    
    try:
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                locale TEXT,
                currency TEXT,
                meta TEXT,
                created_at REAL,
                updated_at REAL
            )
        """)
        conn.commit()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        conn.commit()
        
        # Referrals table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS referrals (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                email TEXT,
                source TEXT NOT NULL,
                campaign TEXT,
                medium TEXT,
                created_at REAL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_referrals_source ON referrals(source)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at)")
        conn.commit()
        
        # Analytics aggregates
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analytics_aggregates (
                day DATE PRIMARY KEY,
                dau INTEGER NOT NULL DEFAULT 0,
                wau INTEGER NOT NULL DEFAULT 0,
                mau INTEGER NOT NULL DEFAULT 0,
                computed_at TEXT NOT NULL
            )
        """)
        conn.commit()
        
        # Developer keys
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS developer_keys (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                key_hash TEXT UNIQUE NOT NULL,
                key_prefix TEXT NOT NULL,
                tier TEXT NOT NULL DEFAULT 'sandbox',
                is_active INTEGER NOT NULL DEFAULT 1,
                calls_used INTEGER NOT NULL DEFAULT 0,
                calls_limit INTEGER NOT NULL DEFAULT 1000,
                reset_at REAL NOT NULL,
                created_at REAL NOT NULL,
                last_used_at REAL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_developer_keys_user_id ON developer_keys(user_id)")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_developer_keys_key_hash ON developer_keys(key_hash)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_developer_keys_tier ON developer_keys(tier)")
        conn.commit()
        
        # API usage log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS api_usage_log (
                id TEXT PRIMARY KEY,
                key_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                method TEXT NOT NULL,
                status_code INTEGER NOT NULL,
                response_time_ms INTEGER,
                created_at REAL NOT NULL,
                FOREIGN KEY (key_id) REFERENCES developer_keys(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_usage_log_key_id ON api_usage_log(key_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_usage_log_created_at ON api_usage_log(created_at)")
        conn.commit()
        
        # Partners
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS partners (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                webhook_url TEXT,
                revenue_share REAL NOT NULL DEFAULT 0.7,
                is_verified INTEGER NOT NULL DEFAULT 0,
                is_active INTEGER NOT NULL DEFAULT 1,
                stripe_connect_id TEXT,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                metadata TEXT
            )
        """)
        conn.commit()
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_email ON partners(email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_partners_verified ON partners(is_verified)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active)")
        conn.commit()
        
        # Listings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS listings (
                id TEXT PRIMARY KEY,
                partner_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                price_cents INTEGER NOT NULL DEFAULT 0,
                is_verified INTEGER NOT NULL DEFAULT 0,
                is_active INTEGER NOT NULL DEFAULT 1,
                downloads INTEGER NOT NULL DEFAULT 0,
                rating REAL,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                metadata TEXT,
                FOREIGN KEY (partner_id) REFERENCES partners(id)
            )
        """)
        conn.commit()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_listings_partner_id ON listings(partner_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_listings_verified ON listings(is_verified)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category)")
        conn.commit()
        
        # Marketplace orders
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS marketplace_orders (
                id TEXT PRIMARY KEY,
                listing_id TEXT NOT NULL,
                partner_id TEXT NOT NULL,
                user_id TEXT,
                amount_cents INTEGER NOT NULL,
                partner_share_cents INTEGER NOT NULL,
                platform_fee_cents INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                stripe_payment_intent_id TEXT,
                created_at REAL NOT NULL,
                completed_at REAL,
                FOREIGN KEY (listing_id) REFERENCES listings(id),
                FOREIGN KEY (partner_id) REFERENCES partners(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_orders_listing_id ON marketplace_orders(listing_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_orders_partner_id ON marketplace_orders(partner_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status)")
        conn.commit()
        
        log.info("PostgreSQL schema initialized successfully")
    except Exception as e:
        log.error(f"Failed to initialize PostgreSQL schema: {e}")
        conn.rollback()
        raise

def _init_sqlite_schema(conn):
    """Initialize SQLite schema - same as run.py but modularized"""
    log.info("Initializing SQLite schema")
    # Use the exact same schema creation as run.py
    # (Copy from run.py lines 73-211)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            locale TEXT,
            currency TEXT,
            meta TEXT,
            created_at REAL,
            updated_at REAL
        )
    """)
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS referrals(
            id TEXT PRIMARY KEY,
            user_id TEXT,
            email TEXT,
            source TEXT NOT NULL,
            campaign TEXT,
            medium TEXT,
            created_at REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_referrals_source ON referrals(source)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at)")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics_aggregates(
            day DATE PRIMARY KEY,
            dau INTEGER NOT NULL DEFAULT 0,
            wau INTEGER NOT NULL DEFAULT 0,
            mau INTEGER NOT NULL DEFAULT 0,
            computed_at TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS developer_keys(
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            key_hash TEXT UNIQUE NOT NULL,
            key_prefix TEXT NOT NULL,
            tier TEXT NOT NULL DEFAULT 'sandbox',
            is_active INTEGER NOT NULL DEFAULT 1,
            calls_used INTEGER NOT NULL DEFAULT 0,
            calls_limit INTEGER NOT NULL DEFAULT 1000,
            reset_at REAL NOT NULL,
            created_at REAL NOT NULL,
            last_used_at REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_developer_keys_user_id ON developer_keys(user_id)")
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_developer_keys_key_hash ON developer_keys(key_hash)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_developer_keys_tier ON developer_keys(tier)")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_usage_log(
            id TEXT PRIMARY KEY,
            key_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER NOT NULL,
            response_time_ms INTEGER,
            created_at REAL NOT NULL,
            FOREIGN KEY (key_id) REFERENCES developer_keys(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_usage_log_key_id ON api_usage_log(key_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_usage_log_created_at ON api_usage_log(created_at)")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS partners(
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            webhook_url TEXT,
            revenue_share REAL NOT NULL DEFAULT 0.7,
            is_verified INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            stripe_connect_id TEXT,
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL,
            metadata TEXT
        )
    """)
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_email ON partners(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_partners_verified ON partners(is_verified)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active)")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings(
            id TEXT PRIMARY KEY,
            partner_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            price_cents INTEGER NOT NULL DEFAULT 0,
            is_verified INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            downloads INTEGER NOT NULL DEFAULT 0,
            rating REAL,
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL,
            metadata TEXT,
            FOREIGN KEY (partner_id) REFERENCES partners(id)
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_listings_partner_id ON listings(partner_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_listings_verified ON listings(is_verified)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category)")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS marketplace_orders(
            id TEXT PRIMARY KEY,
            listing_id TEXT NOT NULL,
            partner_id TEXT NOT NULL,
            user_id TEXT,
            amount_cents INTEGER NOT NULL,
            partner_share_cents INTEGER NOT NULL,
            platform_fee_cents INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            stripe_payment_intent_id TEXT,
            created_at REAL NOT NULL,
            completed_at REAL,
            FOREIGN KEY (listing_id) REFERENCES listings(id),
            FOREIGN KEY (partner_id) REFERENCES partners(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_orders_listing_id ON marketplace_orders(listing_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_orders_partner_id ON marketplace_orders(partner_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status)")
    
    # SQLite-specific optimizations
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    
    conn.commit()
    log.info("SQLite schema initialized successfully")
