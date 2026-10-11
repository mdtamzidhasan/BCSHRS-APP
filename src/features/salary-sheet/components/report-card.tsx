import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, shadow, spacing } from '@/theme/tokens';

import type { ReportCardData } from '../build-model';

/** One result row as a card: the key figures, and a tap-to-expand earnings / deductions breakdown. */
export function ReportCard({ card, highlight }: { card: ReportCardData; highlight?: boolean }) {
  const [open, setOpen] = useState(false);
  const expandable = card.sections.length > 0;

  return (
    <View style={[styles.card, highlight && styles.highlight]}>
      <View style={styles.header}>
        <AppText weight="medium" style={styles.title}>
          {card.title}
        </AppText>
        {card.subtitle ? (
          <AppText variant="caption" tone="muted">
            {card.subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={styles.body}>
        {card.facts.map((fact) => (
          <View key={fact.label} style={styles.row}>
            <AppText tone="muted">{fact.label}:</AppText>
            <AppText weight={fact.strong ? 'bold' : 'regular'}>{fact.value}</AppText>
          </View>
        ))}

        {expandable ? (
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((current) => !current)} style={styles.toggle}>
            <AppText tone="accent" weight="medium">
              {open ? 'Hide breakdown' : 'Show breakdown'}
            </AppText>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={palette.accent} />
          </Pressable>
        ) : null}

        {open
          ? card.sections.map((section) => (
              <View key={section.title} style={styles.section}>
                <AppText variant="label" tone="primary">
                  {section.title}
                </AppText>
                {section.lines.map((line, index) => (
                  <View key={`${line.name}-${index}`} style={styles.row}>
                    <AppText style={styles.lineName}>{line.tag ? `[${line.tag}] ${line.name}` : line.name}</AppText>
                    <AppText>{line.value}</AppText>
                  </View>
                ))}
              </View>
            ))
          : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: palette.primaryBorder, overflow: 'hidden', ...shadow.card },
  highlight: { borderColor: palette.accent },
  header: { backgroundColor: palette.primarySoft, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: palette.primaryDark },
  body: { padding: spacing.lg, gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  lineName: { flex: 1 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  section: { gap: spacing.xs, marginTop: spacing.sm },
});
