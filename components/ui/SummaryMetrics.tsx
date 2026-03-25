import { formatBRL } from "@/lib/formatting";

interface SummaryMetricsProps {
  total: number;
  count: number;
  top5Share: number;
  quarterLabel: string;
}

export default function SummaryMetrics({
  total,
  count,
  top5Share,
  quarterLabel,
}: SummaryMetricsProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="metric-card">
        <div className="metric-label">Total do Sistema</div>
        <div className="metric-value">{formatBRL(total)}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Nº de Instituições</div>
        <div className="metric-value">{count}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Top 5 (% do Total)</div>
        <div className="metric-value">{top5Share.toFixed(1)}%</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Período</div>
        <div className="metric-value">{quarterLabel}</div>
      </div>
    </div>
  );
}
