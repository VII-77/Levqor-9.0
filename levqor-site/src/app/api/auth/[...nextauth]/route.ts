export const runtime = "nodejs";

import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

function safeLog(...args: unknown[]) {
  try {
    console.log(...args);
  } catch {
    // ignore
  }
}

export async function GET(req: NextRequest) {
  safeLog("[AUTH_ROUTE_GET]", JSON.stringify({
    tag: "AUTH_ROUTE",
    method: "GET",
    url: req.url,
    timestamp: new Date().toISOString(),
  }));

  try {
    const res = await handlers.GET(req);
    safeLog("[AUTH_ROUTE_GET_OK]", JSON.stringify({
      tag: "AUTH_ROUTE",
      method: "GET",
      url: req.url,
      status: res.status,
      timestamp: new Date().toISOString(),
    }));
    return res;
  } catch (error: unknown) {
    const err = error as Error & { code?: string; type?: string };
    safeLog("[AUTH_ROUTE_GET_ERROR]", JSON.stringify({
      tag: "AUTH_ROUTE",
      method: "GET",
      url: req.url,
      name: err?.name ?? null,
      message: err?.message ?? null,
      code: err?.code ?? null,
      type: err?.type ?? null,
      timestamp: new Date().toISOString(),
    }));
    throw error;
  }
}

export async function POST(req: NextRequest) {
  safeLog("[AUTH_ROUTE_POST]", JSON.stringify({
    tag: "AUTH_ROUTE",
    method: "POST",
    url: req.url,
    timestamp: new Date().toISOString(),
  }));

  try {
    const res = await handlers.POST(req);
    safeLog("[AUTH_ROUTE_POST_OK]", JSON.stringify({
      tag: "AUTH_ROUTE",
      method: "POST",
      url: req.url,
      status: res.status,
      timestamp: new Date().toISOString(),
    }));
    return res;
  } catch (error: unknown) {
    const err = error as Error & { code?: string; type?: string };
    safeLog("[AUTH_ROUTE_POST_ERROR]", JSON.stringify({
      tag: "AUTH_ROUTE",
      method: "POST",
      url: req.url,
      name: err?.name ?? null,
      message: err?.message ?? null,
      code: err?.code ?? null,
      type: err?.type ?? null,
      timestamp: new Date().toISOString(),
    }));
    throw error;
  }
}
