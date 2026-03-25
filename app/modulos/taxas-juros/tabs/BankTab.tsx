"use client";

import { useState, useEffect } from "react";
import { SkeletonBox } from "@/components/ui/Skeleton";

interface BankModality {
  modName: string;
  rate: number;
  rank: number;
  total: number;
}

export default function BankTab() {
  const [banks, setBanks] = useState<string[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBank, setSelectedBank] = useState("");
  const [bankData, setBankData] = useState<BankModality[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);

  // Fetch bank list once (server caches it)
  useEffect(() => {
    fetch("/api/taxas/banks")
      .then((r) => r.json())
      .then((d) => {
        setBanks(d.banks ?? []);
        setLoadingBanks(false);
      })
      .catch(() => setLoadingBanks(false));
  }, []);

  // Fetch bank details when selected (single API call, server reads from LRU cache)
  useEffect(() => {
    if (!selectedBank) {
      setBankData([]);
      return;
    }

    let cancelled = false;
    setLoadingBank(true);

    fetch(`/api/taxas/bank?name=${encodeURIComponent(selectedBank)}`)
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
  }, [selectedBank]);

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
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          Selecione o banco:
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
