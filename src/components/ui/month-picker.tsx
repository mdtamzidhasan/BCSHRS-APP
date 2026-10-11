import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';

import { SelectField } from './select-field';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  label: string;
  /** "YYYY-MM" or "" when nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** How many years back from the current one to offer. */
  yearsBack?: number;
}

/** Month + year drop-downs standing in for the web's `<input type="month">`; the value is "YYYY-MM". */
export function MonthPicker({ label, value, onChange, error, yearsBack = 12 }: Props) {
  const [year, month] = value ? value.split('-') : [null, null];
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: yearsBack + 2 }, (_, index) => String(thisYear + 1 - index));

  if (year && !years.includes(year)) {
    years.push(year);
  }

  const update = (nextYear: string | null, nextMonth: string | null) => {
    onChange(`${nextYear ?? String(thisYear)}-${nextMonth ?? '01'}`);
  };

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.month}>
          <SelectField label={label} value={month} placeholder="Month" options={MONTHS.map((name, index) => ({ label: name, value: String(index + 1).padStart(2, '0') }))} onChange={(next) => update(year, next)} error={error} />
        </View>
        <View style={styles.year}>
          <SelectField label=" " value={year} placeholder="Year" options={years.map((name) => ({ label: name, value: name }))} onChange={(next) => update(next, month)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  month: { flex: 3 },
  year: { flex: 2 },
});
