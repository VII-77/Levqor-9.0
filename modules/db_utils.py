"""
Unified database connection utility
Handles both SQLite (local) and PostgreSQL (production)
"""
import os
import sqlite3
from contextlib import contextmanager

def get_db_type():
    """Detect which database we're using"""
    return 'postgresql' if os.environ.get("DATABASE_URL") else 'sqlite'

def get_sqlite_connection():
    """Get SQLite connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def get_postgresql_connection():
    """Get PostgreSQL connection"""
    import psycopg2
    from psycopg2.extras import RealDictCursor
    return psycopg2.connect(
        os.environ.get("DATABASE_URL"),
        cursor_factory=RealDictCursor
    )

@contextmanager
def get_db_connection():
    """
    Context manager for database connections
    Automatically uses PostgreSQL in production, SQLite locally
    """
    db_type = get_db_type()
    
    if db_type == 'postgresql':
        conn = get_postgresql_connection()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    else:
        conn = get_sqlite_connection()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

def execute_query(query, params=None, fetch='all'):
    """
    Execute a query with automatic database selection
    
    Args:
        query: SQL query string
        params: Query parameters (tuple or dict)
        fetch: 'all', 'one', or None (for INSERT/UPDATE/DELETE)
    
    Returns:
        Query results or None
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        
        if params:
            cur.execute(query, params)
        else:
            cur.execute(query)
        
        if fetch == 'all':
            return cur.fetchall()
        elif fetch == 'one':
            return cur.fetchone()
        else:
            return None
