import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, issue_type, message } = body;

    if (!name || !email || !issue_type || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    console.log("[SUPPORT] New support request:", {
      name,
      email,
      issue_type,
      message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
      timestamp: new Date().toISOString(),
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (API_URL) {
      try {
        await fetch(`${API_URL}/api/system/support-request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, issue_type, message }),
        });
      } catch (apiError) {
        console.error("[SUPPORT] Failed to forward to backend API:", apiError);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Support request received" 
    });
  } catch (error) {
    console.error("[SUPPORT] Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
