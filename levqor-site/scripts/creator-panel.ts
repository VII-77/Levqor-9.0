#!/usr/bin/env npx tsx
/**
 * CREATOR COMMAND PANEL — CLI Dashboard
 * 
 * Usage: npm run creator:panel <command>
 * 
 * Commands:
 *   status             - Empire status overview
 *   health:products    - Product pipeline health check
 *   health:site        - Site build/lint health check
 *   money:today        - Daily money action plan
 *   money:ladder       - Show product ladder (front-end + upsell)
 *   money:followup     - Show 3-email follow-up plan
 *   ops:summary        - Operations summary
 *   metrics:today      - Quick operational metrics snapshot
 *   costs:summary      - Config-driven cost overview
 *   guardian:check     - Composite system health check
 *   traffic:generate   - Generate daily traffic content
 *   traffic:schedule   - Show daily posting schedule
 *   loops:referral-link - Show your referral link pattern
 *   loops:share-kit    - Get ready-made viral share copy
 *   content:idea       - Show today's content angle
 *   content:post       - Print a ready-to-copy promo post
 * 
 * Examples:
 *   npm run creator:panel status
 *   npm run creator:panel health:products automation-accelerator
 *   npm run creator:panel money:ladder
 *   npm run creator:panel content:idea
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
const COSTS_CONFIG_FILE = path.join(ROOT_DIR, "config", "costs.config.json");

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
  log("  status               Empire status overview");
  log("  health:products      Product pipeline health check");
  log("  health:site          Site build/lint health check");
  log("  money:today          Daily money action plan");
  log("  money:ladder         Show product ladder (front-end + upsell)");
  log("  money:followup       Show 3-email follow-up plan");
  log("  ops:summary          Operations summary");
  log("  metrics:today        Quick operational metrics snapshot");
  log("  costs:summary        Config-driven cost overview");
  log("  guardian:check       Composite system health check");
  log("  traffic:generate     Generate daily traffic content");
  log("  traffic:schedule     Show daily posting schedule");
  log("  loops:referral-link  Show your referral link pattern");
  log("  loops:share-kit      Get ready-made viral share copy");
  log("  content:idea         Show today's content angle");
  log("  content:post         Print a ready-to-copy promo post");
  log("");
  log("Examples:");
  log("  npm run creator:panel status");
  log("  npm run creator:panel health:products automation-accelerator");
  log("  npm run creator:panel money:ladder");
  log("  npm run creator:panel content:idea");
}

interface ProductData {
  id: string;
  slug: string;
  name: string;
  version: string;
  status: string;
  priceUsd: number;
}

interface CostsConfig {
  currency: string;
  services: Array<{
    name: string;
    type: string;
    estimatedDaily: number;
    notes: string;
  }>;
  targets: {
    dailyMax: number;
    monthlyMax: number;
  };
}

function parseProductsFromConfig(): ProductData[] {
  if (!fs.existsSync(CONFIG_FILE)) {
    return [];
  }
  
  const content = fs.readFileSync(CONFIG_FILE, "utf-8");
  const products: ProductData[] = [];
  
  const productBlockRegex = /"([^"]+)":\s*\{[^}]*"slug":\s*"([^"]+)"[^}]*"name":\s*"([^"]+)"[^}]*"version":\s*"([^"]+)"[^}]*"status":\s*"([^"]+)"[^}]*"priceUsd":\s*(\d+)/g;
  
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

function checkProductionPage(): { ok: boolean; status: string; message: string } {
  try {
    const result = spawnSync("curl", [
      "-sS", "-o", "/dev/null", "-w", "%{http_code}",
      "--max-time", "10",
      "https://www.levqor.ai/en/products/automation-accelerator"
    ], {
      encoding: "utf-8",
      timeout: 15000,
    });
    
    if (result.error || result.status !== 0) {
      return { ok: false, status: "ERROR", message: "curl/network error" };
    }
    
    const httpCode = parseInt(result.stdout.trim(), 10);
    if (httpCode >= 200 && httpCode < 400) {
      return { ok: true, status: String(httpCode), message: "OK" };
    } else {
      return { ok: false, status: String(httpCode), message: "POSSIBLE ISSUE" };
    }
  } catch (err) {
    return { ok: false, status: "ERROR", message: "curl not available or network error" };
  }
}

function runCompilerDryRun(slug: string): { passed: boolean; exitCode: number } {
  try {
    const result = spawnSync("npx", ["tsx", COMPILER_SCRIPT, `--slug=${slug}`], {
      cwd: ROOT_DIR,
      env: { ...process.env, DRY_RUN: "true" },
      encoding: "utf-8",
      timeout: 60000,
    });
    return { passed: result.status === 0, exitCode: result.status || -1 };
  } catch (err) {
    return { passed: false, exitCode: -1 };
  }
}

function runLintQuiet(): { passed: boolean; skipped: boolean } {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8"));
  const scripts = packageJson.scripts || {};
  
  if (!scripts.lint) {
    return { passed: false, skipped: true };
  }
  
  try {
    const result = spawnSync("npm", ["run", "lint"], {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      timeout: 120000,
    });
    return { passed: result.status === 0, skipped: false };
  } catch (err) {
    return { passed: false, skipped: false };
  }
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

async function cmdMetricsToday() {
  header("Metrics — Today");
  
  const today = new Date().toISOString().split("T")[0];
  log(`${COLORS.bright}Date:${COLORS.reset} ${today}`);
  log("");
  
  const products = parseProductsFromConfig();
  const activeProducts = products.filter(p => p.status === "active");
  
  log(`${COLORS.bright}Active Products:${COLORS.reset}`);
  if (activeProducts.length === 0) {
    warn("No active products");
  } else {
    success(`${activeProducts.length} active`);
    activeProducts.forEach(p => {
      info(`${p.slug} v${p.version}`);
    });
  }
  
  log("");
  log(`${COLORS.bright}Production Page Check:${COLORS.reset}`);
  const prodCheck = checkProductionPage();
  if (prodCheck.ok) {
    success(`OK (${prodCheck.status})`);
  } else {
    if (prodCheck.status === "ERROR") {
      warn(`UNAVAILABLE (${prodCheck.message})`);
    } else {
      fail(`${prodCheck.message} (${prodCheck.status})`);
    }
  }
  
  log("");
  log(`${COLORS.bright}Environment:${COLORS.reset}`);
  const driveEnv = process.env.GOOGLE_DRIVE_SHARED_FOLDER_ID;
  if (driveEnv) {
    success("GOOGLE_DRIVE_SHARED_FOLDER_ID: [SET]");
  } else {
    warn("GOOGLE_DRIVE_SHARED_FOLDER_ID: [NOT SET]");
  }
  
  log("");
}

async function cmdCostsSummary() {
  header("Costs — Summary");
  
  if (!fs.existsSync(COSTS_CONFIG_FILE)) {
    fail("costs.config.json not found.");
    info(`Please create: ${COSTS_CONFIG_FILE}`);
    return;
  }
  
  let config: CostsConfig;
  try {
    const content = fs.readFileSync(COSTS_CONFIG_FILE, "utf-8");
    config = JSON.parse(content) as CostsConfig;
  } catch (err) {
    fail("costs.config.json is invalid or unreadable.");
    info(`Error: ${err}`);
    return;
  }
  
  log(`${COLORS.bright}Currency:${COLORS.reset} ${config.currency}`);
  log("");
  
  log(`${COLORS.bright}Services:${COLORS.reset}`);
  let totalDaily = 0;
  
  config.services.forEach(svc => {
    totalDaily += svc.estimatedDaily;
    info(`${svc.name}: £${svc.estimatedDaily.toFixed(2)}/day (${svc.type}) — ${svc.notes}`);
  });
  
  const estimatedMonthly = totalDaily * 30;
  
  log("");
  log(`${COLORS.bright}Totals:${COLORS.reset}`);
  
  const dailyStatus = totalDaily <= config.targets.dailyMax
    ? `${COLORS.green}WITHIN${COLORS.reset}`
    : `${COLORS.red}ABOVE${COLORS.reset}`;
  const monthlyStatus = estimatedMonthly <= config.targets.monthlyMax
    ? `${COLORS.green}WITHIN${COLORS.reset}`
    : `${COLORS.red}ABOVE${COLORS.reset}`;
  
  log(`  Estimated daily: £${totalDaily.toFixed(2)} (${dailyStatus} daily target £${config.targets.dailyMax.toFixed(2)})`);
  log(`  Estimated monthly: £${estimatedMonthly.toFixed(2)} (${monthlyStatus} monthly target £${config.targets.monthlyMax.toFixed(2)})`);
  
  log("");
  info(`Edit config/costs.config.json to update estimates.`);
  log("");
}

async function cmdGuardianCheck() {
  header("Guardian Check — Levqor System");
  
  let criticalIssues = 0;
  let warnings = 0;
  
  log(`${COLORS.bright}Products:${COLORS.reset}`);
  
  const products = parseProductsFromConfig();
  const activeProducts = products.filter(p => p.status === "active");
  
  if (activeProducts.length > 0) {
    success(`Active products: ${activeProducts.length} (OK)`);
  } else {
    fail("Active products: 0 (CRITICAL)");
    criticalIssues++;
  }
  
  const specFile = path.join(PRODUCTS_DIR, "automation-accelerator.product.json");
  if (fs.existsSync(specFile)) {
    success("automation-accelerator spec: FOUND");
  } else {
    fail("automation-accelerator spec: NOT FOUND");
    criticalIssues++;
  }
  
  log("");
  log("Running compile-product dry-run...");
  const compilerResult = runCompilerDryRun("automation-accelerator");
  if (compilerResult.passed) {
    success("compile-product dry-run: PASS");
  } else {
    fail(`compile-product dry-run: FAIL (exit ${compilerResult.exitCode})`);
    criticalIssues++;
  }
  
  log("");
  log(`${COLORS.bright}Site:${COLORS.reset}`);
  
  const lintResult = runLintQuiet();
  if (lintResult.skipped) {
    warn("lint: SKIPPED (script missing)");
  } else if (lintResult.passed) {
    success("lint: PASS");
  } else {
    warn("lint: FAIL (non-critical)");
    warnings++;
  }
  
  const prodCheck = checkProductionPage();
  if (prodCheck.ok) {
    success(`Production page: OK (${prodCheck.status})`);
  } else {
    if (prodCheck.status === "ERROR") {
      warn(`Production page: UNAVAILABLE (${prodCheck.message})`);
      warnings++;
    } else {
      fail(`Production page: ${prodCheck.message} (${prodCheck.status})`);
      criticalIssues++;
    }
  }
  
  log("");
  log(`${COLORS.bright}Environment:${COLORS.reset}`);
  
  const driveEnv = process.env.GOOGLE_DRIVE_SHARED_FOLDER_ID;
  if (driveEnv) {
    success("GOOGLE_DRIVE_SHARED_FOLDER_ID: [SET]");
  } else {
    warn("GOOGLE_DRIVE_SHARED_FOLDER_ID: [NOT SET]");
    warnings++;
  }
  
  log("");
  log(`${COLORS.bright}Overall:${COLORS.reset}`);
  
  if (criticalIssues === 0) {
    if (warnings === 0) {
      log(`${COLORS.green}${COLORS.bright}  STATUS: GREEN — All systems operational${COLORS.reset}`);
    } else {
      log(`${COLORS.yellow}${COLORS.bright}  STATUS: YELLOW — ${warnings} warning(s), no critical issues${COLORS.reset}`);
    }
  } else {
    log(`${COLORS.red}${COLORS.bright}  STATUS: RED — ${criticalIssues} critical issue(s) detected${COLORS.reset}`);
    info("Review issues above before sending traffic.");
  }
  
  log("");
}

async function cmdTrafficGenerate() {
  header("Traffic Engine — Daily Content");
  
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  log(`${COLORS.dim}${today}${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}SHORT-FORM SCRIPT (30 seconds)${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Hook:${COLORS.reset}`);
  info("Stop wasting hours on repetitive tasks.");
  log("");
  log(`${COLORS.bright}Problem:${COLORS.reset}`);
  info("Most founders spend 10+ hours a week on manual work —");
  info("copying data, sending follow-ups, updating spreadsheets.");
  info("That's time you could spend growing your business.");
  log("");
  log(`${COLORS.bright}Breakdown:${COLORS.reset}`);
  info("The Automation Accelerator Pack gives you 25 workflow templates,");
  info("client proposals, pricing calculators, and onboarding scripts.");
  info("Everything you need to launch an automation service in 48 hours.");
  log("");
  log(`${COLORS.bright}Call-to-action:${COLORS.reset}`);
  info("Link in bio. Stop doing manual work. Start automating.");
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}TIP POST${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Problem:${COLORS.reset}`);
  info("You're copying lead data from forms into your CRM by hand.");
  info("Every. Single. Time.");
  log("");
  log(`${COLORS.bright}Tip:${COLORS.reset}`);
  info("Set up a Zapier/Make automation:");
  info("Form submission → Create CRM contact → Notify Slack.");
  info("Takes 15 minutes. Saves 5+ hours/week.");
  log("");
  log(`${COLORS.bright}CTA:${COLORS.reset}`);
  info("Want 24 more workflows like this? Check the link below.");
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}CTA${COLORS.reset}`);
  log("");
  success("Build your automations with the Automation Accelerator Pack");
  log(`${COLORS.green}→${COLORS.reset} https://levqor.ai/products/automation-accelerator`);
  log("");
}

async function cmdTrafficSchedule() {
  header("Traffic Engine — Daily Schedule");
  
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  log(`${COLORS.dim}${today}${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}Daily Posting Schedule:${COLORS.reset}`);
  log("");
  
  log(`${COLORS.green}10:00${COLORS.reset} — ${COLORS.bright}Post Tip${COLORS.reset}`);
  info("Share one automation tip on Twitter/LinkedIn.");
  info("Use the TIP POST from traffic:generate.");
  log("");
  
  log(`${COLORS.green}12:00${COLORS.reset} — ${COLORS.bright}Send CTA${COLORS.reset}`);
  info("Post the CTA link to your main channel.");
  info("\"Build your automations with the Automation Accelerator Pack\"");
  info("→ https://levqor.ai/products/automation-accelerator");
  log("");
  
  log(`${COLORS.green}16:00${COLORS.reset} — ${COLORS.bright}Post Short-form Script${COLORS.reset}`);
  info("Record or post the 30-second script.");
  info("Use the SHORT-FORM SCRIPT from traffic:generate.");
  info("Platforms: TikTok, Instagram Reels, YouTube Shorts.");
  log("");
  
  log(`${COLORS.green}20:00${COLORS.reset} — ${COLORS.bright}Evening Reminder CTA${COLORS.reset}`);
  info("Final push of the day — repost the CTA.");
  info("\"Last chance today: Automation Accelerator Pack\"");
  info("→ https://levqor.ai/products/automation-accelerator");
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}Consistency beats intensity. Post daily.${COLORS.reset}`);
  log("");
}

async function cmdLoopsReferralLink() {
  header("Referral Link — Automation Accelerator");
  
  log(`${COLORS.bright}Base product page:${COLORS.reset}`);
  log(`${COLORS.green}→${COLORS.reset} https://levqor.ai/products/automation-accelerator`);
  log("");
  
  log(`${COLORS.bright}Your referral template:${COLORS.reset}`);
  log(`${COLORS.green}→${COLORS.reset} https://levqor.ai/products/automation-accelerator?ref=YOURNAME`);
  log("");
  
  log(`${COLORS.bright}Notes:${COLORS.reset}`);
  info("Replace YOURNAME with your handle.");
  info("Anyone who lands via your link and buys is counted as your referral.");
  log("");
}

async function cmdLoopsShareKit() {
  header("Viral Loop — Share Kit");
  
  log(`${COLORS.bright}${COLORS.cyan}POST${COLORS.reset}`);
  log("");
  log(`${COLORS.dim}"I'm done wasting hours on busywork. I'm building automations with the`);
  log(`Automation Accelerator Pack from @Levqor — templates, workflows, and a money`);
  log(`engine in a box. Grab it here: https://levqor.ai/products/automation-accelerator?ref=YOURNAME"${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}DM${COLORS.reset}`);
  log("");
  log(`${COLORS.dim}"Thought of you — this Automation Accelerator Pack shows exactly how to turn`);
  log(`your manual grind into an automated flow. If you grab it via this link, I'll know`);
  log(`it was you: https://levqor.ai/products/automation-accelerator?ref=YOURNAME"${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}CTA${COLORS.reset}`);
  log("");
  log(`${COLORS.dim}"Turn your manual grind into a money engine → https://levqor.ai/products/automation-accelerator?ref=YOURNAME"${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}Replace YOURNAME with your handle before sharing.${COLORS.reset}`);
  log("");
}

async function cmdMoneyLadder() {
  header("Money Ladder — Levqor");
  
  log(`${COLORS.bright}${COLORS.green}1) FRONT-END OFFER${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Name:${COLORS.reset} Automation Accelerator Pack`);
  log(`${COLORS.bright}Price:${COLORS.reset} $47`);
  log(`${COLORS.bright}Purpose:${COLORS.reset} Entry product — shows value quickly, easy to say yes to.`);
  info("This is the door-opener. Low friction, high perceived value.");
  log("");
  
  log(`${COLORS.bright}${COLORS.green}2) CORE UPSELL${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Name:${COLORS.reset} Automation Accelerator Pro Session`);
  log(`${COLORS.bright}Price:${COLORS.reset} $147 (may offer at $97 as limited-time discount)`);
  log(`${COLORS.bright}Purpose:${COLORS.reset} 1:1 implementation — higher LTV, deeper transformation.`);
  info("After they see the pack, offer to build it with them live.");
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}STRATEGY NOTE${COLORS.reset}`);
  log("");
  info("1 pack sale per day = $47/day = ~$1,400/month.");
  info("If even 20% upgrade to the Pro Session at $147, that's an extra ~$29/day.");
  info("Every buyer should see at least one upgrade option.");
  log("");
  
  log(`${COLORS.bright}Next Moves:${COLORS.reset}`);
  success("Drive traffic to Automation Accelerator Pack.");
  success("Let Gumroad upsell the Pro Session.");
  success("Use money:followup to plan emails after each sale.");
  log("");
}

async function cmdMoneyFollowup() {
  header("Follow-up Plan — Automation Accelerator Buyers");
  
  log(`${COLORS.bright}${COLORS.cyan}EMAIL 1 — Welcome + Quick Win${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Timing:${COLORS.reset} Within 24 hours after purchase`);
  log(`${COLORS.bright}Goal:${COLORS.reset} Help them get their first automation win from the pack.`);
  log("");
  log(`${COLORS.bright}Subject line idea:${COLORS.reset}`);
  info("\"Your Automation Accelerator Pack is ready — here's your first win\"");
  log("");
  log(`${COLORS.bright}Message content:${COLORS.reset}`);
  info("Welcome them and confirm the purchase.");
  info("Point them to the Quick Start Guide in the pack.");
  info("Suggest one specific workflow to try first (e.g., Lead Capture → CRM).");
  log("");
  log(`${COLORS.bright}CTA:${COLORS.reset}`);
  info("\"If you'd like me to build this with you live, here's the Pro Session link.\"");
  log(`${COLORS.dim}Link: https://your-pro-session-url-here${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}EMAIL 2 — Before / After${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Timing:${COLORS.reset} 3–4 days after purchase`);
  log(`${COLORS.bright}Goal:${COLORS.reset} Show the contrast between stuck vs automated.`);
  log("");
  log(`${COLORS.bright}Subject line idea:${COLORS.reset}`);
  info("\"Still copying data by hand? Here's the fix.\"");
  log("");
  log(`${COLORS.bright}Message content:${COLORS.reset}`);
  info("Paint the 'before' picture — manual work, wasted hours, burnout.");
  info("Paint the 'after' picture — automated flows, time freedom, scale.");
  info("Remind them the templates are ready to use.");
  log("");
  log(`${COLORS.bright}CTA:${COLORS.reset}`);
  info("\"If you've been procrastinating, let me help you get unstuck. Book a Pro Session.\"");
  log(`${COLORS.dim}Link: https://your-pro-session-url-here${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}${COLORS.cyan}EMAIL 3 — Last Call for This Round${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Timing:${COLORS.reset} ~7 days after purchase`);
  log(`${COLORS.bright}Tone:${COLORS.reset} Soft, non-pushy.`);
  log("");
  log(`${COLORS.bright}Subject line idea:${COLORS.reset}`);
  info("\"Closing Pro Sessions for now — last chance at this price\"");
  log("");
  log(`${COLORS.bright}Message content:${COLORS.reset}`);
  info("Explain you're closing this batch to focus on current clients.");
  info("Mention the price will go up next round.");
  info("Offer one last chance to join before you pause bookings.");
  log("");
  log(`${COLORS.bright}CTA:${COLORS.reset}`);
  info("\"If you want in before I raise the price, here's the link.\"");
  log(`${COLORS.dim}Link: https://your-pro-session-url-here${COLORS.reset}`);
  log("");
  
  log(`${COLORS.bright}${COLORS.yellow}Tip:${COLORS.reset} Copy-paste these into Gmail or your email tool of choice.`);
  log("");
}

const CONTENT_IDEA_PATTERNS = [
  {
    theme: "Before/After story",
    prompt: "Share a before/after scenario showing how manual chaos transforms into automated flow with the Automation Accelerator Pack."
  },
  {
    theme: "Mistake people make with automation",
    prompt: "Explain one common way people overcomplicate automation and how the Automation Accelerator Pack keeps it simple."
  },
  {
    theme: "Quick win tutorial",
    prompt: "Walk through one specific automation you can set up in under 15 minutes using the templates in the pack."
  },
  {
    theme: "Behind the scenes of how I automate X",
    prompt: "Show the actual workflow you use to automate a repetitive task, and how the pack provides a ready-made version."
  },
  {
    theme: "Client story / hypothetical scenario",
    prompt: "Describe a founder drowning in manual work and how using the Automation Accelerator Pack freed up 10+ hours a week."
  },
  {
    theme: "The hidden cost of manual work",
    prompt: "Calculate how much time/money is wasted on repetitive tasks and position the pack as the fix."
  },
  {
    theme: "One automation that changed everything",
    prompt: "Share the single most impactful automation from the pack and why it works so well for busy founders."
  }
];

async function cmdContentIdea() {
  header("Content Idea — Today");
  
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const dayOfMonth = today.getDate();
  const patternIndex = dayOfMonth % CONTENT_IDEA_PATTERNS.length;
  const pattern = CONTENT_IDEA_PATTERNS[patternIndex];
  
  log(`${COLORS.bright}Date:${COLORS.reset} ${dateStr}`);
  log("");
  log(`${COLORS.bright}Theme:${COLORS.reset} "${pattern.theme}"`);
  log("");
  log(`${COLORS.bright}Prompt to write about:${COLORS.reset}`);
  info(`"${pattern.prompt}"`);
  log("");
  log(`${COLORS.bright}Core message:${COLORS.reset}`);
  info("Always tie back to the Automation Accelerator Pack:");
  info("Save time, automate manual workflows, reduce chaos.");
  log("");
  success(`Next: run \`npm run creator:panel content:post\` to get a draft post.`);
  log("");
}

async function cmdContentPost() {
  header("Ready-to-Copy Post — Automation Accelerator");
  
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  
  log(`${COLORS.dim}Generated: ${dateStr}${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}${COLORS.cyan}--- COPY BELOW THIS LINE ---${COLORS.reset}`);
  log("");
  log("Most solo founders drown in repetitive tasks.");
  log("");
  log("They tell themselves they'll 'automate later' but later never comes.");
  log("");
  log("I built the Automation Accelerator Pack so you can ship one real automation this week instead of reading another thread.");
  log("");
  log("Inside:");
  log("- 25 plug-and-play workflow templates");
  log("- Pricing calculator for automation services");
  log("- Client proposal templates");
  log("- Onboarding scripts that actually work");
  log("");
  log("If you want a shortcut to automated operations, grab it here:");
  log("https://levqor.gumroad.com/l/doeitr");
  log("");
  log(`${COLORS.bright}${COLORS.cyan}--- COPY ABOVE THIS LINE ---${COLORS.reset}`);
  log("");
  log(`${COLORS.bright}Where to post:${COLORS.reset}`);
  info("X / Twitter");
  info("LinkedIn");
  info("Instagram story/reel (adapt as spoken script)");
  info("YouTube Shorts (read as voiceover)");
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
    case "money:ladder":
      await cmdMoneyLadder();
      break;
    case "money:followup":
      await cmdMoneyFollowup();
      break;
    case "ops:summary":
      await cmdOpsSummary();
      break;
    case "metrics:today":
      await cmdMetricsToday();
      break;
    case "costs:summary":
      await cmdCostsSummary();
      break;
    case "guardian:check":
      await cmdGuardianCheck();
      break;
    case "traffic:generate":
      await cmdTrafficGenerate();
      break;
    case "traffic:schedule":
      await cmdTrafficSchedule();
      break;
    case "loops:referral-link":
      await cmdLoopsReferralLink();
      break;
    case "loops:share-kit":
      await cmdLoopsShareKit();
      break;
    case "content:idea":
      await cmdContentIdea();
      break;
    case "content:post":
      await cmdContentPost();
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
