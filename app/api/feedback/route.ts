import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, type, message } = body;

  if (!message || !type) {
    return NextResponse.json(
      { error: "Mensagem e tipo são obrigatórios." },
      { status: 400 }
    );
  }

  // Match env var names from laboratorio-derivativos
  const token = process.env.PUSHOVER_TOKEN ?? process.env.PUSHOVER_API_TOKEN;
  const user = process.env.PUSHOVER_USER ?? process.env.PUSHOVER_USER_KEY;

  if (!token || !user) {
    return NextResponse.json(
      { error: "Serviço indisponível (credenciais não configuradas)." },
      { status: 500 }
    );
  }

  const lines = [
    `Contato — Lab Dados Públicos`,
    `Tipo: ${type}`,
    name ? `Nome: ${name}` : null,
    email ? `Email: ${email}` : null,
    "",
    message.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const pushBody = new URLSearchParams();
  pushBody.append("token", token);
  pushBody.append("user", user);
  pushBody.append("title", `Lab Dados Públicos — ${type}`);
  pushBody.append("message", lines);

  const res = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: pushBody.toString(),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Pushover failed:", res.status, detail);
    return NextResponse.json(
      { error: "Falha ao enviar mensagem." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
