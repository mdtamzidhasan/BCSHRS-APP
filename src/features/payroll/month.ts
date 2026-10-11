import type { Option } from '@/components/ui/select-field';

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const MONTH_OPTIONS: Option<string>[] = MONTH_NAMES.map((name, index) => ({ label: name, value: String(index + 1) }));

/** Years around today, newest first. */
export function yearOptions(span = 10): Option<string>[] {
  const current = new Date().getFullYear();

  return Array.from({ length: span * 2 + 1 }, (_, index) => {
    const year = String(current + span - index);

    return { label: year, value: year };
  });
}

/** The legacy picker text "July, 2024" (month number 1-12 + year); empty when either part is missing. */
export function monthLabel(month: string | null, year: string | null): string {
  const name = month ? MONTH_NAMES[Number(month) - 1] : undefined;

  return name && year ? `${name}, ${year}` : '';
}

/** "2024-07" for the salary approval filter. */
export function monthValue(month: string | null, year: string | null): string {
  return month && year ? `${year}-${month.padStart(2, '0')}` : '';
}
