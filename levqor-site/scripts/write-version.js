#!/usr/bin/env node
/**
 * Write version.json with current git commit SHA and timestamp.
 * Used by prebuild to embed version info in the app.
 * 
 * Priority:
 *   1. VERCEL_GIT_COMMIT_SHA / VERCEL_GIT_COMMIT_REF (Vercel build)
 *   2. git rev-parse (local dev / Replit)
 *   3. "unknown" fallback
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const shaEnv = process.env.VERCEL_GIT_COMMIT_SHA;
const refEnv = process.env.VERCEL_GIT_COMMIT_REF;

function getGitCommit() {
  if (shaEnv) {
    return shaEnv;
  }
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getGitBranch() {
  if (refEnv) {
    return refEnv;
  }
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const commit = getGitCommit();
const branch = getGitBranch();

const version = {
  name: 'levqor-site',
  commit,
  commitShort: commit !== 'unknown' ? commit.slice(0, 7) : 'unknown',
  branch,
  generatedAt: new Date().toISOString(),
  runtime: 'next.js'
};

const outPath = path.join(__dirname, '..', 'src', 'config', 'version.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(version, null, 2));

console.log(`[write-version] Wrote ${outPath}`);
console.log(`  commit: ${version.commitShort}`);
console.log(`  branch: ${version.branch}`);
console.log(`  generatedAt: ${version.generatedAt}`);
