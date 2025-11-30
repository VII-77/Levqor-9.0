/**
 * SINGLE SOURCE OF TRUTH FOR PRICING
 * 
 * This file defines all pricing data used throughout the application.
 * Both the pricing page UI and checkout API route read from this config.
 * 
 * To update pricing:
 * 1. Update the prices here
 * 2. Update corresponding Stripe Price IDs in environment variables
 * 3. Ensure the Stripe dashboard matches these amounts
 */

export const SUBSCRIPTION_TIERS = ["starter", "launch", "growth", "agency"] as const;
export const BILLING_INTERVALS = ["month", "year"] as const;
export const DFY_PACK_IDS = ["dfy_starter", "dfy_professional", "dfy_enterprise"] as const;
export const ADDON_IDS = ["addon_priority_support", "addon_sla_99", "addon_white_label", "addon_extra_workflows"] as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];
export type BillingInterval = typeof BILLING_INTERVALS[number];
export type DFYPackId = typeof DFY_PACK_IDS[number];
export type AddonId = typeof ADDON_IDS[number];

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  description: string;
  badge?: string;
  trial: boolean;
  prices: {
    month: number;
    year: number;
  };
  limits: {
    workflows: number;
    runs: string;
    speed: string;
    users: number;
    connectors: string;
    aiCredits: string;
    support: string;
  };
  features: string[];
  stripePriceEnvKeys: {
    month: string;
    year: string;
  };
}

export interface DFYPack {
  id: DFYPackId;
  name: string;
  badge?: string;
  price: number;
  features: string[];
  stripePriceEnvKey: string;
}

export interface Addon {
  id: AddonId;
  name: string;
  description: string;
  price: number;
  stripePriceEnvKey: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals getting started with automation",
    trial: true,
    prices: {
      month: 9,
      year: 90,
    },
    limits: {
      workflows: 5,
      runs: "2,000",
      speed: "Standard",
      users: 1,
      connectors: "Core only",
      aiCredits: "1,000",
      support: "Email (48h)",
    },
    features: [
      "5 workflows",
      "2,000 runs/mo",
      "1 user",
      "Core connectors",
      "1,000 AI credits",
      "Email support (48h)",
      "7-day free trial",
    ],
    stripePriceEnvKeys: {
      month: "STRIPE_PRICE_STARTER",
      year: "STRIPE_PRICE_STARTER_YEAR",
    },
  },
  launch: {
    id: "launch",
    name: "Launch",
    description: "For growing teams ready to scale their automation",
    badge: "Most Popular",
    trial: true,
    prices: {
      month: 29,
      year: 290,
    },
    limits: {
      workflows: 20,
      runs: "10,000",
      speed: "Fast",
      users: 3,
      connectors: "Core + Beta",
      aiCredits: "5,000",
      support: "Priority Email (24h)",
    },
    features: [
      "20 workflows",
      "10,000 runs/mo",
      "3 users",
      "Core + Beta connectors",
      "5,000 AI credits",
      "Priority email (24h)",
      "7-day free trial",
    ],
    stripePriceEnvKeys: {
      month: "STRIPE_PRICE_LAUNCH",
      year: "STRIPE_PRICE_LAUNCH_YEAR",
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    description: "For teams requiring advanced automation capabilities",
    trial: true,
    prices: {
      month: 59,
      year: 590,
    },
    limits: {
      workflows: 100,
      runs: "50,000",
      speed: "Faster",
      users: 5,
      connectors: "All (incl. Beta)",
      aiCredits: "20,000",
      support: "Priority (12h)",
    },
    features: [
      "100 workflows",
      "50,000 runs/mo",
      "5 users",
      "All connectors",
      "20,000 AI credits",
      "Priority support (12h)",
      "7-day free trial",
    ],
    stripePriceEnvKeys: {
      month: "STRIPE_PRICE_GROWTH",
      year: "STRIPE_PRICE_GROWTH_YEAR",
    },
  },
  agency: {
    id: "agency",
    name: "Agency",
    description: "Enterprise-grade automation for agencies and large teams",
    badge: "Best Value",
    trial: true,
    prices: {
      month: 149,
      year: 1490,
    },
    limits: {
      workflows: 500,
      runs: "250,000",
      speed: "Fastest",
      users: 10,
      connectors: "All + SSO",
      aiCredits: "100,000",
      support: "4-hr SLA",
    },
    features: [
      "500 workflows",
      "250,000 runs/mo",
      "10 users",
      "All connectors + SSO",
      "100,000 AI credits",
      "4-hour SLA support",
      "7-day free trial",
    ],
    stripePriceEnvKeys: {
      month: "STRIPE_PRICE_AGENCY",
      year: "STRIPE_PRICE_AGENCY_YEAR",
    },
  },
};

