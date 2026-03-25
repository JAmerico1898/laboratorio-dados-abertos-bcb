"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-3 text-2xl font-bold">Algo deu errado</h2>
      <p className="mb-6 max-w-md text-text-secondary">
        Ocorreu um erro ao carregar esta página. Tente novamente ou volte para
        o Hub.
      </p>
      {error.message && (
        <p className="mb-4 rounded-lg border border-border bg-bg-card px-4 py-2 font-mono text-xs text-text-muted">
          {error.message}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-[10px] bg-gradient-to-br from-accent-cyan to-cyan-600 px-5 py-2.5 font-display text-sm font-bold text-bg-primary transition-shadow hover:shadow-lg hover:shadow-accent-cyan/30"
        >
          Tentar novamente
        </button>
        <a
          href="/"
          className="rounded-[10px] border border-border bg-bg-card px-5 py-2.5 font-display text-sm font-semibold text-text-primary no-underline transition-colors hover:border-border-hover hover:text-accent-cyan"
        >
          Voltar ao Hub
        </a>
      </div>
    </div>
  );
}
