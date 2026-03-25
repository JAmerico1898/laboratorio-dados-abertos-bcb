import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";

export default function TopBar() {
  return (
    <header className="border-b border-border bg-bg-surface">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="rounded-[12px] bg-accent-cyan-dim p-2 text-2xl">
            🏦
          </span>
          <div>
            <span className="font-display text-lg font-bold text-text-primary">
              {APP_TITLE}
            </span>
            <span className="hidden text-xs text-text-muted sm:block">
              Portal de Dados Abertos do BCB
            </span>
          </div>
        </Link>
        <div className="api-badge">IF.DATA API</div>
      </div>
    </header>
  );
}
