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
  coverImage?: string;
  thumbnailImage?: string;
  heroImage?: string;
}

export type ProductsMap = Record<ProductId, ProductConfig>;

/**
 * PRODUCTS MAP — AUTO-GENERATED FROM JSON SPECS
 * Last updated: 2025-12-05T23:31:21.098Z
 */
export const PRODUCTS: ProductsMap = {
  "automation-accelerator": {
    "id": "automation-accelerator",
    "slug": "automation-accelerator",
    "name": "Omega Automation Engine",
    "priceUsd": 47,
    "shortDescription": "AI-powered automation engine that turns your workflows into sellable products fast.",
    "longDescription": "Omega Automation Engine is your done-for-you automation system starter kit.\n\nYou get pre-built workflows, plug-and-play SOPs, and a clear structure for turning what you already know into a sellable automation offer.\n\nUse it to:\n• Launch your first automation service quickly\n• Standardize your delivery with battle-tested templates\n• Show clients something real instead of talking in theory\n\nEverything is built to be simple, fast, and practical. No fluff. Just what you need to start charging for automation work.",
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
    "lastUpdated": "2025-12-05T23:31:21.097Z",
    "coverImage": "/assets/Levqor-Omega-Empire-Pack/products/automation-accelerator/Product-Cover/levqor-cover-v1.png",
    "thumbnailImage": "/assets/Levqor-Omega-Empire-Pack/products/automation-accelerator/Thumbnails/thumb-build-automations-fast.png",
    "heroImage": "/assets/Levqor-Omega-Empire-Pack/products/automation-accelerator/Hero-Banners/website-hero-v1.png"
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