export const DFY_PACKS: Record<DFYPackId, DFYPack> = {
  dfy_starter: {
    id: "dfy_starter",
    name: "DFY Starter",
    price: 149,
    features: [
      "Complete workflow setup",
      "Basic automation templates",
      "Email integration",
      "1-hour consultation",
      "2 weeks support",
    ],
    stripePriceEnvKey: "STRIPE_PRICE_DFY_STARTER",
  },
  dfy_professional: {
    id: "dfy_professional",
    name: "DFY Professional",
    badge: "Popular",
    price: 299,
    features: [
      "Advanced workflow setup",
      "Custom automation design",
      "Multiple integrations",
      "2-hour consultation",
      "1 month priority support",
      "Documentation included",
    ],
    stripePriceEnvKey: "STRIPE_PRICE_DFY_PROFESSIONAL",
  },
  dfy_enterprise: {
    id: "dfy_enterprise",
    name: "DFY Enterprise",
    price: 499,
    features: [
      "Enterprise workflow setup",
      "Complex automation systems",
      "Unlimited integrations",
      "4-hour consultation",
      "3 months premium support",
      "Full documentation & training",
      "Dedicated account manager",
    ],
    stripePriceEnvKey: "STRIPE_PRICE_DFY_ENTERPRISE",
  },
};

export const ADDONS: Record<AddonId, Addon> = {
  addon_priority_support: {
    id: "addon_priority_support",
    name: "Priority Support",
    description: "Get faster responses and higher priority in our support queue",
    price: 29,
    stripePriceEnvKey: "STRIPE_PRICE_ADDON_PRIORITY_SUPPORT",
  },
  addon_sla_99: {
    id: "addon_sla_99",
    name: "SLA 99.9%",
    description: "99.9% uptime guarantee with SLA commitment and monitoring",
    price: 49,
    stripePriceEnvKey: "STRIPE_PRICE_ADDON_SLA_99",
  },
  addon_white_label: {
    id: "addon_white_label",
    name: "White Label",
    description: "Remove Levqor branding and use your own custom brand",
    price: 99,
    stripePriceEnvKey: "STRIPE_PRICE_ADDON_WHITE_LABEL",
  },
  addon_extra_workflows: {
    id: "addon_extra_workflows",
    name: "Extra Workflow Pack",
    description: "Add +50 extra workflow capacity to your current plan",
    price: 10,
    stripePriceEnvKey: "STRIPE_PRICE_ADDON_EXTRA_WORKFLOWS",
  },
};

export function getSubscriptionPrice(tier: SubscriptionTier, interval: BillingInterval): number {
  return SUBSCRIPTION_PLANS[tier].prices[interval];
}

export function getSubscriptionPriceId(tier: SubscriptionTier, interval: BillingInterval): string | undefined {
  const envKey = SUBSCRIPTION_PLANS[tier].stripePriceEnvKeys[interval];
  return process.env[envKey];
}

export function getDFYPrice(packId: DFYPackId): number {
  return DFY_PACKS[packId].price;
}

export function getDFYPriceId(packId: DFYPackId): string | undefined {
  const envKey = DFY_PACKS[packId].stripePriceEnvKey;
  return process.env[envKey];
}

export function getAddonPrice(addonId: AddonId): number {
  return ADDONS[addonId].price;
}

export function getAddonPriceId(addonId: AddonId): string | undefined {
  const envKey = ADDONS[addonId].stripePriceEnvKey;
  return process.env[envKey];
}

export const SUBSCRIPTION_PLANS_ARRAY = SUBSCRIPTION_TIERS.map(tier => SUBSCRIPTION_PLANS[tier]);
export const DFY_PACKS_ARRAY = DFY_PACK_IDS.map(id => DFY_PACKS[id]);
export const ADDONS_ARRAY = ADDON_IDS.map(id => ADDONS[id]);
