"use client";

import type { InstitutionRow } from "@/lib/types";
import { formatBRL } from "@/lib/formatting";
import SegmentPill from "./SegmentPill";

interface Top20TableProps {
  data: InstitutionRow[];
  total: number;
  /** Total do Sistema Financeiro Nacional (all segments) */
  systemTotal: number;
  /** Label for the value column */
  valueLabel?: string;
}

const MEDALS = ["🏆", "🥈", "🥉"];

export default function Top20Table({
  data,
  total,
  systemTotal,
  valueLabel = "Valor",
}: Top20TableProps) {
  const top20 = data.slice(0, 20);
  // Scale bars relative to the largest institution
  const maxSaldo = top20.length > 0 ? Math.abs(top20[0].Saldo) : 1;

  return (
    <div className="overflow-x-auto">
      <table className="top20-table" aria-label="Top 20 instituições">
        <caption className="sr-only">
          Ranking das 20 maiores instituições por {valueLabel}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-12">•</th>
            <th scope="col">Instituição</th>
            <th scope="col" className="w-24">Segmento</th>
            <th scope="col" className="w-36 text-right">{valueLabel.toUpperCase()}</th>
            <th scope="col" className="w-44 text-right">% SISTEMA</th>
          </tr>
        </thead>
        <tbody>
          {top20.map((inst, i) => {
            const pct = systemTotal > 0 ? (Math.abs(inst.Saldo) / systemTotal) * 100 : 0;
            const barWidth = maxSaldo > 0 ? (Math.abs(inst.Saldo) / maxSaldo) * 100 : 0;
            return (
              <tr key={inst.CodInst}>
                <td className="text-center font-mono text-sm font-bold text-text-muted">
                  {i < 3 ? MEDALS[i] : `${i + 1}`}
                </td>
                <td>
                  <div className="text-sm font-bold text-text-primary">
                    {inst.NomeReduzido}
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-muted">
                    {inst.NomeDisplay}
                  </div>
                </td>
                <td>
                  <SegmentPill segment={inst.Segmento} />
                </td>
                <td className="text-right font-mono text-sm font-bold text-text-primary">
                  {formatBRL(Math.abs(inst.Saldo))}
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="w-14 text-right font-mono text-xs font-semibold text-accent-cyan">
                      {pct.toFixed(2)}%
                    </span>
                    <div className="h-2.5 w-24 overflow-hidden rounded-full bg-bg-surface">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: "rgba(34, 211, 238, 0.6)",
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length > 20 && (
        <p className="mt-2 text-center text-xs text-text-muted">
          Mostrando 20 de {data.length} instituições
        </p>
      )}
    </div>
  );
}
