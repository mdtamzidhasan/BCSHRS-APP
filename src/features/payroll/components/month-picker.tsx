import { StyleSheet, View } from 'react-native';

import { SelectField } from '@/components/ui/select-field';
import { MONTH_OPTIONS, yearOptions } from '../month';

interface Props {
  label: string;
  month: string | null;
  year: string | null;
  onMonth: (value: string) => void;
  onYear: (value: string) => void;
  error?: string;
}

const YEARS = yearOptions();

/** A month + year pair of drop-downs (the mobile form of the web month picker). */
export function MonthPicker({ label, month, year, onMonth, onYear, error }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.month}>
        <SelectField label={`${label} month`} value={month} options={MONTH_OPTIONS} onChange={onMonth} error={error} />
      </View>
      <View style={styles.year}>
        <SelectField label="Year" value={year} options={YEARS} onChange={onYear} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  month: { flex: 3 },
  year: { flex: 2 },
});
