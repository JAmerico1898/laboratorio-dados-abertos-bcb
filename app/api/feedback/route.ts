import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, type, message } = body;

  if (!message || !type) {
    return NextResponse.json(
      { error: "Message and type are required" },
      { status: 400 }
    );
  }

  // Send to Pushover if configured
  const pushoverToken = process.env.PUSHOVER_API_TOKEN;
  const pushoverUser = process.env.PUSHOVER_USER_KEY;

  if (pushoverToken && pushoverUser) {
    try {
      const pushoverMessage = [
        `[LDP Feedback] ${type}`,
        name ? `De: ${name}` : "",
        email ? `Email: ${email}` : "",
        `\n${message}`,
      ]
        .filter(Boolean)
        .join("\n");

      await fetch("https://api.pushover.net/1/messages.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: pushoverToken,
          user: pushoverUser,
          message: pushoverMessage,
          title: "LDP Feedback",
        }),
      });
    } catch (err) {
      console.error("Pushover notification failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}
