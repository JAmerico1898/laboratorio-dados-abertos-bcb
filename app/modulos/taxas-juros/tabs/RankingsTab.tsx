"use client";

import { SkeletonBox } from "@/components/ui/Skeleton";
import type { RankingsResponse, RankingEntry } from "@/lib/types";

function RankingTable({
  rows,
  color,
}: {
  rows: RankingEntry[];
  color: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-text-muted">Sem dados</p>;
  }
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
            <td
              className="text-right font-mono text-sm font-bold"
              style={{ color }}
            >
              {Number(row.TaxaJurosAoAno ?? 0).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface RankingsTabProps {
  data: RankingsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export default function RankingsTab({ data, isLoading, error }: RankingsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="animate-pulse text-sm text-text-muted">
          Carregando rankings de taxas de juros...
        </p>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-accent-rose/30 bg-accent-rose/10 p-4 text-sm text-accent-rose">
        Erro ao carregar rankings: {error}
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

  const firstMod = Object.values(data.modalities)[0];
  const refDate = firstMod?.latestDate
    ? new Date(firstMod.latestDate).toLocaleDateString("pt-BR")
    : "";

  return (
    <div className="space-y-8">
      {refDate && (
        <p className="font-mono text-xs text-text-muted">
          📅 Data de referência:{" "}
          <span className="font-bold text-accent-cyan">{refDate}</span>
        </p>
      )}

      {Object.entries(data.modalities).map(([slug, mod]) => {
        if (mod.top10.length === 0 && mod.bottom10.length === 0) return null;
        const totalIFs = new Set([
          ...mod.top10.map((r) => r.InstituicaoFinanceira),
          ...mod.bottom10.map((r) => r.InstituicaoFinanceira),
        ]).size;

        return (
          <div key={slug}>
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-base font-bold text-text-primary">
                {mod.name}
              </h3>
              <span className="text-xs text-text-muted">
                ({totalIFs} IFs)
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p
                  className="mb-2 text-sm font-semibold"
                  style={{ color: "#fb7185" }}
                >
                  ▲ Maiores Taxas
                </p>
                <RankingTable rows={mod.bottom10} color="#fb7185" />
              </div>
              <div>
                <p
                  className="mb-2 text-sm font-semibold"
                  style={{ color: "#34d399" }}
                >
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
