#!/usr/bin/env npx tsx
/**
 * OMEGA ASSETS — Product-Specific Asset Tree Generator
 * 
 * Creates the Levqor-Omega-Empire-Pack folder structure for a specific product.
 * Called automatically by compile-product.ts after successful compilation.
 * 
 * Usage: import { ensureOmegaAssetsForProduct } from "./omega-assets";
 */

import * as fs from "fs";
import * as path from "path";

const ROOT_DIR = path.resolve(__dirname, "..");
const OMEGA_PACK_DIR = path.join(ROOT_DIR, "assets", "Levqor-Omega-Empire-Pack", "products");

interface AssetDefinition {
  folder: string;
  files: string[];
}

function getAssetDefinitions(slug: string): AssetDefinition[] {
  return [
    {
      folder: "Product-Cover",
      files: [
        "levqor-cover-v1.txt",
        "levqor-cover-v2.txt",
        "levqor-cover-v3.txt"
      ]
    },
    {
      folder: "Thumbnails",
      files: [
        "thumb-build-automations-fast.txt",
        "thumb-your-first-1000.txt",
        "thumb-ai-workflow-secrets.txt",
        "thumb-automation-blueprint.txt",
        "thumb-scale-your-agency.txt",
        "thumb-make-money-with-ai.txt"
      ]
    },
    {
      folder: "Social-Posts/quote-style",
      files: [
        "quote-automation-is-leverage.txt",
        "quote-build-systems-not-schedules.txt",
        "quote-your-time-is-worth-more.txt",
        "quote-scale-without-sacrifice.txt",
        "quote-ai-works-while-you-sleep.txt"
      ]
    },
    {
      folder: "Social-Posts/value-drop",
      files: [
        "value-3-ways-to-automate.txt",
        "value-the-automation-stack.txt",
        "value-why-manual-work-kills.txt",
        "value-the-47-blueprint.txt",
        "value-zero-to-automated.txt"
      ]
    },
    {
      folder: "Social-Posts/authority-shots",
      files: [
        "authority-100-automations.txt",
        "authority-changed-everything.txt",
        "authority-system-scales.txt",
        "authority-quit-trading-time.txt",
        "authority-automation-free.txt"
      ]
    },
    {
      folder: "Carousel-Posts",
      files: [
        "carousel-01-how-to-launch.txt",
        "carousel-02-choose-niche.txt",
        "carousel-03-build-workflow.txt",
        "carousel-04-productize-it.txt",
        "carousel-05-sell-before-build.txt"
      ]
    },
    {
      folder: "Ad-Creatives/static-ads",
      files: [
        "static-ad-automate-7-days.txt",
        "static-ad-47-pack.txt",
        "static-ad-first-automation.txt",
        "static-ad-scale-without-hiring.txt"
      ]
    },
    {
      folder: "Ad-Creatives/micro-ads",
      files: [
        "micro-ad-automate-now.txt",
        "micro-ad-47-pack.txt",
        "micro-ad-get-started.txt",
        "micro-ad-build-fast.txt"
      ]
    },
    {
      folder: "Hero-Banners",
      files: [
        "hero-v1-wave-sweep.txt",
        "hero-v2-energy-wave.txt"
      ]
    },
    {
      folder: "CTA-Cards",
      files: [
        "cta-start-building.txt",
        "cta-download-pack.txt",
        "cta-join-community.txt",
        "cta-get-blueprint.txt",
        "cta-learn-workflows.txt",
        "cta-start-earning.txt"
      ]
    },
    {
      folder: "Video-Frames/short-vertical",
      files: [
        "frame-hook.txt",
        "frame-headline.txt",
        "frame-value.txt",
        "frame-cta.txt",
        "frame-transition.txt",
        "frame-outro.txt"
      ]
    },
    {
      folder: "Video-Frames/youtube-thumbnails",
      files: [
        "yt-thumb-01.txt",
        "yt-thumb-02.txt",
        "yt-thumb-03.txt",
        "yt-thumb-04.txt",
        "yt-thumb-05.txt",
        "yt-thumb-06.txt"
      ]
    },
    {
      folder: "Brand-Geometry-Pack/neon-rings",
      files: [
        "ring-teal-v1.txt",
        "ring-blue-v2.txt",
        "ring-purple-v3.txt"
      ]
    },
    {
      folder: "Brand-Geometry-Pack/hex-grids",
      files: [
        "hex-teal-v1.txt",
        "hex-blue-v2.txt",
        "hex-purple-v3.txt"
      ]
    },
    {
      folder: "Brand-Geometry-Pack/ai-core-waves",
      files: [
        "wave-teal-flow.txt",
        "wave-blue-pulse.txt"
      ]
    },
    {
      folder: "Brand-Geometry-Pack/particle-fields",
      files: [
        "particles-teal-blue.txt",
        "particles-purple-teal.txt"
      ]
    },
    {
      folder: "Brand-Geometry-Pack/background-plates",
      files: [
        "bg-deep-space.txt",
        "bg-midnight-gradient.txt",
        "bg-flux-wave.txt"
      ]
    }
  ];
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createPlaceholder(filePath: string, assetName: string, slug: string): void {
  if (fs.existsSync(filePath)) {
    return;
  }

  const pngName = assetName.replace(".txt", ".png");
  const content = `# Placeholder for ${pngName} (${slug})
Replace with Hybrid Flux Wave cover for this product.

Style: HYBRID FLUX WAVE
Colors:
  - Deep Space Black #000000
  - Midnight Graphite #0C0F14
  - Neon Flux Blue #3A8CFF
  - Aurora Pulse Teal #31F7D9
  - Plasma Purple #8F5BFF

Product: ${slug}
Generated: ${new Date().toISOString()}
`;
  fs.writeFileSync(filePath, content);
}

export function ensureOmegaAssetsForProduct(slug: string): void {
  try {
    const productDir = path.join(OMEGA_PACK_DIR, slug);
    const assets = getAssetDefinitions(slug);

    ensureDir(OMEGA_PACK_DIR);
    ensureDir(productDir);

    let totalFiles = 0;

    for (const asset of assets) {
      const folderPath = path.join(productDir, asset.folder);
      ensureDir(folderPath);

      for (const file of asset.files) {
        const filePath = path.join(folderPath, file);
        createPlaceholder(filePath, file, slug);
        totalFiles++;
      }
    }

    console.log(`[OMEGA-ASSETS] Ensured asset tree for product: ${slug} (${totalFiles} placeholders)`);
  } catch (error) {
    console.warn("[OMEGA-ASSETS] Failed to ensure assets for", slug, error);
  }
}

if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npx tsx scripts/omega-assets.ts <slug>");
    process.exit(1);
  }
  ensureOmegaAssetsForProduct(slug);
}
