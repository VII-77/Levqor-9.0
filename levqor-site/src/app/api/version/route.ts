import { NextResponse } from "next/server";

let versionData: { commit?: string; commitShort?: string; branch?: string; generatedAt?: string; name?: string } = {};

try {
  versionData = require("@/config/version.json");
} catch {
  versionData = {};
}

export async function GET() {
  return NextResponse.json({
    name: versionData.name || "levqor-site",
    commit: versionData.commit || "unknown",
    commitShort: versionData.commitShort || "unknown",
    branch: versionData.branch || "unknown",
    generatedAt: versionData.generatedAt || null,
    runtime: "next.js",
  });
}
