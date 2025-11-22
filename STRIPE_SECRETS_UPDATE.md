# 🔐 Stripe Secrets Update Guide

Your Stripe price IDs are pointing to non-existent prices. Update these secrets in your Replit Secrets tab to use **active** prices from your Stripe account.

## 📋 How to Update

1. **Open Secrets**: Click "Tools" → "Secrets" in Replit sidebar
2. **Edit Each Secret**: Click the 3 dots → "Edit" next to each secret below
3. **Copy the Value**: Use the exact price ID listed below
4. **Save**: Click "Save" for each secret

---

## ✅ Secrets to Update (Copy These Values)

| Secret Name | New Value (Active Price ID) | Description |
|-------------|----------------------------|-------------|
| `STRIPE_PRICE_STARTER` | `price_1STxwZBNwdcDOF99simUPu1y` | ✅ Starter Monthly - $29 |
| `STRIPE_PRICE_LAUNCH` | `price_1SUUn0BNwdcDOF99CSY2yVug` | ✅ Launch Monthly - $9 |
| `STRIPE_PRICE_LAUNCH_YEAR` | `price_1SUUn0BNwdcDOF99dJuJPbVb` | ✅ Launch Yearly - $90 |
| `STRIPE_PRICE_GROWTH` | `price_1SRv8xBNwdcDOF99BFZnQ7ru` | ✅ Growth Monthly - $299 |
| `STRIPE_PRICE_SCALE` | `price_1SUUn1BNwdcDOF9958qfmfU0` | ✅ Scale Monthly - $59 |
| `STRIPE_PRICE_SCALE_YEAR` | `price_1SUUn1BNwdcDOF998jxEyZBX` | ✅ Scale Yearly - $590 |
| `STRIPE_PRICE_BUSINESS` | `price_1SUUn1BNwdcDOF99xT9KQozD` | ✅ Agency Monthly - $149 |
| `STRIPE_PRICE_BUSINESS_YEAR` | `price_1SUUn1BNwdcDOF99l6tIlbWN` | ✅ Agency Yearly - $1490 |

---

## ✅ These Are Already Correct (No Changes Needed)

| Secret Name | Current Value | Status |
|-------------|---------------|--------|
| `STRIPE_PRICE_GROWTH_YEAR` | `price_1ST7zQBNwdcDOF99nlsYDdlL` | ✅ Active ($790/year) |
| `STRIPE_PRICE_PRO` | `price_1SRujgBNwdcDOF99Si6UVhXw` | ✅ Active ($49/month) |
| `STRIPE_PRICE_PRO_YEAR` | `price_1SRujgBNwdcDOF996LzFk6vg` | ✅ Active ($490/year) |
| `STRIPE_PRICE_ADDON_PRIORITY_SUPPORT` | `price_1SRv8wBNwdcDOF99HGOWMBn1` | ✅ Active ($99/month) |
| `STRIPE_PRICE_ADDON_SLA_99_9` | `price_1SRv8wBNwdcDOF99acShV4MJ` | ✅ Active ($199/month) |
| `STRIPE_PRICE_ADDON_WHITE_LABEL` | `price_1SRv8xBNwdcDOF99BFZnQ7ru` | ✅ Active ($299/month) |

---

## 🎯 After Updating

1. **Restart Backend**: Backend will auto-reload with new secrets
2. **Test Checkout**: Run this command to verify:
   ```bash
   curl -X POST http://localhost:8000/api/billing/checkout \
     -H "Content-Type: application/json" \
     -d '{"tier":"starter","billing_interval":"month"}'
   ```
3. **Expected Result**: Should return a Stripe checkout URL like:
   ```json
   {
     "ok": true,
     "url": "https://checkout.stripe.com/c/pay/cs_test_...",
     "session_id": "cs_test_..."
   }
   ```

---

## ⚡ Quick Copy-Paste Format

If you prefer to edit as JSON, use this:

```json
{
  "STRIPE_PRICE_STARTER": "price_1STxwZBNwdcDOF99simUPu1y",
  "STRIPE_PRICE_LAUNCH": "price_1SUUn0BNwdcDOF99CSY2yVug",
  "STRIPE_PRICE_LAUNCH_YEAR": "price_1SUUn0BNwdcDOF99dJuJPbVb",
  "STRIPE_PRICE_GROWTH": "price_1SRv8xBNwdcDOF99BFZnQ7ru",
  "STRIPE_PRICE_SCALE": "price_1SUUn1BNwdcDOF9958qfmfU0",
  "STRIPE_PRICE_SCALE_YEAR": "price_1SUUn1BNwdcDOF998jxEyZBX",
  "STRIPE_PRICE_BUSINESS": "price_1SUUn1BNwdcDOF99xT9KQozD",
  "STRIPE_PRICE_BUSINESS_YEAR": "price_1SUUn1BNwdcDOF99l6tIlbWN"
}
```

---

## 🚀 Why This Matters

Your environment variables were pointing to price IDs that **don't exist** in your Stripe account anymore (they were deleted or never existed). This update maps your tier names to the **active** prices that are currently available in your Stripe dashboard.

Once updated, your checkout flow will work immediately! 🎉
