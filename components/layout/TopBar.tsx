import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";
import NavLinks from "./NavLinks";

export default function TopBar() {
  return (
    <header className="border-b border-border bg-bg-surface">
      <div className="mx-auto max-w-container px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <span className="rounded-[12px] bg-accent-cyan-dim p-2 text-3xl">
              🏦
            </span>
            <div>
              <span className="font-display text-xl font-bold text-text-primary">
                {APP_TITLE}
              </span>
              <span className="hidden text-sm text-text-muted sm:block">
                Portal de Dados Abertos do BCB
              </span>
            </div>
          </Link>
        </div>
        <div className="mt-2 overflow-x-auto">
          <NavLinks />
        </div>
      </div>
    </header>
  );
}
