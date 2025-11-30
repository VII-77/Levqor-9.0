#!/usr/bin/env node
/**
 * Write version.json with current git commit SHA and timestamp.
 * Used by prebuild to embed version info in the app.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const version = {
  commit: getGitCommit(),
  commitShort: getGitCommit().slice(0, 7),
  branch: getGitBranch(),
  generatedAt: new Date().toISOString(),
  name: 'levqor-site'
};

const outPath = path.join(__dirname, '..', 'src', 'config', 'version.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(version, null, 2));

console.log(`[write-version] Wrote ${outPath}`);
console.log(`  commit: ${version.commitShort}`);
console.log(`  branch: ${version.branch}`);
console.log(`  generatedAt: ${version.generatedAt}`);
