/**
 * PRODUCT CATALOG — AUTO-GENERATED
 * DO NOT EDIT MANUALLY — Updated by scripts/compile-product.ts
 * 
 * Source of truth: products/*.product.json files
 * Pipeline: JSON spec → compile-product.ts → Google Drive → this file → Vercel deploy
 */

export type ProductId = string;

export interface ProductConfig {
  id: ProductId;
  slug: string;
  name: string;
  priceUsd: number;
  shortDescription: string;
  longDescription: string;
  driveDownloadUrl: string;
  gumroadUrl?: string;
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
 * Last updated: 2025-12-05T22:27:29.763Z
 */
export const PRODUCTS: ProductsMap = {
  "automation-accelerator": {
    "id": "automation-accelerator",
    "slug": "automation-accelerator",
    "name": "Automation Accelerator Pack",
    "priceUsd": 47,
    "shortDescription": "25 workflow templates + SOPs + swipe files. Ship your first automation service in 48 hours.",
    "longDescription": "The complete toolkit for founders and agencies who want to ship automation fast. Includes 25 production-ready workflow templates, copy-paste SOPs for client onboarding, a swipe file with 50+ automation prompts, pricing calculator, client proposal template, onboarding checklists, and everything you need to go from zero to revenue.\n\nPerfect for:\n• Solo founders launching their first automation service\n• Agencies adding workflow automation to their offerings\n• Consultants who want productized templates\n• Anyone tired of building from scratch\n\nIncludes Quick Start Guide, video walkthrough, Notion dashboard template, and 5 email templates. Plus limited-time bonuses: 30-min strategy call booking, private Slack community access, and monthly template updates for 1 year.",
    "driveDownloadUrl": "https://drive.google.com/file/d/DRY_RUN_Levqor_automation_accelerator_v1.0.2.zip/view",
    "gumroadUrl": "https://levqor.gumroad.com/l/automation-accelerator",
    "docsUrl": "/docs/automation-accelerator",
    "tags": [
      "automation",
      "workflows",
      "templates",
      "agency",
      "saas",
      "no-code",
      "ai",
      "productivity"
    ],
    "bonuses": [
      "30-min strategy call booking link",
      "Private Slack community access",
      "Monthly template updates (1 year)"
    ],
    "testimonials": [
      {
        "quote": "Saved me 20+ hours of setup. Worth every penny.",
        "author": "Sarah K.",
        "role": "Agency Founder"
      },
      {
        "quote": "Finally shipped my first automation service in a weekend.",
        "author": "Marcus T.",
        "role": "Freelance Consultant"
      },
      {
        "quote": "The templates alone are worth 10x the price.",
        "author": "Priya M.",
        "role": "Ops Manager"
      }
    ],
    "faqs": [
      {
        "q": "What format are the templates?",
        "a": "Everything is delivered as editable files: JSON for workflows, Google Docs/Notion for SOPs, and spreadsheets for calculators. Import directly into Levqor or adapt for any platform."
      },
      {
        "q": "Do I need a Levqor subscription?",
        "a": "No. The templates work standalone. However, they're optimized for Levqor's workflow builder—import with one click if you're a user."
      },
      {
        "q": "Is there a refund policy?",
        "a": "Yes. 30-day no-questions-asked refund. If it doesn't help you ship faster, get your money back."
      },
      {
        "q": "How do I access the files?",
        "a": "Instant download after purchase. You'll receive a .zip file and a link to the Notion dashboard."
      }
    ],
    "version": "1.0.2",
    "status": "active",
    "lastUpdated": "2025-12-05T22:27:29.761Z"
  }
};

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
