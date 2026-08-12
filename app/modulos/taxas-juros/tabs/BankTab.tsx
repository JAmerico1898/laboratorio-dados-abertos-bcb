"use client";

import { useState, useEffect, useRef } from "react";
import { SkeletonBox } from "@/components/ui/Skeleton";

interface BankModality {
  modName: string;
  rate: number;
  rank: number;
  total: number;
}

export default function BankTab({ segment }: { segment: "pf" | "pj" }) {
  const [banks, setBanks] = useState<string[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBank, setSelectedBank] = useState("");
  const [bankData, setBankData] = useState<BankModality[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Accent-insensitive match, so "itau" finds "ITAÚ UNIBANCO S.A."
  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const needle = normalize(query.trim());
  const suggestions = banks
    .filter((b) => normalize(b).includes(needle))
    .slice(0, 50);

  // Reset the search box when the PF/PJ segment changes
  useEffect(() => {
    setQuery("");
    setSelectedBank("");
    setOpen(false);
  }, [segment]);

  // Close the suggestion list on an outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const pick = (name: string) => {
    setSelectedBank(name);
    setQuery(name);
    setOpen(false);
  };

  // Fetch bank list once (server caches it)
  useEffect(() => {
    fetch(`/api/taxas/banks?segment=${segment}`)
      .then((r) => r.json())
      .then((d) => {
        setBanks(d.banks ?? []);
        setLoadingBanks(false);
      })
      .catch(() => setLoadingBanks(false));
  }, [segment]);

  // Fetch bank details when selected (single API call, server reads from LRU cache)
  useEffect(() => {
    if (!selectedBank) {
      setBankData([]);
      return;
    }

    let cancelled = false;
    setLoadingBank(true);

    fetch(`/api/taxas/bank?name=${encodeURIComponent(selectedBank)}&segment=${segment}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setBankData(d.modalities ?? []);
          setLoadingBank(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingBank(false);
      });

    return () => { cancelled = true; };
  }, [selectedBank, segment]);

  if (loadingBanks) {
    return (
      <div className="space-y-3">
        <p className="animate-pulse text-sm text-text-muted">
          Carregando lista de instituições...
        </p>
        <SkeletonBox className="h-12" />
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-4" ref={boxRef}>
        <label
          htmlFor="taxas-bank-search"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted"
        >
          Selecione o banco:
        </label>
        <input
          id="taxas-bank-search"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder="Digite para buscar um banco..."
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (selectedBank) setSelectedBank("");
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length > 0) {
              e.preventDefault();
              pick(suggestions[0]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="w-full rounded-[10px] border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/15"
        />
        {open && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[10px] border border-border bg-bg-card shadow-lg"
          >
            {suggestions.length > 0 ? (
              suggestions.map((b) => (
                <li key={b}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={b === selectedBank}
                    onClick={() => pick(b)}
                    className="block w-full border-b border-border/50 px-4 py-2 text-left text-sm text-text-primary last:border-b-0 hover:bg-accent-cyan/10"
                  >
                    {b}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-text-muted">
                Nenhum banco encontrado.
              </li>
            )}
          </ul>
        )}
      </div>

      {selectedBank && (
        <>
          <h3 className="mb-4 text-xl font-bold text-text-primary">
            🏦 {selectedBank}
          </h3>

          {loadingBank ? (
            <div className="space-y-3">
              <p className="animate-pulse text-sm text-text-muted">
                Buscando taxas...
              </p>
              <SkeletonBox className="h-48" />
            </div>
          ) : bankData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="top20-table">
                <thead>
                  <tr>
                    <th>Modalidade</th>
                    <th className="w-32 text-right">Taxa (% a.a.)</th>
                    <th className="w-32 text-center">Posição</th>
                  </tr>
                </thead>
                <tbody>
                  {bankData.map((row, i) => (
                    <tr key={i}>
                      <td className="text-sm font-bold text-text-primary">
                        {row.modName}
                      </td>
                      <td className="text-right font-mono text-sm font-bold text-text-primary">
                        {row.rate.toFixed(2)}
                      </td>
                      <td className="text-center font-mono text-sm font-semibold text-accent-cyan">
                        {row.rank}º de {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              {selectedBank}: dados indisponíveis.
            </p>
          )}
        </>
      )}
    </>
  );
}
