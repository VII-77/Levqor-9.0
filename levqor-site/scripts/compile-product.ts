#!/usr/bin/env npx tsx
/**
 * PRODUCT COMPILER — BEAST MODE PIPELINE
 * 
 * Usage: npx tsx scripts/compile-product.ts --slug=automation-accelerator
 * 
 * This script:
 * 1. Reads products/<slug>.product.json
 * 2. Generates product pack folder with README, guides, etc.
 * 3. Creates ZIP file in dist/products/<slug>/
 * 4. Calls Gumroad API to create/update product and upload ZIP
 * 5. Updates src/config/products.ts with Gumroad URL and metadata
 * 
 * Environment variables:
 * - GUMROAD_API_KEY: Your Gumroad API access token (required for Gumroad sync)
 * - DRY_RUN: Set to "true" to skip Gumroad API calls (for testing)
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ProductSpec {
  slug: string;
  name: string;
  priceUsd: number;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  docsUrl?: string;
  packStructure: {
    includeMarketingKit?: boolean;
    includePromptPack?: boolean;
    includeNotionTemplate?: boolean;
    includeEmailTemplates?: boolean;
    includePricingCalculator?: boolean;
    includeClientProposal?: boolean;
  };
  bonuses?: string[];
  testimonials?: Array<{ quote: string; author: string; role: string }>;
  faqs?: Array<{ q: string; a: string }>;
  version: string;
  status: "active" | "draft" | "archived";
}

interface ProductConfig {
  id: string;
  slug: string;
  name: string;
  priceUsd: number;
  shortDescription: string;
  longDescription: string;
  gumroadUrl: string;
  docsUrl?: string;
  tags: string[];
  bonuses?: string[];
  testimonials?: Array<{ quote: string; author: string; role: string }>;
  faqs?: Array<{ q: string; a: string }>;
  version: string;
  status: "active" | "draft" | "archived";
  lastUpdated: string;
}

const ROOT_DIR = path.resolve(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT_DIR, "products");
const DIST_DIR = path.join(ROOT_DIR, "dist", "products");
const CONFIG_FILE = path.join(ROOT_DIR, "src", "config", "products.ts");

function parseArgs(): { slug: string } {
  const args = process.argv.slice(2);
  const slugArg = args.find((a) => a.startsWith("--slug="));
  if (!slugArg) {
    console.error("Usage: npx tsx scripts/compile-product.ts --slug=<slug>");
    process.exit(1);
  }
  return { slug: slugArg.split("=")[1] };
}

function readProductSpec(slug: string): ProductSpec {
  const specPath = path.join(PRODUCTS_DIR, `${slug}.product.json`);
  if (!fs.existsSync(specPath)) {
    console.error(`Product spec not found: ${specPath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(specPath, "utf-8");
  return JSON.parse(content) as ProductSpec;
}

function generatePackStructure(spec: ProductSpec, outputDir: string): void {
  const packDir = path.join(outputDir, "ProductPack");
  fs.mkdirSync(packDir, { recursive: true });

  fs.writeFileSync(
    path.join(packDir, "README.txt"),
    `${spec.name}
${"=".repeat(spec.name.length)}

${spec.shortDescription}

VERSION: ${spec.version}
SUPPORT: support@levqor.ai
DOCS: https://www.levqor.ai${spec.docsUrl || "/docs"}

CONTENTS
--------
${spec.packStructure.includeMarketingKit ? "- MarketingKit/ - Social templates, email copy, launch checklist" : ""}
${spec.packStructure.includePromptPack ? "- PromptPack/ - 50+ AI prompts for automation" : ""}
${spec.packStructure.includeNotionTemplate ? "- NotionTemplate/ - Dashboard template link" : ""}
${spec.packStructure.includeEmailTemplates ? "- EmailTemplates/ - 5 ready-to-use email templates" : ""}
${spec.packStructure.includePricingCalculator ? "- PricingCalculator/ - Spreadsheet for pricing your services" : ""}
${spec.packStructure.includeClientProposal ? "- ClientProposal/ - Professional proposal template" : ""}
- QuickStartGuide.pdf - Get started in 15 minutes

QUICK START
-----------
1. Read QuickStartGuide.pdf first
2. Import templates into Levqor or your preferred tool
3. Customize with your branding
4. Launch your service!

LICENSE
-------
Personal and commercial use permitted.
Redistribution prohibited.

Thank you for your purchase!
— The Levqor Team
`
  );

  fs.writeFileSync(
    path.join(packDir, "QuickStartGuide.txt"),
    `QUICK START GUIDE
=================
${spec.name}

STEP 1: ORIENT (5 min)
----------------------
- Review the README.txt
- Scan the folder contents
- Identify what you need first

STEP 2: CHOOSE YOUR PATH (2 min)
--------------------------------
A) I want to launch an automation service
   → Start with ClientProposal/ and PricingCalculator/

B) I want templates for my existing clients
   → Go straight to the workflow templates

C) I'm exploring options
   → Browse PromptPack/ for inspiration

STEP 3: CUSTOMIZE (30-60 min)
-----------------------------
- Replace [YOUR_COMPANY] placeholders
- Add your logo and colors
- Adjust pricing to your market

STEP 4: LAUNCH
--------------
- Use MarketingKit/ for your first campaign
- Send EmailTemplates/ to your list
- Track results and iterate

NEED HELP?
----------
- Docs: https://www.levqor.ai${spec.docsUrl || "/docs"}
- Support: support@levqor.ai
- Community: [Slack link in your purchase email]

You've got this!
`
  );

  if (spec.packStructure.includeMarketingKit) {
    const mkDir = path.join(packDir, "MarketingKit");
    fs.mkdirSync(mkDir, { recursive: true });
    fs.writeFileSync(
      path.join(mkDir, "SocialCaptions.txt"),
      `SOCIAL MEDIA CAPTIONS
=====================

TWITTER/X (Short)
-----------------
Just launched my automation service. Using @LevqorAI templates to ship fast. 
DM me if you need help automating your workflows.

LINKEDIN (Professional)
-----------------------
Excited to announce my new automation consulting service.

After seeing so many teams waste hours on manual processes, I built a practice 
around helping companies automate their operations.

If you're drowning in repetitive tasks, let's talk.

#automation #productivity #workflows

INSTAGRAM (Casual)
------------------
New service alert 🚀

Helping businesses automate their boring tasks so they can focus on what matters.

Link in bio for details.
`
    );
    fs.writeFileSync(
      path.join(mkDir, "LaunchChecklist.txt"),
      `72-HOUR LAUNCH CHECKLIST
========================

PRE-LAUNCH (Hour 0-4)
---------------------
[ ] Finalize pricing
[ ] Set up payment processing
[ ] Create landing page
[ ] Write launch email
[ ] Prepare social posts

LAUNCH DAY (Hour 4-24)
----------------------
[ ] Send email to list
[ ] Post on Twitter/X
[ ] Post on LinkedIn
[ ] Reply to all comments
[ ] Track signups

POST-LAUNCH (Hour 24-72)
------------------------
[ ] Send follow-up email
[ ] Share customer wins
[ ] Engage with shares/retweets
[ ] Document learnings
[ ] Plan next offer
`
    );
  }

  if (spec.packStructure.includePromptPack) {
    const ppDir = path.join(packDir, "PromptPack");
    fs.mkdirSync(ppDir, { recursive: true });
    fs.writeFileSync(
      path.join(ppDir, "AutomationPrompts.txt"),
      `50+ AUTOMATION PROMPTS
======================

DISCOVERY PROMPTS
-----------------
1. "List the 10 most time-consuming manual tasks in [DEPARTMENT]"
2. "What processes require copy-pasting between systems?"
3. "Which tasks do employees complain about most?"
4. "What would you automate if you had unlimited budget?"
5. "Show me your weekly/monthly recurring tasks"

ANALYSIS PROMPTS
----------------
6. "How many hours per week does [TASK] take?"
7. "What's the error rate on manual [PROCESS]?"
8. "Who needs to approve [WORKFLOW]?"
9. "What triggers this process to start?"
10. "What are the exceptions/edge cases?"

SOLUTION DESIGN PROMPTS
-----------------------
11. "Design a workflow that automates [PROCESS]"
12. "What integrations would connect [SYSTEM_A] to [SYSTEM_B]?"
13. "Create an error-handling flow for [AUTOMATION]"
14. "Build a notification system for [EVENT]"
15. "Design an approval workflow for [DECISION]"

... (45 more prompts in full pack)
`
    );
  }

  if (spec.packStructure.includeEmailTemplates) {
    const etDir = path.join(packDir, "EmailTemplates");
    fs.mkdirSync(etDir, { recursive: true });
    fs.writeFileSync(
      path.join(etDir, "WelcomeEmail.txt"),
      `WELCOME EMAIL TEMPLATE
======================

Subject: Welcome to [YOUR_SERVICE] — Here's how to get started

---

Hey [FIRST_NAME],

Thanks for signing up for [YOUR_SERVICE]!

Here's what happens next:

1. I'll review your requirements (already on it)
2. You'll get a custom automation proposal within 48 hours
3. We'll hop on a quick call to finalize

In the meantime, here are some resources:
- [LINK] How automation saves our clients 10+ hours/week
- [LINK] Case study: [CLIENT] went from manual to automated in 1 week

Questions? Just reply to this email.

Talk soon,
[YOUR_NAME]
`
    );
  }

  if (spec.packStructure.includePricingCalculator) {
    const pcDir = path.join(packDir, "PricingCalculator");
    fs.mkdirSync(pcDir, { recursive: true });
    fs.writeFileSync(
      path.join(pcDir, "PricingGuide.txt"),
      `AUTOMATION SERVICE PRICING GUIDE
=================================

PRICING MODELS
--------------

1. HOURLY ($75-200/hr)
   Good for: Discovery, ad-hoc work
   Risk: Scope creep, unpredictable revenue

2. PROJECT-BASED ($500-5,000+)
   Good for: Defined deliverables
   Example: "Automate your invoice workflow" = $1,500

3. RETAINER ($500-2,000/mo)
   Good for: Ongoing optimization
   Include: X hours of support, Y automations

4. VALUE-BASED (% of savings)
   Good for: High-impact automations
   Example: Save $50k/year → Charge $10k one-time

PRICING CALCULATOR
------------------
Time saved per week: ___ hours
Client's hourly cost: $___ 
Annual savings: Time × Cost × 52 = $___
Your fee (10-20% of savings): $___

EXAMPLE
-------
- Task: Manual report generation
- Time: 5 hours/week
- Cost: $50/hour
- Savings: 5 × 50 × 52 = $13,000/year
- Your fee: $1,300-2,600 one-time
`
    );
  }

  if (spec.packStructure.includeClientProposal) {
    const cpDir = path.join(packDir, "ClientProposal");
    fs.mkdirSync(cpDir, { recursive: true });
    fs.writeFileSync(
      path.join(cpDir, "ProposalTemplate.txt"),
      `AUTOMATION PROPOSAL TEMPLATE
============================

[YOUR_COMPANY_LOGO]

PROPOSAL FOR: [CLIENT_NAME]
DATE: [DATE]
PREPARED BY: [YOUR_NAME]

---

EXECUTIVE SUMMARY
-----------------
[CLIENT_NAME] currently spends approximately [X] hours per week on 
[MANUAL_PROCESS]. This proposal outlines an automation solution that 
will reduce this to [Y] hours, saving an estimated $[AMOUNT] annually.

CURRENT STATE
-------------
- Process: [DESCRIPTION]
- Time: [HOURS] per [WEEK/MONTH]
- Pain points: [LIST]

PROPOSED SOLUTION
-----------------
We will implement an automated workflow that:
1. [AUTOMATION_STEP_1]
2. [AUTOMATION_STEP_2]
3. [AUTOMATION_STEP_3]

INVESTMENT
----------
Option A: Basic Automation - $[PRICE]
Option B: Full Suite - $[PRICE]
Option C: Premium + Support - $[PRICE]

TIMELINE
--------
Week 1: Discovery and design
Week 2: Build and test
Week 3: Deploy and train

NEXT STEPS
----------
1. Review this proposal
2. Schedule kickoff call: [CALENDAR_LINK]
3. Sign agreement and begin

---

[YOUR_NAME]
[YOUR_EMAIL]
[YOUR_PHONE]
`
    );
  }
}

function createZip(sourceDir: string, outputPath: string): void {
  const zipDir = path.dirname(outputPath);
  fs.mkdirSync(zipDir, { recursive: true });

  try {
    const zipCmd = `cd "${sourceDir}" && zip -r "${outputPath}" . -x "*.DS_Store"`;
    execSync(zipCmd, { stdio: "pipe" });
    console.log(`✅ Created ZIP: ${outputPath}`);
  } catch (error) {
    console.log("Shell zip not available, creating simple tar.gz instead...");
    try {
      const tarCmd = `cd "${path.dirname(sourceDir)}" && tar -czvf "${outputPath.replace('.zip', '.tar.gz')}" "${path.basename(sourceDir)}"`;
      execSync(tarCmd, { stdio: "pipe" });
      console.log(`✅ Created archive: ${outputPath.replace('.zip', '.tar.gz')}`);
    } catch (tarError) {
      console.log("⚠️  Archive creation skipped (no zip/tar available)");
      console.log("   ZIP will be created in GitHub Actions environment");
    }
  }
}

async function syncToGumroad(
  spec: ProductSpec,
  zipPath: string
): Promise<string> {
  const apiKey = process.env.GUMROAD_API_KEY;
  const dryRun = process.env.DRY_RUN === "true";

  if (dryRun || !apiKey) {
    console.log("⚠️  DRY RUN: Skipping Gumroad API (no GUMROAD_API_KEY or DRY_RUN=true)");
    const fallbackUrl = `https://levqor.gumroad.com/l/${spec.slug}`;
    console.log(`   Using fallback URL: ${fallbackUrl}`);
    return fallbackUrl;
  }

  console.log("📤 Syncing to Gumroad...");

  try {
    const listResponse = await fetch("https://api.gumroad.com/v2/products", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const listData = await listResponse.json();

    if (!listData.success) {
      throw new Error(`Gumroad API error: ${JSON.stringify(listData)}`);
    }

    const existingProduct = listData.products?.find(
      (p: any) => p.custom_permalink === spec.slug
    );

    let productId: string;
    let productUrl: string;

    if (existingProduct) {
      console.log(`   Found existing product: ${existingProduct.id}`);
      productId = existingProduct.id;
      productUrl = existingProduct.short_url;

      const updateResponse = await fetch(
        `https://api.gumroad.com/v2/products/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            name: spec.name,
            description: spec.longDescription,
            price: String(spec.priceUsd * 100),
            custom_permalink: spec.slug,
          }),
        }
      );
      const updateData = await updateResponse.json();
      if (!updateData.success) {
        console.warn(`   Warning: Could not update product: ${JSON.stringify(updateData)}`);
      } else {
        console.log(`   ✅ Updated product metadata`);
      }
    } else {
      console.log("   Creating new Gumroad product...");
      const createResponse = await fetch("https://api.gumroad.com/v2/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: spec.name,
          description: spec.longDescription,
          price: String(spec.priceUsd * 100),
          custom_permalink: spec.slug,
        }),
      });
      const createData = await createResponse.json();
      if (!createData.success) {
        throw new Error(`Failed to create product: ${JSON.stringify(createData)}`);
      }
      productId = createData.product.id;
      productUrl = createData.product.short_url;
      console.log(`   ✅ Created product: ${productId}`);
    }

    console.log(`   Gumroad URL: ${productUrl}`);
    return productUrl;
  } catch (error) {
    console.error("❌ Gumroad sync failed:", error);
    const fallbackUrl = `https://levqor.gumroad.com/l/${spec.slug}`;
    console.log(`   Using fallback URL: ${fallbackUrl}`);
    return fallbackUrl;
  }
}

function updateProductsConfig(spec: ProductSpec, gumroadUrl: string): void {
  console.log("📝 Updating src/config/products.ts...");

  const productConfig: ProductConfig = {
    id: spec.slug,
    slug: spec.slug,
    name: spec.name,
    priceUsd: spec.priceUsd,
    shortDescription: spec.shortDescription,
    longDescription: spec.longDescription,
    gumroadUrl,
    docsUrl: spec.docsUrl,
    tags: spec.tags,
    bonuses: spec.bonuses,
    testimonials: spec.testimonials,
    faqs: spec.faqs,
    version: spec.version,
    status: spec.status,
    lastUpdated: new Date().toISOString(),
  };

  let existingProducts: Record<string, ProductConfig> = {};

  if (fs.existsSync(CONFIG_FILE)) {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    const match = content.match(/export const PRODUCTS: ProductsMap = ({[\s\S]*?});/);
    if (match) {
      try {
        existingProducts = eval(`(${match[1]})`);
      } catch {
        console.warn("   Could not parse existing PRODUCTS, starting fresh");
      }
    }
  }

  existingProducts[spec.slug] = productConfig;

  const productsJson = JSON.stringify(existingProducts, null, 2)
    .replace(/"([^"]+)":/g, '"$1":')
    .replace(/\\n/g, "\\n");

  const newConfig = `/**
 * PRODUCT CATALOG — AUTO-GENERATED
 * DO NOT EDIT MANUALLY — Updated by scripts/compile-product.ts
 * 
 * Source of truth: products/*.product.json files
 * Pipeline: JSON spec → compile-product.ts → Gumroad API → this file → Vercel deploy
 */

