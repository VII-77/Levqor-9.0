import os
import logging

logger = logging.getLogger(__name__)

SECURITY_CORE_ENABLED = True

RATE_LIMIT_DEFAULT = 100

RATE_LIMIT_WINDOW_SECONDS = 60

STRIPE_TOLERANCE_SECONDS = 300

LOG_PII_MASKING = True

_hmac_secret = os.getenv("SECURITY_HMAC_SECRET")
if not _hmac_secret:
    logger.warning("⚠️ SECURITY_HMAC_SECRET not set, using dev fallback (NOT FOR PRODUCTION)")
    _hmac_secret = "dev-sec-core-hmac-fallback"

SIMPLE_HMAC_SECRET = _hmac_secret

logger.info(f"✅ Security Core Config loaded (ENABLED={SECURITY_CORE_ENABLED}, RATE_LIMIT={RATE_LIMIT_DEFAULT}/{RATE_LIMIT_WINDOW_SECONDS}s)")
