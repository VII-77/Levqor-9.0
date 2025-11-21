# CRITICAL: Database Migration Required

## 🚨 ISSUE

**Backend is using SQLite instead of PostgreSQL** despite having DATABASE_URL configured.

### Current State
- ✅ PostgreSQL provisioned and DATABASE_URL set
- ✅ psycopg2-binary installed
- ✅ db_utils.py module supports both databases
- ❌ run.py hardcoded to use SQLite connection
- ⚠️ 1.6MB SQLite database with production data

### Impact
- **Development**: Works fine with SQLite
- **Production**: SQLite file-based database won't scale
- **Deployment**: Vercel/cloud deployments need PostgreSQL

---

## 🔧 MIGRATION PLAN

### Step 1: Refactor Database Connection

Modify `run.py` line 66-216 to use PostgreSQL when DATABASE_URL exists:

```python
# Current (WRONG):
_db_connection = sqlite3.connect(DB_PATH, check_same_thread=False)

# Should be:
from modules.db_utils import get_db_connection, get_db_type

def get_db():
    db_type = get_db_type()  # Returns 'postgresql' if DATABASE_URL set
    if db_type == 'postgresql':
        return get_postgresql_db()
    else:
        return get_sqlite_db()
```

### Step 2: Convert Query Syntax

**Problem**: PostgreSQL uses `%s` placeholders, SQLite uses `?`

```python
# SQLite (current):
cur.execute("SELECT * FROM users WHERE email = ?", (email,))

# PostgreSQL (needs):
cur.execute("SELECT * FROM users WHERE email = %s", (email,))
```

**Solution**: Create query adapter or use db_utils.execute_query()

### Step 3: Remove SQLite-Specific Code

Lines 213-214 in run.py:
```python
# REMOVE THESE (SQLite-only):
_db_connection.execute("PRAGMA journal_mode=WAL")
_db_connection.execute("PRAGMA synchronous=NORMAL")
```

### Step 4: Migrate Existing Data

**Option A: Fresh Start**
```bash
# Drop SQLite, start with empty PostgreSQL
rm levqor.db
# Schema will auto-create on first backend start
```

**Option B: Data Migration** (if you need existing data)
```bash
# Export SQLite to SQL dump
sqlite3 levqor.db .dump > levqor_backup.sql

# Convert to PostgreSQL format and import
# (requires manual SQL editing or pgloader tool)
```

### Step 5: Test & Verify

```bash
# 1. Update run.py
# 2. Restart backend
# 3. Test endpoints:
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/users/me

# 4. Check backend logs for PostgreSQL connection
grep -i "postgres\|database" /tmp/logs/levqor-backend_*.log
```

---

## 📊 AFFECTED FILES

- `run.py` (lines 50, 66-216, 494-880) - 13 database calls
- `monitors/scheduler.py` - Uses SQLite directly
- `api/*/` - Multiple API endpoints use get_db()

---

## ⏱️ MIGRATION TIMELINE

**Complexity**: HIGH (multi-file refactor, query syntax changes)
**Estimated Time**: 2-4 hours for full migration
**Risk**: MEDIUM (data migration, connection pool changes)

---

## 🎯 RECOMMENDATION

### For Immediate Production Launch:
1. **Deploy with SQLite for now** (works but not optimal)
2. **Schedule PostgreSQL migration** within first week
3. **Monitor**: SQLite can handle moderate load

### For Production-Ready System:
1. **Complete migration before launch**
2. **Test thoroughly** with PostgreSQL
3. **Verify all 18 scheduled jobs** work with PostgreSQL

---

## 📝 NOTES

- PostgreSQL is production-standard for SaaS applications
- SQLite doesn't support concurrent writes (bottleneck for multi-worker Gunicorn)
- Current config: 2 Gunicorn workers - SQLite write conflicts likely
- DATABASE_URL already configured - just need code changes

---

## ✅ QUICK WIN

If you want PostgreSQL immediately without code changes:

**Use the existing db_utils module**:
```python
# Instead of:
db = get_db()
cur = db.execute("SELECT * FROM users WHERE id = ?", (uid,))

# Use:
from modules.db_utils import execute_query
result = execute_query("SELECT * FROM users WHERE id = %s", (uid,), fetch='one')
```

This leverages the smart db_utils that auto-detects PostgreSQL!
