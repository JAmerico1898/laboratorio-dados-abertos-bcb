"use client";

import { useState } from "react";

const TYPES = ["💡 Sugestão", "❓ Dúvida", "🐛 Bug", "⭐ Elogio"];

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setType(TYPES[0]);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-[16px] border border-border bg-bg-card p-6"
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fb-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            Nome (opcional)
          </label>
          <input
            id="fb-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Maria Silva"
            className="w-full rounded-[10px] border border-border bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="fb-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            E-mail (opcional)
          </label>
          <input
            id="fb-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex.: maria@email.com"
            className="w-full rounded-[10px] border border-border bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="fb-type"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted"
        >
          Tipo
        </label>
        <select
          id="fb-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="fb-message"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted"
        >
          Mensagem
        </label>
        <textarea
          id="fb-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Descreva sua sugestão, dúvida ou problema..."
          required
          className="w-full resize-none rounded-[10px] border border-border bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending" || !message.trim()}
        className="w-full rounded-[10px] bg-gradient-to-br from-accent-cyan to-cyan-600 px-6 py-3 font-display text-sm font-bold text-bg-primary transition-shadow hover:shadow-lg hover:shadow-accent-cyan/30 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando..." : "📤 Enviar"}
      </button>

      {status === "success" && (
        <p className="mt-3 text-center text-sm font-semibold text-accent-emerald">
          ✅ Enviado com sucesso!
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-center text-sm text-accent-rose">
          Erro ao enviar. Tente novamente.
        </p>
      )}
    </form>
  );
}
