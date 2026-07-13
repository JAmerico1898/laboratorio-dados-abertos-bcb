/**
 * Format a raw BRL value to a readable string.
 * Values are raw integers (e.g., 1e9 = R$ 1,0 bi).
 *
 * Ported from config.py:format_brl()
 */
export function formatBRL(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) {
    return `R$ ${(value / 1e12).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} tri`;
  }
  if (abs >= 1e9) {
    return `R$ ${(value / 1e9).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} bi`;
  }
  if (abs >= 1e6) {
    return `R$ ${(value / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi`;
  }
  if (abs >= 1e3) {
    return `R$ ${(value / 1e3).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`;
  }
  return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

/**
 * Format a percentage value.
 *
 * Ported from config.py:format_pct()
 */
export function formatPct(value: number): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/**
 * Format an anomes integer (e.g., 202509) to a readable string (e.g., "Set/2025").
 *
 * Ported from data_utils.py:format_anomes()
 */
export function formatAnomes(anomes: number): string {
  const year = Math.floor(anomes / 100);
  const month = anomes % 100;
  const monthNames: Record<number, string> = {
    3: "Mar",
    6: "Jun",
    9: "Set",
    12: "Dez",
  };
  const m = monthNames[month] ?? String(month).padStart(2, "0");
  return `${m}/${year}`;
}

/**
 * Format the annualized DRE period label.
 * The DRE is annualized over the 12 months ending at `anomes`, so the window
 * starts the month after the same month one year earlier.
 * E.g., anomes=202603 → "Abril/2025 a Março/2026"
 */
export function formatDrePeriod(anomes: number): string {
  const monthNamesFull: Record<number, string> = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
  };
  const endYear = Math.floor(anomes / 100);
  const endMonth = anomes % 100;
  let startMonth = endMonth + 1;
  let startYear = endYear - 1;
  if (startMonth > 12) {
    startMonth -= 12;
    startYear += 1;
  }
  return `${monthNamesFull[startMonth]}/${startYear} a ${monthNamesFull[endMonth]}/${endYear}`;
}

/**
 * Get the last N quarters from a given anomes.
 *
 * Ported from data_utils.py:get_last_n_quarters()
 */
export function getLastNQuarters(anomes: number, n: number = 4): number[] {
  let year = Math.floor(anomes / 100);
  let month = anomes % 100;
  const quarters: number[] = [];
  for (let i = 0; i < n; i++) {
    quarters.push(year * 100 + month);
    month -= 3;
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
  }
  return quarters;
}
