"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/modulos/ativos-passivos", label: "Ativos e Passivos" },
  { href: "/modulos/resultado", label: "Resultado" },
  { href: "/modulos/credito-pf", label: "Crédito PF" },
  { href: "/modulos/credito-pj", label: "Crédito PJ" },
  { href: "/modulos/taxas-juros", label: "Taxas de Juros" },
  { href: "/modulos/indices", label: "Índices Financeiros" },
  { href: "/modulos/credito-regiao", label: "Crédito por Região" },
  { href: "/modulos/cartograma", label: "Crédito Total por Região" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {NAV_ITEMS.filter((item) => item.href !== pathname).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg px-2.5 py-1.5 text-sm text-text-secondary no-underline transition-colors hover:bg-bg-card hover:text-accent-cyan"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
