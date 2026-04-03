import { formatBRL } from "@/lib/formatting";

interface SummaryMetricsProps {
  total: number;
  systemTotal: number;
  count: number;
  top5Share: number;
  quarterLabel: string;
}

export default function SummaryMetrics({
  total,
  systemTotal,
  count,
  top5Share,
  quarterLabel,
}: SummaryMetricsProps) {
  const selectionPct = systemTotal > 0 ? (total / systemTotal) * 100 : 0;

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div className="metric-card">
        <div className="metric-label">Total do Sistema</div>
        <div className="metric-value">{formatBRL(systemTotal)}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Total Selecionado</div>
        <div className="metric-value">{formatBRL(total)}</div>
        <div className="mt-0.5 text-[11px] text-text-muted">
          {selectionPct.toFixed(1)}% do sistema
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Nº de Instituições (sel.)</div>
        <div className="metric-value">{count}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Top 5 (% Selecionado)</div>
        <div className="metric-value">{top5Share.toFixed(1)}%</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Período</div>
        <div className="metric-value">{quarterLabel}</div>
      </div>
    </div>
  );
}