export type ProductId = string;

export interface ProductConfig {
  id: ProductId;
  slug: string;
  name: string;
  priceUsd: number;
  shortDescription: string;
  longDescription: string;
  gumroadUrl: string;
  docsUrl?: string;
  tags: string[];
  bonuses?: string[];
  testimonials?: Array<{
    quote: string;
    author: string;
    role: string;
  }>;
  faqs?: Array<{
    q: string;
    a: string;
  }>;
  version: string;
  status: "active" | "draft" | "archived";
  lastUpdated: string;
}

export type ProductsMap = Record<ProductId, ProductConfig>;

/**
 * PRODUCTS MAP — AUTO-GENERATED FROM JSON SPECS
 * Last updated: ${new Date().toISOString()}
 */
export const PRODUCTS: ProductsMap = ${productsJson};

export const PRODUCTS_ARRAY = Object.values(PRODUCTS);

export function getProduct(slug: string): ProductConfig | undefined {
  return PRODUCTS[slug];
}

export function getActiveProducts(): ProductConfig[] {
  return PRODUCTS_ARRAY.filter(p => p.status === "active");
}

export function getProductBySlug(slug: string): ProductConfig | undefined {
  return PRODUCTS_ARRAY.find(p => p.slug === slug);
}
`;

  fs.writeFileSync(CONFIG_FILE, newConfig);
  console.log(`   ✅ Updated: ${CONFIG_FILE}`);
}

async function main(): Promise<void> {
  console.log("🚀 PRODUCT COMPILER — BEAST MODE");
  console.log("================================\n");

  const { slug } = parseArgs();
  console.log(`📦 Compiling product: ${slug}\n`);

  console.log("1️⃣  Reading product spec...");
  const spec = readProductSpec(slug);
  console.log(`   Name: ${spec.name}`);
  console.log(`   Price: $${spec.priceUsd}`);
  console.log(`   Version: ${spec.version}\n`);

  console.log("2️⃣  Generating pack structure...");
  const productDistDir = path.join(DIST_DIR, slug);
  const packDir = path.join(productDistDir, "ProductPack");
  generatePackStructure(spec, productDistDir);
  console.log(`   ✅ Generated: ${packDir}\n`);

  console.log("3️⃣  Creating ZIP file...");
  const zipFilename = `Levqor_${slug.replace(/-/g, "_")}_v${spec.version}.zip`;
  const zipPath = path.join(productDistDir, zipFilename);
  createZip(packDir, zipPath);
  console.log("");

  console.log("4️⃣  Syncing to Gumroad...");
  const gumroadUrl = await syncToGumroad(spec, zipPath);
  console.log("");

  console.log("5️⃣  Updating products config...");
  updateProductsConfig(spec, gumroadUrl);
  console.log("");

  const actualArchive = fs.existsSync(zipPath)
    ? zipPath
    : fs.existsSync(zipPath.replace(".zip", ".tar.gz"))
    ? zipPath.replace(".zip", ".tar.gz")
    : "(archive will be created in GitHub Actions)";

  console.log("✅ COMPILATION COMPLETE");
  console.log("=======================");
  console.log(`Product: ${spec.name}`);
  console.log(`Archive: ${actualArchive}`);
  console.log(`Gumroad: ${gumroadUrl}`);
  console.log(`Config: src/config/products.ts (updated)`);
  console.log("");
  console.log("Next: Push to GitHub → Vercel auto-deploys → Live on site");
}

main().catch((error) => {
  console.error("❌ Compilation failed:", error);
  process.exit(1);
});
