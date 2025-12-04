/**
 * PRODUCT CATALOG - AUTOMATION ACCELERATOR PACK
 * Single source of truth for digital products sold via Gumroad/external platforms
 */

export interface DigitalProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: "USD";
  type: "digital_download";
  category: "automation_pack" | "template_pack" | "course";
  downloadUrl: string;
  gumroadUrl: string;
  features: string[];
  includes: string[];
  bonuses?: string[];
  thumbnail: string;
  badge?: string;
  status: "active" | "coming_soon" | "archived";
}

export const DIGITAL_PRODUCTS: Record<string, DigitalProduct> = {
  automation_accelerator_pack: {
    id: "automation_accelerator_pack",
    name: "Automation Accelerator Pack",
    tagline: "Launch your automation business in 48 hours",
    description: "The complete toolkit for founders and agencies who want to ship automation fast. Includes 25 battle-tested workflow templates, swipe copy, SOPs, and everything you need to go from zero to revenue.",
    price: 47,
    currency: "USD",
    type: "digital_download",
    category: "automation_pack",
    downloadUrl: "/api/products/download/automation_accelerator_pack",
    gumroadUrl: "https://levqor.gumroad.com/l/automation-accelerator",
    features: [
      "25 production-ready workflow templates",
      "Copy-paste SOPs for client onboarding",
      "Swipe file with 50+ automation prompts",
      "Pricing calculator spreadsheet",
      "Client proposal template",
      "Onboarding checklist & scripts",
    ],
    includes: [
      "Levqor_Launch_MasterPack_v1.0.zip",
      "Quick Start Guide (PDF)",
      "Video walkthrough (15 min)",
      "Notion dashboard template",
      "Email templates (5)",
    ],
    bonuses: [
      "BONUS: 30-min strategy call booking link",
      "BONUS: Private Slack community access",
      "BONUS: Monthly template updates (1 year)",
    ],
    thumbnail: "/images/products/automation-accelerator-pack.png",
    badge: "Best Seller",
    status: "active",
  },
};

export const PRODUCTS_ARRAY = Object.values(DIGITAL_PRODUCTS);

export function getProduct(id: string): DigitalProduct | undefined {
  return DIGITAL_PRODUCTS[id];
}

export function getActiveProducts(): DigitalProduct[] {
  return PRODUCTS_ARRAY.filter(p => p.status === "active");
}
