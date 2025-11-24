#!/usr/bin/env node

/**
 * Levqor Blueprint Drift Monitor
 * Enforces BLUEPRINT_BASELINE v12.13
 * 
 * Usage: node scripts/drift-monitor.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASELINE = {
  version: 'v12.15 Hybrid',
  routes: {
    public: ['/', '/pricing', '/guarantee', '/how-it-works', '/support', '/integrations', '/about', '/careers'],
    auth: ['/signin', '/dashboard', '/dashboard/v2'],
    policy: ['/terms', '/privacy', '/fair-use', '/acceptable-use', '/refunds', '/sla', '/support-policy', '/trial', '/cancellation', '/disputes', '/revisions', '/dfy-contract']
  },
  pricing: {
    starter: { monthly: 9, yearly: 90, workflows: 5, runs: 2000, aiCredits: 1000 },
    launch: { monthly: 29, yearly: 290, workflows: 20, runs: 10000, aiCredits: 5000 },
    growth: { monthly: 59, yearly: 590, workflows: 100, runs: 50000, aiCredits: 20000 },
    agency: { monthly: 149, yearly: 1490, workflows: 500, runs: 250000, aiCredits: 100000 }
  },
  dfy: {
    starter: 149,
    professional: 299,
    enterprise: 499
  },
  limits: {
    trial: 7,
    refund: 30,
    sla: 99.9,
    apiRateLimit: 1000,
    concurrentWorkflows: 50,
    dfyRevisions: 2
  },
  architecture: {
    apiEndpoint: 'https://api.levqor.ai',
    canonicalDomain: 'levqor.ai',
    protectedPaths: ['/dashboard', '/admin']
  }
};

const drift = {
  critical: [],
  major: [],
  minor: [],
  passed: []
};

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function checkPricingFile() {
  log('Checking pricing file...');
  const pricingPath = path.join(__dirname, '../src/app/pricing/page.tsx');
  
  if (!fs.existsSync(pricingPath)) {
    drift.critical.push({
      file: 'src/app/pricing/page.tsx',
      issue: 'Pricing file missing',
      severity: 'CRITICAL',
      impact: 'No pricing page exists'
    });
    return;
  }
  
  const content = fs.readFileSync(pricingPath, 'utf8');
  
  // Check all tier prices
  const tiers = ['starter', 'launch', 'growth', 'agency'];
  tiers.forEach(tier => {
    const expected = BASELINE.pricing[tier];
    
    // Check monthly price
    const monthlyRegex = new RegExp(`${tier}.*?monthly:\\s*${expected.monthly}`, 'is');
    if (!monthlyRegex.test(content)) {
      drift.critical.push({
        file: 'src/app/pricing/page.tsx',
        issue: `${tier} monthly price mismatch`,
        severity: 'CRITICAL',
        expected: `£${expected.monthly}`,
        impact: 'Pricing tier violation'
      });
    }
    
    // Check workflows
    const workflowRegex = new RegExp(`${tier}.*?workflows:\\s*${expected.workflows}`, 'is');
    if (!workflowRegex.test(content)) {
      drift.critical.push({
        file: 'src/app/pricing/page.tsx',
        issue: `${tier} workflows mismatch`,
        severity: 'CRITICAL',
        expected: expected.workflows,
        impact: 'Allowance violation'
      });
    }
  });
  
  // Check DFY prices
  if (!content.includes('price={149}') || !content.includes('price={299}') || !content.includes('price={499}')) {
    drift.critical.push({
      file: 'src/app/pricing/page.tsx',
      issue: 'DFY package pricing mismatch',
      severity: 'CRITICAL',
      expected: '£149/£299/£499',
      impact: 'DFY pricing violation'
    });
  }
  
  // Check API endpoint usage
  if (!content.includes('https://api.levqor.ai') && !content.includes('NEXT_PUBLIC_API_URL')) {
    drift.major.push({
      file: 'src/app/pricing/page.tsx',
      issue: 'API endpoint not configured',
      severity: 'MAJOR',
      expected: 'https://api.levqor.ai',
      impact: 'Checkout may fail'
    });
  }
  
  // v12.13: Check trial on ALL tiers
  const tiersWithTrial = ['starter', 'launch', 'growth', 'agency'];
  tiersWithTrial.forEach(tier => {
    const trialRegex = new RegExp(`${tier}.*?trial:\\s*true`, 'is');
    if (!trialRegex.test(content)) {
      drift.critical.push({
        file: 'src/app/pricing/page.tsx',
        issue: `${tier} tier missing trial flag`,
        severity: 'CRITICAL',
        expected: 'trial: true on all tiers (v12.13)',
        impact: 'Trial policy violation - must be available on all tiers'
      });
    }
  });
  
  // v12.13: Check trial wording includes card requirement
  if (!content.includes('Card required') && !content.includes('card required')) {
    drift.critical.push({
      file: 'src/app/pricing/page.tsx',
      issue: 'Trial messaging missing card requirement',
      severity: 'CRITICAL',
      expected: 'Trial wording must mention "Card required"',
      impact: 'Misleading trial terms - v12.13 violation'
    });
  }
  
  // v12.13: Check trial hero section exists
  if (!content.includes('7-day free trial') && !content.includes('7 days')) {
    drift.major.push({
      file: 'src/app/pricing/page.tsx',
      issue: 'Trial explanation section missing',
      severity: 'MAJOR',
      expected: 'Canonical trial explanation on pricing page',
      impact: 'Incomplete trial disclosure'
    });
  }
  
  if (drift.critical.length === 0) {
    drift.passed.push('Pricing file validated (v12.13)');
  }
}

function checkMiddleware() {
  log('Checking middleware...');
  const middlewarePath = path.join(__dirname, '../src/middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    drift.major.push({
      file: 'src/middleware.ts',
      issue: 'Middleware file missing',
      severity: 'MAJOR',
      impact: 'Auth protection not working'
    });
    return;
  }
  
  const content = fs.readFileSync(middlewarePath, 'utf8');
  
  // Check protected paths
  if (!content.includes('/dashboard') || !content.includes('/admin')) {
    drift.major.push({
      file: 'src/middleware.ts',
      issue: 'Protected paths mismatch',
      severity: 'MAJOR',
      expected: '[/dashboard, /admin]',
      impact: 'Auth protection misconfigured'
    });
  }
  
  // Check canonical domain
  if (!content.includes('levqor.ai')) {
    drift.major.push({
      file: 'src/middleware.ts',
      issue: 'Canonical domain mismatch',
      severity: 'MAJOR',
      expected: 'levqor.ai',
      impact: 'Domain redirect broken'
    });
  }
  
  if (drift.major.length === 0) {
    drift.passed.push('Middleware validated');
  }
}

function checkPolicyPages() {
  log('Checking policy pages...');
  const policyRoutes = BASELINE.routes.policy;
  
  policyRoutes.forEach(route => {
    const routePath = route.substring(1); // Remove leading /
    const pagePath = path.join(__dirname, `../src/app/${routePath}/page.tsx`);
    
    if (!fs.existsSync(pagePath)) {
      drift.major.push({
        file: `src/app/${routePath}/page.tsx`,
        issue: `Policy page missing: ${route}`,
        severity: 'MAJOR',
        impact: 'Blueprint route violation'
      });
    }
  });
  
  if (drift.major.length === 0) {
    drift.passed.push('All policy pages present');
  }
}

function checkRoutes() {
  log('Checking routes...');
  const allRoutes = [
    ...BASELINE.routes.public,
    ...BASELINE.routes.auth,
    ...BASELINE.routes.policy
  ];
  
  let missingRoutes = 0;
  
  allRoutes.forEach(route => {
    if (route === '/') return; // Root handled separately
    
    const routePath = route.substring(1).replace(/\//g, '/');
    const pagePath = path.join(__dirname, `../src/app/${routePath}/page.tsx`);
    
    if (!fs.existsSync(pagePath)) {
      drift.major.push({
        file: `src/app/${routePath}/page.tsx`,
        issue: `Route missing: ${route}`,
        severity: 'MAJOR',
        impact: 'Blueprint route violation (23 required)'
      });
      missingRoutes++;
    }
  });
  
  if (missingRoutes === 0) {
    drift.passed.push('All 23 blueprint routes present');
  }
}

function generateReport() {
  const timestamp = new Date().toISOString();
  const totalIssues = drift.critical.length + drift.major.length + drift.minor.length;
  const status = totalIssues === 0 ? 'PASS' : 'FAIL';
  
  let report = `# Blueprint Drift Status Report\n\n`;
  report += `**Baseline:** v12.13 (Trial on all tiers + Workflows/Runs/AI model)\n`;
  report += `**Checked:** ${timestamp}\n`;
  report += `**Status:** ${status}\n\n`;
  report += `---\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Critical Issues:** ${drift.critical.length}\n`;
  report += `- **Major Issues:** ${drift.major.length}\n`;
  report += `- **Minor Issues:** ${drift.minor.length}\n`;
  report += `- **Checks Passed:** ${drift.passed.length}\n\n`;
  
  if (drift.critical.length > 0) {
    report += `## 🔴 Critical Issues (${drift.critical.length})\n\n`;
    drift.critical.forEach((issue, i) => {
      report += `### ${i + 1}. ${issue.issue}\n\n`;
      report += `- **File:** \`${issue.file}\`\n`;
      report += `- **Severity:** ${issue.severity}\n`;
      if (issue.expected) report += `- **Expected:** ${issue.expected}\n`;
      report += `- **Impact:** ${issue.impact}\n\n`;
    });
  }
  
  if (drift.major.length > 0) {
    report += `## 🟡 Major Issues (${drift.major.length})\n\n`;
    drift.major.forEach((issue, i) => {
      report += `### ${i + 1}. ${issue.issue}\n\n`;
      report += `- **File:** \`${issue.file}\`\n`;
      report += `- **Severity:** ${issue.severity}\n`;
      if (issue.expected) report += `- **Expected:** ${issue.expected}\n`;
      report += `- **Impact:** ${issue.impact}\n\n`;
    });
  }
  
  if (drift.minor.length > 0) {
    report += `## 🔵 Minor Issues (${drift.minor.length})\n\n`;
    drift.minor.forEach((issue, i) => {
      report += `### ${i + 1}. ${issue.issue}\n\n`;
      report += `- **File:** \`${issue.file}\`\n`;
      report += `- **Severity:** ${issue.severity}\n`;
      report += `- **Impact:** ${issue.impact}\n\n`;
    });
  }
  
  if (drift.passed.length > 0) {
    report += `## ✅ Passed Checks (${drift.passed.length})\n\n`;
    drift.passed.forEach(check => {
      report += `- ${check}\n`;
    });
    report += `\n`;
  }
  
  report += `---\n\n`;
  report += `## Enforcement Rules\n\n`;
  report += `- ❌ **CRITICAL:** Breaks pricing, policy, or core architecture — MUST FIX before deploy\n`;
  report += `- ⚠️ **MAJOR:** Breaks routes, middleware, or auth — SHOULD FIX before deploy\n`;
  report += `- ℹ️ **MINOR:** Formatting or styling issues — CAN FIX later\n\n`;
  
  if (totalIssues > 0) {
    report += `## Recommended Actions\n\n`;
    report += `1. Review all CRITICAL issues immediately\n`;
    report += `2. Fix violations to restore blueprint compliance\n`;
    report += `3. Re-run drift monitor: \`node scripts/drift-monitor.js\`\n`;
    report += `4. Do NOT deploy until status = PASS\n\n`;
  }
  
  report += `---\n\n`;
  report += `*Generated by Levqor Blueprint Drift Monitor*\n`;
  
  return report;
}

function checkEnterpriseFiles() {
  log('Checking V12.12 Enterprise files...');
  
  const enterpriseFiles = [
    { path: '../../api/utils/resilience.py', name: 'Resilience layer', category: 'Reliability' },
    { path: '../../api/utils/logging_config.py', name: 'Structured logging', category: 'Observability' },
    { path: '../../api/utils/error_monitor.py', name: 'Error monitoring', category: 'Observability' },
    { path: '../../api/support/tiers.py', name: 'Support tier logic', category: 'Enterprise Support' },
    { path: '../../api/support/ai_router.py', name: 'AI routing stub', category: 'Enterprise Support' },
    { path: '../../scripts/backend_keepalive.py', name: 'Backend keep-alive', category: 'Reliability' },
    { path: '../src/lib/client-logger.ts', name: 'Frontend logger', category: 'Observability' }
  ];
  
  let missingFiles = 0;
  
  enterpriseFiles.forEach(file => {
    const filePath = path.join(__dirname, file.path);
    
    if (!fs.existsSync(filePath)) {
      drift.major.push({
        file: file.path.replace('../', ''),
        issue: `V12.12 Enterprise ${file.name} missing`,
        severity: 'MAJOR',
        category: file.category,
        impact: 'Enterprise upgrade incomplete'
      });
      missingFiles++;
    }
  });
  
  if (missingFiles === 0) {
    drift.passed.push('All V12.12 Enterprise files present');
  }
}

function main() {
  console.log('\n🔍 Levqor Blueprint Drift Monitor v12.15 Hybrid\n');
  console.log('============================================\n');
  
  checkPricingFile();
  checkMiddleware();
  checkPolicyPages();
  checkRoutes();
  checkEnterpriseFiles();
  
  const report = generateReport();
  const reportPath = path.join(__dirname, '../docs/DRIFT_STATUS.md');
  fs.writeFileSync(reportPath, report);
  
  console.log('\n============================================\n');
  console.log(`✅ Drift report generated: docs/DRIFT_STATUS.md`);
  
  const totalIssues = drift.critical.length + drift.major.length + drift.minor.length;
  
  if (totalIssues === 0) {
    console.log('✅ DRIFT STATUS: PASS — No violations detected\n');
    process.exit(0);
  } else {
    console.log(`❌ DRIFT STATUS: FAIL — ${totalIssues} issue(s) detected\n`);
    console.log(`   Critical: ${drift.critical.length}`);
    console.log(`   Major: ${drift.major.length}`);
    console.log(`   Minor: ${drift.minor.length}\n`);
    process.exit(1);
  }
}

main();
