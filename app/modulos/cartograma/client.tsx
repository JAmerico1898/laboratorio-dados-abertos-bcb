"use client";

import useSWR from "swr";
import DorlingCartogram from "@/components/charts/DorlingCartogram";
import { SkeletonBox } from "@/components/ui/Skeleton";
import { formatBRL } from "@/lib/formatting";
import { REGION_CENTROIDS } from "@/lib/constants";
import type { IFDataResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const REGION_VARS = ["sudeste", "sul", "nordeste", "centro_oeste", "norte"];
const REGION_LABELS: Record<string, string> = {
  sudeste: "Sudeste",
  sul: "Sul",
  nordeste: "Nordeste",
  centro_oeste: "Centro-Oeste",
  norte: "Norte",
};

export default function CartogramaClient() {
  // Fetch all regions in parallel
  const results = REGION_VARS.map((v) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSWR<IFDataResponse>(`/api/ifdata/9?variable=${v}&segments=S1,S2,S3,S4,N1,N2,N4`, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    })
  );

  const isLoading = results.some((r) => r.isLoading);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBox key={i} className="h-20" />
          ))}
        </div>
        <SkeletonBox className="h-[500px]" />
      </div>
    );
  }

  // Aggregate: sum all institutions per region
  const regionData: { name: string; value: number; color: string; cx: number; cy: number }[] = [];
  let grandTotal = 0;

  for (let i = 0; i < REGION_VARS.length; i++) {
    const key = REGION_VARS[i];
    const label = REGION_LABELS[key];
    const data = results[i].data;
    const total = data?.total ?? 0;
    grandTotal += total;

    const centroid = REGION_CENTROIDS[label];
    if (centroid) {
      regionData.push({
        name: label,
        value: total,
        color: centroid.color,
        cx: centroid.x,
        cy: centroid.y,
      });
    }
  }

  // Sort for table
  const sorted = [...regionData].sort((a, b) => b.value - a.value);
  const topRegion = sorted[0];
  const maxVal = topRegion?.value ?? 1;

  return (
    <>
      {/* Summary metrics */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="metric-card">
          <div className="metric-label">Crédito Total</div>
          <div className="metric-value">{formatBRL(grandTotal)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Maior Região</div>
          <div className="metric-value">
            {topRegion
              ? `${topRegion.name} (${((topRegion.value / grandTotal) * 100).toFixed(1)}%)`
              : "—"}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Regiões</div>
          <div className="metric-value">{regionData.length}</div>
        </div>
      </div>

      {/* Cartogram */}
      <DorlingCartogram regions={regionData} total={grandTotal} />

      {/* Data table */}
      <div className="mt-6">
        <h2 className="mb-3 text-xl font-bold">📊 Dados por Região</h2>
        <div className="overflow-x-auto">
          <table className="top20-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Região</th>
                <th className="w-36 text-right">Crédito Total</th>
                <th className="w-20 text-right">% Total</th>
                <th className="w-48"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const pct = grandTotal > 0 ? (r.value / grandTotal) * 100 : 0;
                const barW = maxVal > 0 ? (r.value / maxVal) * 100 : 0;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <tr key={r.name}>
                    <td className="text-center font-mono text-sm font-bold text-text-muted">
                      {i < 3 ? medals[i] : `${i + 1}`}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        <span className="text-sm font-bold text-text-primary">
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-right font-mono text-sm font-bold text-text-primary">
                      {formatBRL(r.value)}
                    </td>
                    <td className="text-right font-mono text-xs font-semibold text-accent-cyan">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="px-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-surface">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${barW}%`,
                            backgroundColor: `${r.color}66`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
