#!/usr/bin/env npx tsx
/**
 * CREATOR COMMAND PANEL — CLI Dashboard
 * 
 * Usage: npm run creator:panel <command>
 * 
 * Commands:
 *   status          - Empire status overview
 *   health:products - Product pipeline health check
 *   health:site     - Site build/lint health check
 *   money:today     - Daily money action plan
 *   ops:summary     - Operations summary
 * 
 * Examples:
 *   npm run creator:panel status
 *   npm run creator:panel health:products automation-accelerator
 *   npm run creator:panel money:today
 */

import * as fs from "fs";
import * as path from "path";
import { execSync, spawnSync } from "child_process";

const ROOT_DIR = path.resolve(__dirname, "..");
const WORKSPACE_ROOT = path.resolve(ROOT_DIR, "..");
const CONFIG_FILE = path.join(ROOT_DIR, "src", "config", "products.ts");
const PRODUCTS_DIR = path.join(ROOT_DIR, "products");
const COMPILER_SCRIPT = path.join(ROOT_DIR, "scripts", "compile-product.ts");
const WORKFLOW_FILE = path.join(WORKSPACE_ROOT, ".github", "workflows", "products-pipeline.yml");

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function log(msg: string) {
  console.log(msg);
}

function header(title: string) {
  log("");
  log(`${COLORS.bright}${COLORS.cyan}═══════════════════════════════════════════${COLORS.reset}`);
  log(`${COLORS.bright}${COLORS.cyan}  ${title}${COLORS.reset}`);
  log(`${COLORS.bright}${COLORS.cyan}═══════════════════════════════════════════${COLORS.reset}`);
  log("");
}

function success(msg: string) {
  log(`${COLORS.green}✓${COLORS.reset} ${msg}`);
}

