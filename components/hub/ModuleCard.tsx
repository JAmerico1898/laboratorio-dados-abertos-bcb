import Link from "next/link";
import type { ModuleDef } from "@/lib/types";

const BADGE_CLASSES: Record<string, string> = {
  treemap: "badge-treemap",
  barras: "badge-barras",
  cartograma: "badge-cartograma",
  custom: "badge-custom",
};

const BADGE_LABELS: Record<string, string> = {
  treemap: "Treemap",
  barras: "Barras",
  cartograma: "Cartograma",
  custom: "Ranking",
};

export default function ModuleCard({ module }: { module: ModuleDef }) {
  return (
    <Link
      href={`/modulos/${module.slug}`}
      className="hub-card group block no-underline"
    >
      <span className="mb-4 inline-block rounded-[12px] bg-accent-cyan-dim p-2 text-3xl">
        {module.icon}
      </span>
      <h3 className="mb-2 font-display text-base font-bold text-text-primary">
        {module.title}
      </h3>
      <p className="text-[0.82rem] leading-relaxed text-text-muted">
        {module.description}
      </p>
      <span
        className={`mt-3.5 inline-block rounded-pill px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${BADGE_CLASSES[module.vizType] ?? "badge-custom"}`}
      >
        {BADGE_LABELS[module.vizType] ?? module.vizType}
      </span>
    </Link>
  );
}
