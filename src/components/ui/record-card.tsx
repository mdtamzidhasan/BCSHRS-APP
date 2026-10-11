import { StyleSheet, View } from 'react-native';

import { palette, radius, shadow, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

export interface RecordField {
  label: string;
  value: React.ReactNode;
}

interface Props {
  /** Shaded header band, e.g. "Payroll: July 2024". */
  title: string;
  subtitle?: string;
  fields: RecordField[];
  /** Buttons in the footer (e.g. the blue "Details"). */
  actions?: React.ReactNode;
  /** Short facts at the right of the footer (e.g. PayrollStatus / STATUS). */
  footerFacts?: RecordField[];
}

/** One row of a list rendered as a card — the mobile form of the web tables (see the payroll history design). */
export function RecordCard({ title, subtitle, fields, actions, footerFacts }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText weight="medium" style={styles.headerText}>
          {title}
        </AppText>
        {subtitle ? <AppText weight="medium">{subtitle}</AppText> : null}
      </View>
      <View style={styles.body}>
        {fields.map((field) => (
          <View key={field.label} style={styles.row}>
            <AppText tone="muted" style={styles.rowLabel}>
              {field.label}:
            </AppText>
            <View style={styles.rowValue}>{typeof field.value === 'string' || typeof field.value === 'number' ? <AppText>{field.value}</AppText> : field.value}</View>
          </View>
        ))}
        {actions || footerFacts?.length ? (
          <View style={styles.footer}>
            <View style={styles.actions}>{actions}</View>
            <View style={styles.facts}>
              {footerFacts?.map((fact) => (
                <AppText key={fact.label} variant="label" style={styles.fact}>
                  {fact.label}: {fact.value}
                </AppText>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: palette.primaryBorder, overflow: 'hidden', ...shadow.card },
  header: { backgroundColor: palette.primarySoft, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerText: { color: palette.primaryDark },
  body: { padding: spacing.lg, gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowLabel: { fontSize: 14 },
  rowValue: { flexShrink: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  actions: { flexDirection: 'row', gap: spacing.sm },
  facts: { alignItems: 'flex-end' },
  fact: { textAlign: 'right' },
});
