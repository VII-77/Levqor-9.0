# New Product Autopilot — Replit Agent Prompt

Copy this entire prompt, replace the ALL-CAPS placeholders at the bottom, and paste into Replit Agent.

---

```
You are working in /home/runner/workspace/levqor-site.

GOAL
Add a NEW product to the Levqor system end-to-end using the existing product pipeline + Omega asset wiring.

I will give you:
- SLUG: NEW_SLUG_HERE      (e.g. ascend-launch-system)
- NAME: NEW_NAME_HERE      (e.g. Ascend Launch System)
- PRICE: NEW_PRICE_USD     (e.g. 17)
- DESCRIPTION: SHORT_PLAIN_ENGLISH_DESCRIPTION
- TAGS: comma-separated TAG1, TAG2, TAG3

You must:
1) Create the product JSON spec
2) Wire it into the compile pipeline
3) Ensure Omega asset folders for that slug
4) Rebuild the config
5) Show me exactly what changed

DETAILS

==================================================
STEP 1 — CREATE products/<slug>.product.json
==================================================

Create a new file at:
  products/NEW_SLUG_HERE.product.json

Base structure (fill in from NAME, PRICE, DESCRIPTION, TAGS):

{
  "slug": "NEW_SLUG_HERE",
  "name": "NEW_NAME_HERE",
  "priceUsd": NEW_PRICE_USD,
  "shortDescription": "1–2 line benefit statement based on DESCRIPTION.",
  "longDescription": "Multi-paragraph breakdown of what the buyer gets, written clearly and simply.",
  "tags": [/* split TAGS into array */],
  "docsUrl": "/docs/NEW_SLUG_HERE",
  "packStructure": {
    "includeMarketingKit": true,
    "includePromptPack": true,
    "includeNotionTemplate": true,
    "includeEmailTemplates": true,
    "includePricingCalculator": true,
    "includeClientProposal": true
  },
  "bonuses": [
    "Bonus 1 based on product idea",
    "Bonus 2 based on product idea"
  ],
  "testimonials": [],
  "faqs": [],
  "version": "1.0.0",
  "status": "active"
}

Fill in:
- shortDescription, longDescription from DESCRIPTION
- tags from TAGS
- bonuses with sensible defaults

Show me the final JSON content.

==================================================
STEP 2 — RUN THE PRODUCT COMPILER
==================================================

From /home/runner/workspace/levqor-site run:

npx tsx scripts/compile-product.ts --slug=NEW_SLUG_HERE 2>&1 | tee /tmp/compile-NEW_SLUG_HERE.log

This must:
- Generate/refresh the product entry in src/config/products.ts
- Trigger the Omega asset path population (coverImage, thumbnailImage, heroImage)
- Attempt Drive upload (it may fail locally, but must not crash)

Afterwards, show:

1) The config block for this product:

   sed -n '/"NEW_SLUG_HERE"/,/lastUpdated/p' src/config/products.ts

2) Any DRIVE-related lines:

   grep -i "Drive" /tmp/compile-NEW_SLUG_HERE.log || echo "No Drive lines"

==================================================
STEP 3 — ENSURE OMEGA ASSET TREE FOR THIS PRODUCT
==================================================

Call the Omega asset helper (if not already called in the compiler):

- Verify the folder exists:

  ls -R public/assets/Levqor-Omega-Empire-Pack/products/NEW_SLUG_HERE || echo "MISSING"

If it is missing, you MUST:

- Import and call ensureOmegaAssetsForProduct("NEW_SLUG_HERE") from scripts/omega-assets.ts
  (Most likely already wired, but double-check.)

Then re-run:

  npx tsx scripts/compile-product.ts --slug=NEW_SLUG_HERE
  ls -R public/assets/Levqor-Omega-Empire-Pack/products/NEW_SLUG_HERE

I expect to see all the placeholder .txt files under:
- Product-Cover
- Thumbnails
- Hero-Banners
- Social-Posts
- Carousel-Posts
- Ad-Creatives
- CTA-Cards
- Video-Frames
- Brand-Geometry-Pack

==================================================
STEP 4 — VERIFY FRONTEND WIRING
==================================================

1) Confirm ProductConfig entry includes:

- "coverImage"
- "thumbnailImage"
- "heroImage"

with values like:

"/assets/Levqor-Omega-Empire-Pack/products/NEW_SLUG_HERE/Product-Cover/levqor-cover-v1.png"
"/assets/Levqor-Omega-Empire-Pack/products/NEW_SLUG_HERE/Thumbnails/thumb-build-automations-fast.png"
"/assets/Levqor-Omega-Empire-Pack/products/NEW_SLUG_HERE/Hero-Banners/website-hero-v1.png"

2) Confirm that ProductCard and ProductHero can render this product:

- Run a type-safe build check:

  npx tsc --noEmit src/config/products.ts src/components/dashboard/ProductCard.tsx src/components/products/ProductHero.tsx 2>&1 || echo "tsc warnings above"

You do NOT need to run full next build, just ensure no hard errors.

==================================================
STEP 5 — REPORT DIFF
==================================================

Show me:

git diff -- products/NEW_SLUG_HERE.product.json src/config/products.ts | sed -n '1,160p'

If git is not available, at least show:
- Final JSON file
- Final config block
- Final ls -R of the Omega asset folder

==================================================
INPUT FOR THIS RUN
==================================================

SLUG: NEW_SLUG_HERE
NAME: NEW_NAME_HERE
PRICE: NEW_PRICE_USD
DESCRIPTION: SHORT_PLAIN_ENGLISH_DESCRIPTION
TAGS: TAG1, TAG2, TAG3
```

---

## How to Use

1. Copy everything between the triple backticks above
2. Replace these 5 placeholders at the bottom:
   - `NEW_SLUG_HERE` → your product slug (e.g., `ascend-launch-system`)
   - `NEW_NAME_HERE` → your product name (e.g., `Ascend Launch System`)
   - `NEW_PRICE_USD` → price as number (e.g., `17`)
   - `SHORT_PLAIN_ENGLISH_DESCRIPTION` → what it does
   - `TAG1, TAG2, TAG3` → comma-separated tags
3. Paste into Replit Agent
4. Agent creates JSON, compiles, wires Omega assets, updates config
5. You drop real PNGs and create Gumroad listing

## Example Input

```
SLUG: ascend-launch-system
NAME: Ascend Launch System
PRICE: 17
DESCRIPTION: A complete launch playbook for first-time automation sellers. Includes positioning templates, pricing frameworks, and a 30-day launch calendar.
TAGS: launch, playbook, beginners, positioning
```
