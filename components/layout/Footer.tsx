import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 text-center font-mono text-xs text-text-muted">
      <div className="mx-auto max-w-container px-4">
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/modulos/sobre"
            className="text-accent-cyan no-underline hover:underline"
          >
            Sobre
          </Link>
          <span>•</span>
          <Link
            href="/modulos/feedback"
            className="text-accent-cyan no-underline hover:underline"
          >
            Feedback
          </Link>
        </div>
        <p className="mt-2">
          Dados: Banco Central do Brasil — IF.data
        </p>
      </div>
    </footer>
  );
}
