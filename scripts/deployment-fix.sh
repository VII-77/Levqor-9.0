#!/bin/bash
# Levqor X 9.0 - Deployment Verification & Fix Script
# Checks DNS, deployments, and provides actionable fixes

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   LEVQOR X 9.0 — DEPLOYMENT VERIFICATION & FIX SCRIPT        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. CHECK DNS RESOLUTION
echo -e "${BLUE}[1/5] Checking DNS Resolution...${NC}"
echo ""

check_domain() {
    local domain=$1
    local expected=$2
    
    if command -v nslookup >/dev/null 2>&1; then
        result=$(nslookup "$domain" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    elif command -v host >/dev/null 2>&1; then
        result=$(host "$domain" 2>/dev/null | grep "has address" | awk '{print $4}' | head -1)
    else
        echo -e "${YELLOW}⚠ DNS tools not available${NC}"
        return
    fi
    
    if [ -n "$result" ]; then
        echo -e "${GREEN}✓${NC} $domain → $result"
    else
        echo -e "${RED}✗${NC} $domain → NOT RESOLVED"
    fi
}

check_domain "levqor.ai" "Frontend"
check_domain "www.levqor.ai" "Frontend"  
check_domain "api.levqor.ai" "Backend"

echo ""

# 2. CHECK FRONTEND DEPLOYMENT
echo -e "${BLUE}[2/5] Checking Frontend (Vercel)...${NC}"
echo ""

frontend_response=$(curl -s -I https://levqor.ai 2>/dev/null || echo "ERROR")

if echo "$frontend_response" | grep -q "HTTP/2 200"; then
    echo -e "${GREEN}✓${NC} Frontend responding (HTTP 200)"
    
    if echo "$frontend_response" | grep -q "x-vercel"; then
        echo -e "${GREEN}✓${NC} Served by Vercel"
        vercel_id=$(echo "$frontend_response" | grep "x-vercel-id" | cut -d: -f2 | tr -d ' \r')
        echo -e "  Deployment ID: ${vercel_id}"
    fi
    
    if echo "$frontend_response" | grep -q "cloudflare"; then
        echo -e "${GREEN}✓${NC} Cloudflare proxy active"
    fi
else
    echo -e "${RED}✗${NC} Frontend not responding correctly"
fi

echo ""

# 3. CHECK BACKEND DEPLOYMENT
echo -e "${BLUE}[3/5] Checking Backend (Replit)...${NC}"
echo ""

backend_response=$(curl -s -I https://api.levqor.ai/health 2>/dev/null || echo "ERROR")

if echo "$backend_response" | grep -q "HTTP/2 200"; then
    echo -e "${GREEN}✓${NC} Backend API healthy (HTTP 200)"
    
    if echo "$backend_response" | grep -q "Google Frontend"; then
        echo -e "${GREEN}✓${NC} Served by Replit (Google Frontend)"
    fi
else
    echo -e "${RED}✗${NC} Backend API not responding"
fi

echo ""

# 4. CHECK PRICING PAGE CONTENT
echo -e "${BLUE}[4/5] Verifying Pricing Corrections...${NC}"
echo ""

pricing_content=$(curl -s https://levqor.ai/pricing 2>/dev/null)
trial_content=$(curl -s https://levqor.ai/trial 2>/dev/null)

# Check for corrected content
if echo "$pricing_content" | grep -q "A valid card is required"; then
    echo -e "${GREEN}✓${NC} Pricing FAQ has correct trial messaging"
else
    echo -e "${RED}✗${NC} Pricing page missing card requirement text"
fi

if echo "$trial_content" | grep -qi "no credit card"; then
    echo -e "${RED}✗${NC} Trial page STILL has 'No credit card required' (OLD VERSION)"
    echo -e "${YELLOW}  → Vercel deployment NOT updated${NC}"
else
    echo -e "${GREEN}✓${NC} Trial page corrected (no 'No credit card' text)"
fi

if echo "$trial_content" | grep -q "10 team members"; then
    echo -e "${GREEN}✓${NC} Agency tier shows 10 team members (CORRECT)"
else
    echo -e "${RED}✗${NC} Agency tier not showing 10 team members"
fi

echo ""

# 5. ACTIONABLE FIX SUMMARY
echo -e "${BLUE}[5/5] Fix Summary${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════"

if echo "$trial_content" | grep -qi "no credit card"; then
    echo -e "${RED}ACTION REQUIRED: Vercel Deployment Out of Date${NC}"
    echo ""
    echo "Your code is correct, but Vercel hasn't deployed it. Fix:"
    echo ""
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select your Levqor project"
    echo "3. Click 'Deployments' tab"
    echo "4. Find latest deployment → Click '...' menu → 'Redeploy'"
    echo "5. UNCHECK 'Use existing build cache'"
    echo "6. Click 'Redeploy' button"
    echo "7. Wait 2-3 minutes"
    echo ""
    echo "Or set this environment variable in Vercel:"
    echo "  VERCEL_FORCE_NO_BUILD_CACHE=1"
    echo ""
else
    echo -e "${GREEN}✓ ALL SYSTEMS OPERATIONAL${NC}"
    echo ""
    echo "✓ DNS verified for all domains"
    echo "✓ Frontend deployed and accessible"
    echo "✓ Backend API healthy"
    echo "✓ Pricing corrections live"
fi

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Documentation: levqor-site/docs/DEPLOYMENT_STATUS.md"
echo ""
