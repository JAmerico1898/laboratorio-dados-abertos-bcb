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
 * E.g., anomes=202509 → "Dez/2024 a Set/2025"
 */
export function formatDrePeriod(anomes: number): string {
  const quarters = getLastNQuarters(anomes, 4);
  const oldest = quarters[quarters.length - 1];
  // The period starts from the quarter before the oldest
  const startYear = Math.floor(oldest / 100);
  const startMonth = oldest % 100;
  let prevMonth = startMonth - 3;
  let prevYear = startYear;
  if (prevMonth <= 0) {
    prevMonth += 12;
    prevYear -= 1;
  }
  const start = prevYear * 100 + prevMonth;
  return `${formatAnomes(start)} a ${formatAnomes(anomes)}`;
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
