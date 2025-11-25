import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, category } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/api/support/ticket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message, category }),
        });
      } catch (err) {
        console.warn("Failed to forward to backend API:", err);
      }
    }

    console.log("Support ticket received:", {
      name,
      email,
      category,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: "Support ticket submitted successfully",
    });
  } catch (err: any) {
    console.error("Support ticket error:", err?.message);
    return NextResponse.json(
      { error: "Failed to submit support ticket" },
      { status: 500 }
    );
  }
}
