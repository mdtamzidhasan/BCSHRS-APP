import { StyleSheet, View } from 'react-native';

import { palette, radius, shadow, spacing } from '@/theme/tokens';

import { AppText } from './app-text';
import { Button } from './button';

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** A report entry: teal-outlined card, title, and one full-width action ("Generate Payslip" → Action). */
export function ReportActionCard({ title, description, actionLabel = 'View / Generate', onPress, loading, disabled }: Props) {
  return (
    <View style={styles.card}>
      <AppText weight="bold" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText tone="muted" variant="caption">
          {description}
        </AppText>
      ) : null}
      <Button title={actionLabel} onPress={onPress} loading={loading} disabled={disabled} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: palette.primaryBorder, padding: spacing.md, gap: spacing.xs, ...shadow.card },
  title: { fontSize: 14 },
  button: { marginTop: spacing.sm },
});
