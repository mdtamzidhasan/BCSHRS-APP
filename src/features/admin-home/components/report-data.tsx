import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { palette, spacing } from '@/theme/tokens';

type Json = unknown;

const isRecord = (value: Json): value is Record<string, Json> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isScalar = (value: Json): value is string | number | boolean | null | undefined => value === null || value === undefined || ['string', 'number', 'boolean'].includes(typeof value);

/** snake_case / camelCase key -> "Title Case" label. */
export function humanize(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatScalar(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Report fields may carry HTML (letters, notes); show it as plain text.
  return String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

const isTotalKey = (key: string) => /total|net|gross/i.test(key);

function Row({ label, value }: { label: string; value: string }) {
  const strong = isTotalKey(label);

  return (
    <View style={styles.row}>
      <AppText tone="muted" style={styles.label}>
        {label}
      </AppText>
      <AppText weight={strong ? 'bold' : 'medium'} style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

/** Rows for the scalar entries of an object, then a nested block for every object / array entry. */
function ObjectBlock({ data, depth }: { data: Record<string, Json>; depth: number }) {
  const entries = Object.entries(data);
  const scalars = entries.filter(([, value]) => isScalar(value));
  const nested = entries.filter(([, value]) => !isScalar(value));

  return (
    <View style={styles.block}>
      {scalars.map(([key, value]) => (
        <Row key={key} label={humanize(key)} value={formatScalar(value as string | number | boolean | null | undefined)} />
      ))}
      {nested.map(([key, value]) => (
        <Section key={key} title={humanize(key)} value={value} depth={depth + 1} />
      ))}
    </View>
  );
}

function Section({ title, value, depth }: { title: string; value: Json; depth: number }) {
  if (Array.isArray(value) && value.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="label" tone="primary" weight="bold" style={styles.sectionTitle}>
        {title}
      </AppText>
      <Body value={value} depth={depth} />
    </View>
  );
}

function Body({ value, depth }: { value: Json; depth: number }) {
  if (isScalar(value)) {
    return <AppText>{formatScalar(value)}</AppText>;
  }

  if (Array.isArray(value)) {
    return (
      <View style={styles.block}>
        {value.map((item, index) =>
          isScalar(item) ? (
            <AppText key={index}>{formatScalar(item)}</AppText>
          ) : (
            <View key={index} style={styles.item}>
              <Body value={item} depth={depth + 1} />
            </View>
          ),
        )}
      </View>
    );
  }

  if (isRecord(value)) {
    return <ObjectBlock data={value} depth={depth} />;
  }

  return null;
}

/** Renders any report JSON (payslip, tax computation, letters …) as cards: key-value rows, nested earnings / deductions lists, totals. */
export function ReportData({ data, title }: { data: Json; title?: string }) {
  if (isRecord(data)) {
    const scalars = Object.fromEntries(Object.entries(data).filter(([, value]) => isScalar(value)));
    const nested = Object.entries(data).filter(([, value]) => !isScalar(value));

    return (
      <View style={styles.root}>
        {Object.keys(scalars).length > 0 ? (
          <Card outlined title={title}>
            <ObjectBlock data={scalars} depth={0} />
          </Card>
        ) : null}
        {nested.map(([key, value]) => (
          <Card key={key} outlined title={humanize(key)}>
            <Body value={value} depth={1} />
          </Card>
        ))}
      </View>
    );
  }

  return (
    <Card outlined title={title}>
      <Body value={data} depth={0} />
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  block: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 2 },
  label: { flexShrink: 0, maxWidth: '50%' },
  value: { flex: 1, textAlign: 'right' },
  section: { marginTop: spacing.sm, gap: spacing.xs },
  sectionTitle: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.primaryBorder, paddingBottom: spacing.xs },
  item: { paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
});
