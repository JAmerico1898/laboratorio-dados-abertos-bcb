"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { InstitutionRow } from "@/lib/types";
import { formatBRL } from "@/lib/formatting";
import SegmentPill from "./SegmentPill";

interface SearchInputProps {
  data: InstitutionRow[];
}

export default function SearchInput({ data }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const results = debouncedQuery
    ? data.filter(
        (d) =>
          d.NomeDisplay.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          d.NomeReduzido.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  return (
    <div className="mt-6">
      <label htmlFor="bank-search" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
        Buscar Instituição
      </label>
      <input
        id="bank-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar instituição..."
        className="w-full rounded-[10px] border border-border bg-bg-card px-4 py-2.5 font-display text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/15"
      />
      {debouncedQuery && (
        <p className="mt-1 text-xs text-text-muted" aria-live="polite">
          {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
        </p>
      )}
      {results.length > 0 && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-[12px] border border-border bg-bg-card">
          {results.slice(0, 20).map((inst) => {
            const rank = data.findIndex((d) => d.CodInst === inst.CodInst) + 1;
            return (
              <div
                key={inst.CodInst}
                className="flex items-center justify-between border-b border-border/50 px-4 py-2.5 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-text-muted">
                    #{rank}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-text-primary">
                      {inst.NomeReduzido}
                    </span>
                    {inst.NomeReduzido !== inst.NomeDisplay && (
                      <span className="ml-2 text-xs text-text-muted">
                        {inst.NomeDisplay}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SegmentPill segment={inst.Segmento} />
                  <span className="font-mono text-sm font-bold text-text-primary">
                    {formatBRL(inst.Saldo)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
