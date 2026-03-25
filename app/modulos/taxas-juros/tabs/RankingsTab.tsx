"use client";

import useSWR from "swr";
import { SkeletonBox } from "@/components/ui/Skeleton";
import type { RankingsResponse, RankingEntry } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function RankingTable({
  rows,
  color,
}: {
  rows: RankingEntry[];
  color: string;
}) {
  return (
    <table className="top20-table">
      <thead>
        <tr>
          <th className="w-10">#</th>
          <th>Instituição</th>
          <th className="w-28 text-right">Taxa (% a.a.)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="text-center font-mono text-sm text-text-muted">
              {i + 1}
            </td>
            <td className="text-sm font-bold text-text-primary">
              {String(row.InstituicaoFinanceira ?? "—")}
            </td>
            <td className="text-right font-mono text-sm font-bold" style={{ color }}>
              {Number(row.TaxaJurosAoAno ?? 0).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function RankingsTab() {
  const { data, isLoading } = useSWR<RankingsResponse>(
    "/api/taxas/rankings",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (!data?.modalities || Object.keys(data.modalities).length === 0) {
    return (
      <div className="text-center text-text-muted">
        Nenhum dado de ranking disponível.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(data.modalities).map(([slug, mod]) => {
        if (mod.top10.length === 0 && mod.bottom10.length === 0) return null;
        return (
          <div key={slug}>
            <div className="mb-2 flex items-baseline gap-2">
              <h3 className="text-base font-bold text-text-primary">
                {mod.name}
              </h3>
              <span className="text-xs text-text-muted">
                ({mod.top10.length + mod.bottom10.length} IFs)
              </span>
            </div>
            {mod.latestDate && (
              <p className="mb-3 font-mono text-xs text-text-muted">
                📅 Data: {mod.latestDate}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: "#fb7185" }}>
                  ▲ Maiores Taxas
                </p>
                <RankingTable rows={mod.bottom10} color="#fb7185" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: "#34d399" }}>
                  ▼ Menores Taxas
                </p>
                <RankingTable rows={mod.top10} color="#34d399" />
              </div>
            </div>
            <div className="mt-4 border-b border-border/30" />
          </div>
        );
      })}
    </div>
  );
}
