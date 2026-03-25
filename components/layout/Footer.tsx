import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface">
      <div className="mx-auto max-w-container px-4 py-6">
        <div className="space-y-1.5 text-center text-xs text-text-muted">
          <p>
            Dúvidas? Sugestões?{" "}
            <Link
              href="/modulos/feedback"
              className="font-semibold text-accent-cyan underline decoration-accent-cyan/50 underline-offset-2 transition-colors hover:text-text-primary"
            >
              Entre em contato!
            </Link>
          </p>
          <p>
            &copy; 2026 Laboratório de Dados Públicos - Portal de Dados Abertos
            do BCB - Prof. José Américo — COPPEAD-FGV-UCAM
          </p>
        </div>
      </div>
    </footer>
  );
}
