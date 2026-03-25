"use client";

import dynamic from "next/dynamic";

// Dynamic import using react-plotly.js factory pattern
// This avoids the __webpack_require__.n error by explicitly
// binding plotly.js-dist-min to the react-plotly.js factory
const Plot = dynamic(
  async () => {
    const [{ default: Plotly }, { default: createPlotlyComponent }] =
      await Promise.all([
        import("plotly.js-dist-min" as string),
        import("react-plotly.js/factory" as string),
      ]);
    return createPlotlyComponent(Plotly);
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-[12px] border border-border bg-bg-card">
        <span className="animate-pulse text-text-muted">
          Carregando gráfico...
        </span>
      </div>
    ),
  }
);

export default function PlotlyChart(
  props: Record<string, unknown>
) {
  return <Plot {...props} />;
}
