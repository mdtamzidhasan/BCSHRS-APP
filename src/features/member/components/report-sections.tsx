import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { KeyValue, SectionHeader } from '@/components/ui/misc';
import { palette, spacing } from '@/theme/tokens';

import type { ReportNode } from '../api';

type Record_ = { [key: string]: ReportNode };

/** "joining_date" / "grossSalary" → "Joining Date" / "Gross Salary". */
export function humanize(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function formatValue(value: ReportNode): string {
  if (value === null || value === '') {
    return '-';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

const isScalar = (value: ReportNode): value is string | number | boolean | null => value === null || typeof value !== 'object';
const isRecord = (value: ReportNode): value is Record_ => typeof value === 'object' && value !== null && !Array.isArray(value);
const HIDDEN_KEYS = new Set(['logo_path', 'logo']);
const isTotal = (key: string) => /total|net|gross|payable/i.test(key);

/** A titled card holding the rows of one report section. */
export function ReportSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Card outlined>
      {title ? <SectionHeader title={title} /> : null}
      <View style={styles.rows}>{children}</View>
    </Card>
  );
}

/** Label / value rows (employee, company, period …). Total-like keys are emphasised. */
export function ReportKeyValues({ values }: { values: Record_ }) {
  return (
    <>
      {Object.entries(values)
        .filter(([key, value]) => isScalar(value) && !HIDDEN_KEYS.has(key))
        .map(([key, value]) => (
          <KeyValue key={key} label={humanize(key)} value={<AppText weight={isTotal(key) ? 'bold' : 'medium'}>{formatValue(value)}</AppText>} />
        ))}
    </>
  );
}

/** A list of {name, amount} style lines (earnings, deductions, bank transactions) as rows, with an optional total. */
export function ReportLineList({ items, total }: { items: Record_[]; total?: { label: string; value: string } }) {
  return (
    <>
      {items.map((item, index) => {
        const entries = Object.entries(item).filter(([key, value]) => isScalar(value) && !HIDDEN_KEYS.has(key));
        const text = entries.filter(([, value]) => typeof value === 'string');
        const numbers = entries.filter(([, value]) => typeof value === 'number');

        // Classic "description ... amount" line.
        if (text.length === 1 && numbers.length === 1) {
          return <KeyValue key={index} label={String(text[0][1])} value={formatValue(numbers[0][1])} />;
        }

        return (
          <View key={index} style={styles.block}>
            {entries.map(([key, value]) => (
              <KeyValue key={key} label={humanize(key)} value={formatValue(value)} />
            ))}
          </View>
        );
      })}
      {total ? (
        <View style={styles.total}>
          <KeyValue label={total.label} value={<AppText weight="bold">{total.value}</AppText>} />
        </View>
      ) : null}
    </>
  );
}

/** Renders any report JSON as sections: scalars as key/value rows, nested objects and lists as their own cards. */
export function ReportData({ data, title, depth = 0 }: { data: ReportNode; title?: string; depth?: number }) {
  if (isScalar(data)) {
    return (
      <ReportSection title={title}>
        <AppText>{formatValue(data)}</AppText>
      </ReportSection>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return null;
    }

    const records = data.filter(isRecord);

    return (
      <ReportSection title={title}>
        {records.length === data.length ? (
          <ReportLineList items={records} total={sumTotal(records)} />
        ) : (
          data.map((value, index) => <AppText key={index}>{typeof value === 'object' ? JSON.stringify(value) : formatValue(value)}</AppText>)
        )}
      </ReportSection>
    );
  }

  const entries = Object.entries(data).filter(([key]) => !HIDDEN_KEYS.has(key));
  const hasScalars = entries.some(([, value]) => isScalar(value));
  const nested = entries.filter(([, value]) => !isScalar(value));

  return (
    <View style={styles.stack}>
      {hasScalars ? (
        <ReportSection title={title ?? (depth === 0 ? 'Summary' : undefined)}>
          <ReportKeyValues values={data} />
        </ReportSection>
      ) : null}
      {nested.map(([key, value]) => (depth < 4 ? <ReportData key={key} data={value} title={humanize(key)} depth={depth + 1} /> : null))}
    </View>
  );
}

/** A "Total" row for a list of lines that has exactly one numeric column. */
function sumTotal(items: Record_[]): { label: string; value: string } | undefined {
  const numericKeys = new Set(items.flatMap((item) => Object.entries(item).filter(([, value]) => typeof value === 'number').map(([key]) => key)));

  if (numericKeys.size !== 1 || items.length < 2) {
    return undefined;
  }

  const [key] = [...numericKeys];

  return { label: 'Total', value: formatValue(items.reduce((sum, item) => sum + (typeof item[key] === 'number' ? (item[key] as number) : 0), 0)) };
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  rows: { gap: spacing.xs },
  block: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  total: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.primaryBorder },
});
