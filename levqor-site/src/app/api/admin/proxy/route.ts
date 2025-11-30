import { NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://levqor-backend.replit.app";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

const ADMIN_EMAILS = [
  "admin@levqor.ai",
  "vii7cc@gmail.com",
];

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    
    if (!endpoint) {
      return NextResponse.json({ error: "missing endpoint" }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin proxy error:", error);
    return NextResponse.json({ error: "proxy_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    
    if (!endpoint) {
      return NextResponse.json({ error: "missing endpoint" }, { status: 400 });
    }

    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin proxy error:", error);
    return NextResponse.json({ error: "proxy_error" }, { status: 500 });
  }
}
