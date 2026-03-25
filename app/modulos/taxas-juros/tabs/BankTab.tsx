"use client";

import { useState } from "react";
import useSWR from "swr";
import { MODALITIES } from "@/lib/constants";
import { SkeletonBox } from "@/components/ui/Skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BankTab() {
  const [selectedMod, setSelectedMod] = useState(MODALITIES[2]?.slug ?? "");

  const { data, isLoading } = useSWR(
    selectedMod ? `/api/taxas/${selectedMod}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  // Collect all bank names from the current modality data
  const banks: string[] = [];
  if (data?.rates) {
    const seen = new Set<string>();
    for (const r of data.rates) {
      const name = r.InstituicaoFinanceira ?? r.instituicaoFinanceira;
      if (name && !seen.has(name)) {
        seen.add(name);
        banks.push(name);
      }
    }
    banks.sort();
  }

  const [selectedBank, setSelectedBank] = useState("");

  // Find bank's latest rate
  let bankRate: { rate: number; rank: number; total: number } | null = null;
  if (selectedBank && data?.rates) {
    const latestDate = data.latestDate;
    const latestRows = data.rates.filter(
      (r: Record<string, unknown>) =>
        String(r.data ?? r.Data ?? r.InicioPeriodo ?? r.Mes ?? "") === latestDate
    );
    const bankRow = latestRows.find(
      (r: Record<string, unknown>) =>
        (r.InstituicaoFinanceira ?? r.instituicaoFinanceira) === selectedBank
    );
    if (bankRow) {
      const rate = Number(bankRow.TaxaJurosAoAno ?? 0);
      const sorted = latestRows
        .filter((r: Record<string, unknown>) => Number(r.TaxaJurosAoAno ?? 0) > 0)
        .sort(
          (a: Record<string, unknown>, b: Record<string, unknown>) =>
            Number(a.TaxaJurosAoAno) - Number(b.TaxaJurosAoAno)
        );
      const rank =
        sorted.findIndex(
          (r: Record<string, unknown>) =>
            (r.InstituicaoFinanceira ?? r.instituicaoFinanceira) === selectedBank
        ) + 1;
      bankRate = { rate, rank, total: sorted.length };
    }
  }

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          Modalidade
        </label>
        <select
          value={selectedMod}
          onChange={(e) => {
            setSelectedMod(e.target.value);
            setSelectedBank("");
          }}
          className="w-full rounded-[10px] border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
        >
          {MODALITIES.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <SkeletonBox className="h-48" />}

      {!isLoading && banks.length > 0 && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Banco
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
          >
            <option value="">Selecione um banco...</option>
            {banks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedBank && bankRate && (
        <div className="rounded-[12px] border border-border bg-bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-text-primary">
            🏦 {selectedBank}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="metric-card">
              <div className="metric-label">Modalidade</div>
              <div className="text-sm font-bold text-text-primary">
                {data?.modalityName ?? selectedMod}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Taxa (% a.a.)</div>
              <div className="metric-value">{bankRate.rate.toFixed(2)}%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Posição</div>
              <div className="metric-value">
                {bankRate.rank}º de {bankRate.total}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBank && !bankRate && !isLoading && (
        <p className="text-center text-text-muted">
          {selectedBank}: dados indisponíveis para esta modalidade.
        </p>
      )}
    </>
  );
}
