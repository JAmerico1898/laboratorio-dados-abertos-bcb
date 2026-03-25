"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import SegmentFilter from "@/components/ui/SegmentFilter";
import HBarChart from "@/components/charts/HBarChart";
import { SkeletonBox } from "@/components/ui/Skeleton";
import SegmentPill from "@/components/ui/SegmentPill";
import { INDICES, DEFAULT_SEGMENTS } from "@/lib/constants";
import { formatBRL, formatPct } from "@/lib/formatting";
import type { Segment, IndicesResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORIES: Record<string, string[]> = {
  Ativos: ["credito_pct_ativos", "provisoes_pct_carteira"],
  Capital: ["basileia", "alavancagem", "pl_ajustado"],
  Resultado: [
    "resultado_intermediacao_pct",
    "despesa_captacao_pct",
    "roa",
    "eficiencia",
  ],
};

export default function IndicesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedIndex = searchParams.get("index") ?? "";
  const segments: Segment[] = (
    searchParams.get("seg")?.split(",").filter(Boolean) ?? DEFAULT_SEGMENTS
  ) as Segment[];

  const setIndex = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("index", key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setSegments = useCallback(
    (segs: Segment[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("seg", segs.join(","));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const [sortReversed, setSortReversed] = useState(false);

  const apiUrl = selectedIndex
    ? `/api/indices?index=${selectedIndex}&segments=${segments.join(",")}`
    : null;

  const { data, isLoading } = useSWR<IndicesResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  const indexDef = INDICES.find((i) => i.key === selectedIndex);

  return (
    <>
      {/* Category-based index selector */}
      {Object.entries(CATEGORIES).map(([catName, keys]) => (
        <div key={catName} className="mb-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {catName}
          </h3>
          <div className="flex flex-wrap gap-2">
            {keys.map((key) => {
              const def = INDICES.find((i) => i.key === key);
              if (!def) return null;
              const isActive = selectedIndex === key;
              return (
                <button
                  key={key}
                  onClick={() => setIndex(key)}
                  className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-accent-cyan to-cyan-600 text-bg-primary"
                      : "border border-border bg-bg-card text-text-primary hover:border-border-hover hover:text-accent-cyan"
                  }`}
                >
                  {def.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="my-4 border-t border-border" />

      <SegmentFilter selected={segments} onChange={setSegments} />

      {!selectedIndex && (
        <div className="flex h-64 items-center justify-center text-text-muted">
          👆 Selecione um índice acima para visualizar os dados.
        </div>
      )}

      {selectedIndex && isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="h-20" />
            ))}
          </div>
          <SkeletonBox className="h-[500px]" />
        </div>
      )}

      {selectedIndex && data && indexDef && (
        <>
          {/* Metrics */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="metric-card">
              <div className="metric-label">Mediana</div>
              <div className="metric-value">
                {indexDef.unit === "currency"
                  ? formatBRL(data.median)
                  : formatPct(data.median)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Média</div>
              <div className="metric-value">
                {indexDef.unit === "currency"
                  ? formatBRL(data.mean)
                  : formatPct(data.mean)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Nº de Instituições</div>
              <div className="metric-value">{data.count}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Índice</div>
              <div className="metric-value text-base">{indexDef.label}</div>
            </div>
          </div>

          <p className="mb-2 text-sm text-text-muted">
            {indexDef.description}
          </p>

          {/* Sort toggle */}
          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={sortReversed}
              onChange={(e) => setSortReversed(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`inline-block h-5 w-9 rounded-full transition-colors ${
                sortReversed ? "bg-accent-cyan" : "bg-bg-card"
              }`}
            >
              <span
                className={`mt-0.5 block h-4 w-4 rounded-full bg-white transition-transform ${
                  sortReversed ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
            🔄 Inverter ordenação
          </label>

          {/* Bar chart */}
          <HBarChart
            data={
              sortReversed
                ? [...data.institutions].reverse()
                : data.institutions
            }
            format={indexDef.unit === "currency" ? "currency" : "pct"}
            label={indexDef.label}
          />

          {/* Ranking table */}
          <div className="mt-6">
            <h2 className="mb-3 text-xl font-bold">📋 Ranking Completo</h2>
            <div className="overflow-x-auto">
              <table className="top20-table">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>Instituição</th>
                    <th className="w-24">Segmento</th>
                    <th className="w-36 text-right">
                      {indexDef.label.toUpperCase()}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(sortReversed
                    ? [...data.institutions].reverse()
                    : data.institutions
                  )
                    .slice(0, 20)
                    .map((inst, i) => (
                      <tr key={inst.CodInst}>
                        <td className="text-center font-mono text-sm font-bold text-text-muted">
                          {i < 3
                            ? ["🏆", "🥈", "🥉"][i]
                            : `${i + 1}`}
                        </td>
                        <td className="text-sm font-bold text-text-primary">
                          {inst.NomeReduzido}
                        </td>
                        <td>
                          <SegmentPill segment={inst.Segmento} />
                        </td>
                        <td className="text-right font-mono text-sm font-bold text-text-primary">
                          {indexDef.unit === "currency"
                            ? formatBRL(inst.value)
                            : `${inst.value.toFixed(2)}%`}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
