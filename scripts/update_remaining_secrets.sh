#!/bin/bash
# Script to update the remaining 6 STRIPE_PRICE_* secrets that couldn't be set programmatically
# These must be updated manually in Replit Secrets UI or via CLI

cat << 'EOF'
================================================================================
UPDATE THESE 6 SECRETS MANUALLY IN REPLIT
================================================================================

The following 6 STRIPE_PRICE_* values need to be updated manually in the
Replit Secrets UI because they already exist as secrets:

STRIPE_PRICE_STARTER=price_1SW5zmBNwdcDOF99v8j2jdEN
STRIPE_PRICE_STARTER_YEAR=price_1SW5zmBNwdcDOF99Xt9jxP4w
STRIPE_PRICE_LAUNCH=price_1SW5zmBNwdcDOF99BvLeIOY1
STRIPE_PRICE_LAUNCH_YEAR=price_1SW5zmBNwdcDOF99iJatpyVd
STRIPE_PRICE_GROWTH=price_1SW5znBNwdcDOF993dJ2LxUu
STRIPE_PRICE_GROWTH_YEAR=price_1SW5znBNwdcDOF99jHLnbgAm

Steps:
1. Open Replit Secrets panel (Tools → Secrets)
2. Find each of the above keys
3. Update with the new LIVE price ID value shown above
4. Save

The other 9 STRIPE_PRICE_* values have been automatically set as environment
variables and are ready to use.

================================================================================
EOF