function warn(msg: string) {
  log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`);
}

function fail(msg: string) {
  log(`${COLORS.red}✗${COLORS.reset} ${msg}`);
}

function info(msg: string) {
  log(`${COLORS.dim}→${COLORS.reset} ${msg}`);
}

function printUsage() {
  header("Creator Command Panel — Help");
  log("Usage: npm run creator:panel <command> [options]");
  log("");
  log("Commands:");
  log("  status              Empire status overview");
  log("  health:products     Product pipeline health check");
  log("  health:site         Site build/lint health check");
  log("  money:today         Daily money action plan");
  log("  ops:summary         Operations summary");
  log("");
  log("Examples:");
  log("  npm run creator:panel status");
  log("  npm run creator:panel health:products automation-accelerator");
  log("  npm run creator:panel money:today");
}

interface ProductData {
  id: string;
  slug: string;
  name: string;
  version: string;
  status: string;
  priceUsd: number;
}

function parseProductsFromConfig(): ProductData[] {
  if (!fs.existsSync(CONFIG_FILE)) {
    return [];
  }
  
  const content = fs.readFileSync(CONFIG_FILE, "utf-8");
  const products: ProductData[] = [];
  
  const productBlockRegex = /"([^"]+)":\s*\{[^}]*"slug":\s*"([^"]+)"[^}]*"name":\s*"([^"]+)"[^}]*"version":\s*"([^"]+)"[^}]*"status":\s*"([^"]+)"[^}]*"priceUsd":\s*(\d+)/gs;
  
  let match;
  while ((match = productBlockRegex.exec(content)) !== null) {
    products.push({
      id: match[1],
      slug: match[2],
      name: match[3],
      version: match[4],
      status: match[5],
      priceUsd: parseInt(match[6], 10),
    });
  }
  
  if (products.length === 0) {
    const simpleRegex = /"id":\s*"([^"]+)"[\s\S]*?"slug":\s*"([^"]+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"priceUsd":\s*(\d+)[\s\S]*?"version":\s*"([^"]+)"[\s\S]*?"status":\s*"([^"]+)"/g;
    while ((match = simpleRegex.exec(content)) !== null) {
      products.push({
        id: match[1],
        slug: match[2],
        name: match[3],
        priceUsd: parseInt(match[4], 10),
        version: match[5],
        status: match[6],
      });
    }
  }
  
  return products;
}

function getProductSpecFiles(): string[] {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    return [];
  }
  return fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith(".product.json"));
}

async function cmdStatus() {
  header("Empire Status");
  
  const products = parseProductsFromConfig();
  const activeProducts = products.filter(p => p.status === "active");
  const draftProducts = products.filter(p => p.status === "draft");
  
  log(`${COLORS.bright}Products:${COLORS.reset}`);
  if (products.length === 0) {
    warn("No products found in config");
  } else {
    success(`${activeProducts.length} active, ${draftProducts.length} draft`);
    products.forEach(p => {
      const statusIcon = p.status === "active" ? COLORS.green + "●" : COLORS.yellow + "○";
      info(`${statusIcon}${COLORS.reset} ${p.name} (v${p.version}) — £${p.priceUsd}`);
    });
  }
  
  log("");
  log(`${COLORS.bright}Infrastructure:${COLORS.reset}`);
  
  if (fs.existsSync(WORKFLOW_FILE)) {
    success("Products Pipeline Workflow: FOUND");
  } else {
    fail("Products Pipeline Workflow: NOT FOUND");
  }
  
  if (fs.existsSync(COMPILER_SCRIPT)) {
    success("Product Compiler Script: FOUND");
  } else {
    fail("Product Compiler Script: NOT FOUND");
  }
  
  log("");
  log(`${COLORS.bright}Environment:${COLORS.reset}`);
  
  const driveEnv = process.env.GOOGLE_DRIVE_SHARED_FOLDER_ID;
  if (driveEnv) {
    success("GOOGLE_DRIVE_SHARED_FOLDER_ID: [SET]");
  } else {
    warn("GOOGLE_DRIVE_SHARED_FOLDER_ID: [NOT SET]");
  }
  
  const saEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (saEnv) {
    success("GOOGLE_SERVICE_ACCOUNT_JSON: [SET]");
  } else {
    info("GOOGLE_SERVICE_ACCOUNT_JSON: [EXPECTED IN GITHUB SECRETS]");
  }
  
  log("");
}

async function cmdHealthProducts(slug?: string) {
  header("Product Health Check");
  
  const targetSlug = slug || "automation-accelerator";
  log(`Checking: ${COLORS.bright}${targetSlug}${COLORS.reset}`);
  log("");
  
  const specFile = path.join(PRODUCTS_DIR, `${targetSlug}.product.json`);
  if (!fs.existsSync(specFile)) {
    fail(`Product spec not found: ${specFile}`);
    return;
  }
  success(`Product spec: FOUND`);
  
  if (!fs.existsSync(COMPILER_SCRIPT)) {
    fail(`Compiler script not found: ${COMPILER_SCRIPT}`);
    return;
  }
  success(`Compiler script: FOUND`);
  
  log("");
  log(`Running compiler (DRY_RUN mode)...`);
  
  try {
    const result = spawnSync("npx", ["tsx", COMPILER_SCRIPT, `--slug=${targetSlug}`], {
      cwd: ROOT_DIR,
      env: { ...process.env, DRY_RUN: "true" },
      encoding: "utf-8",
      timeout: 60000,
    });
    
    if (result.status === 0) {
      success(`Compiler: PASS (exit code 0)`);
      if (result.stdout) {
        log("");
        log(`${COLORS.dim}--- Compiler Output ---${COLORS.reset}`);
        const lines = result.stdout.split("\n").slice(0, 15);
        lines.forEach(line => log(`${COLORS.dim}${line}${COLORS.reset}`));
        if (result.stdout.split("\n").length > 15) {
          log(`${COLORS.dim}... (truncated)${COLORS.reset}`);
        }
      }
    } else {
      fail(`Compiler: FAIL (exit code ${result.status})`);
      if (result.stderr) {
        log("");
        log(`${COLORS.red}--- Error Output ---${COLORS.reset}`);
        const lines = result.stderr.split("\n").slice(0, 10);
        lines.forEach(line => log(`${COLORS.red}${line}${COLORS.reset}`));
      }
    }
  } catch (err) {
    fail(`Compiler execution failed: ${err}`);
  }
  
  log("");
}

async function cmdHealthSite() {
  header("Site Health Check");
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8"));
  const scripts = packageJson.scripts || {};
  
  if (scripts.lint) {
    log("Running lint...");
    try {
      const result = spawnSync("npm", ["run", "lint"], {
        cwd: ROOT_DIR,
        encoding: "utf-8",
        timeout: 120000,
      });
      
      if (result.status === 0) {
        success("Lint: PASS");
      } else {
        fail("Lint: FAIL");
        if (result.stderr || result.stdout) {
          const output = (result.stderr || result.stdout).split("\n").slice(0, 5);
          output.forEach(line => info(line));
        }
      }
    } catch (err) {
      fail(`Lint execution failed: ${err}`);
    }
  } else {
    warn("Lint script not found, skipping");
  }
  
  log("");
  log("Running TypeScript check...");
  try {
    const result = spawnSync("npx", ["tsc", "--noEmit"], {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      timeout: 180000,
    });
    
    if (result.status === 0) {
      success("TypeScript: PASS");
    } else {
      fail("TypeScript: FAIL");
      if (result.stdout) {
        const lines = result.stdout.split("\n").filter(l => l.includes("error")).slice(0, 5);
        lines.forEach(line => info(line));
      }
    }
  } catch (err) {
    fail(`TypeScript check failed: ${err}`);
  }
  
  log("");
  warn("Build check skipped (too heavy for quick health check)");
  info("Run 'npm run build' manually to verify full build");
  
  log("");
}

async function cmdMoneyToday() {
  header("Money Plan — Today");
  
  const products = parseProductsFromConfig();
  const activeProducts = products.filter(p => p.status === "active");
  
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  log(`${COLORS.dim}${today}${COLORS.reset}`);
  log("");
  
  if (activeProducts.length === 0) {
    warn("No active products found. Focus on launching your first product.");
    log("");
    log("1) Finalize your product spec in products/*.product.json");
    log("2) Run the compiler: npm run creator:panel health:products");
    log("3) Set up Gumroad listing and update gumroadUrl");
    log("4) Announce on social media");
    return;
  }
  
  const mainProduct = activeProducts[0];
  
  log(`${COLORS.bright}Today's Focus: ${mainProduct.name} (£${mainProduct.priceUsd})${COLORS.reset}`);
  log("");
  
  log(`${COLORS.green}1)${COLORS.reset} ${COLORS.bright}CONTENT${COLORS.reset}`);
  info("Publish one post with CTA to the Automation Accelerator.");
  info("Use the content engine template: templates/content-engine-template.md");
  log("");
  
  log(`${COLORS.green}2)${COLORS.reset} ${COLORS.bright}EMAIL${COLORS.reset}`);
  info("Send one email to your list with a testimonial and link.");
  info("Keep it short: problem → solution → CTA.");
  log("");
  
  log(`${COLORS.green}3)${COLORS.reset} ${COLORS.bright}VIDEO${COLORS.reset}`);
  info("Record or plan one short-form video (20-30s).");
  info("Show a real automation win or quick tutorial.");
  log("");
  
  log(`${COLORS.green}4)${COLORS.reset} ${COLORS.bright}VERIFY${COLORS.reset}`);
  info(`Check product page: /products/${mainProduct.slug}`);
  info("Verify Gumroad link is live and payment works.");
  log("");
  
  log(`${COLORS.green}5)${COLORS.reset} ${COLORS.bright}LOG${COLORS.reset}`);
  info("Note any responses, questions, or objections.");
  info("Use these for tomorrow's content.");
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}Target: 1 sale = £${mainProduct.priceUsd} today${COLORS.reset}`);
  log("");
}

async function cmdOpsSummary() {
  header("Ops Summary");
  
  const products = parseProductsFromConfig();
  const activeProducts = products.filter(p => p.status === "active");
  const specFiles = getProductSpecFiles();
  
  log(`${COLORS.bright}Products:${COLORS.reset}`);
  success(`${activeProducts.length} active product(s)`);
  activeProducts.forEach(p => {
    info(`${p.slug} (v${p.version})`);
  });
  
  log("");
  log(`${COLORS.bright}Product Specs:${COLORS.reset}`);
  if (specFiles.length > 0) {
    success(`${specFiles.length} spec file(s) found`);
    specFiles.forEach(f => {
      info(`products/${f}`);
    });
  } else {
    warn("No product spec files found");
  }
  
  log("");
  log(`${COLORS.bright}Pipeline Components:${COLORS.reset}`);
  
  if (fs.existsSync(COMPILER_SCRIPT)) {
    success("Compiler script: FOUND");
  } else {
    fail("Compiler script: NOT FOUND");
  }
  
  if (fs.existsSync(WORKFLOW_FILE)) {
    success("GitHub Actions workflow: FOUND");
  } else {
    fail("GitHub Actions workflow: NOT FOUND");
  }
  
  const contentTemplate = path.join(ROOT_DIR, "templates", "content-engine-template.md");
  if (fs.existsSync(contentTemplate)) {
    success("Content engine template: FOUND");
  } else {
    warn("Content engine template: NOT FOUND");
  }
  
  log("");
  log(`${COLORS.bright}Environment Variables:${COLORS.reset}`);
  
  const envChecks = [
    { key: "GOOGLE_DRIVE_SHARED_FOLDER_ID", local: true },
    { key: "GOOGLE_SERVICE_ACCOUNT_JSON", local: false },
    { key: "DATABASE_URL", local: true },
    { key: "NEXTAUTH_SECRET", local: true },
  ];
  
  envChecks.forEach(({ key, local }) => {
    const isSet = !!process.env[key];
    if (isSet) {
      success(`${key}: [SET]`);
    } else if (local) {
      warn(`${key}: [NOT SET]`);
    } else {
      info(`${key}: [EXPECTED IN GITHUB SECRETS]`);
    }
  });
  
  log("");
}

async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  
  if (!command || command === "help" || command === "--help" || command === "-h") {
    printUsage();
    return;
  }
  
  switch (command) {
    case "status":
      await cmdStatus();
      break;
    case "health:products":
      await cmdHealthProducts(arg1);
      break;
    case "health:site":
      await cmdHealthSite();
      break;
    case "money:today":
      await cmdMoneyToday();
      break;
    case "ops:summary":
      await cmdOpsSummary();
      break;
    default:
      fail(`Unknown command: ${command}`);
      log("");
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
