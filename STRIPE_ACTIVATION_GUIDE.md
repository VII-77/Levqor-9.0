# Stripe Price Activation - Quick Guide

## 🎯 WHAT YOU NEED TO DO

Your Stripe checkout is broken because the price IDs point to **inactive test prices**. You need to create **active production prices** in your Stripe Dashboard.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### 1. Go to Stripe Dashboard
- Open: https://dashboard.stripe.com/products
- Make sure you're in **LIVE MODE** (not Test mode) in the top-right corner

### 2. Create Products & Prices

For **EACH** pricing tier, create a product with both monthly and yearly prices:

#### Required Tiers:
- **Starter** - $19/month, $190/year
- **Launch** - Price TBD
- **Growth** - Price TBD  
- **Scale** - Price TBD
- **Business** - Price TBD
- **Agency** - Price TBD (MISSING - create new)
- **Flow** - Price TBD (MISSING - create new)

#### Add-ons:
- **Priority Support**
- **SLA 99.9%**
- **White Label**
- **DFY Starter**
- **DFY Professional**
- **DFY Enterprise**

### 3. Copy Price IDs

After creating each price, Stripe will give you a **price ID** like:
```
price_1Ab2Cd3Ef4Gh5Ij6Kl7Mn8Op
```

Copy these IDs - you'll need them for the next step.

### 4. Update Replit Secrets

Go to your Replit Secrets panel and update these values with your **ACTIVE** price IDs:

```bash
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_STARTER_YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_LAUNCH=price_xxxxxxxxxxxxx
STRIPE_PRICE_LAUNCH_YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_GROWTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_GROWTH_YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_SCALE=price_xxxxxxxxxxxxx
STRIPE_PRICE_SCALE_YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS_YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_AGENCY=price_xxxxxxxxxxxxx
STRIPE_PRICE_AGENCY_YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_FLOW=price_xxxxxxxxxxxxx
STRIPE_PRICE_FLOW_YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_ADDON_PRIORITY_SUPPORT=price_xxxxxxxxxxxxx
STRIPE_PRICE_ADDON_SLA_99_9=price_xxxxxxxxxxxxx
STRIPE_PRICE_ADDON_WHITE_LABEL=price_xxxxxxxxxxxxx
STRIPE_PRICE_DFY_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_DFY_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_DFY_ENTERPRISE=price_xxxxxxxxxxxxx
```

### 5. Restart Frontend Workflow

After updating secrets:
- Stop the `levqor-frontend` workflow
- Start it again
- Wait for "✓ Ready" message

---

## ✅ VERIFICATION

Test the checkout endpoint:
```bash
curl -X POST http://localhost:5000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"starter","term":"monthly"}'
```

**BEFORE FIX**: Returns error about inactive price  
**AFTER FIX**: Returns `{"url": "https://checkout.stripe.com/..."}`

---

## 🎉 ONCE YOU'RE DONE

**Reply with**: "Stripe prices activated" or just "Done"

Then I'll:
1. Verify the checkout endpoint works
2. Immediately start the PostgreSQL migration
3. Get your system 100% production-ready

---

**Need Help?** Just tell me which step you're stuck on!
