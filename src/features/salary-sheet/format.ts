const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** .NET "N" format: thousands separators, two decimals. */
export function formatN(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const negative = safe < 0;
  const [whole, fraction] = Math.abs(safe).toFixed(2).split('.');

  return `${negative ? '-' : ''}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
}

export function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

/** "2026-03-01 00:00:00" or "2026-03" -> "March, 2026". */
export function monthLabel(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})/.exec(value ?? '');

  return match ? `${MONTHS[Number(match[2]) - 1] ?? match[2]}, ${match[1]}` : (value ?? '');
}

/** Absolute month 202603 -> "March, 2026". */
export function absMonthLabel(value: number): string {
  const year = Math.floor(value / 100);
  const month = value - year * 100;

  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]}, ${year}` : String(value);
}

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? '';
}
