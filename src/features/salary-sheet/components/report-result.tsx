import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/state-views';
import { SectionHeader } from '@/components/ui/misc';
import { palette, spacing } from '@/theme/tokens';

import type { ReportModel } from '../build-model';
import { ReportCard } from './report-card';

/** The banner, grouped card list and grand total of any report. */
export function ReportResult({ model, emptyMessage = 'No record found for the selected period.' }: { model: ReportModel; emptyMessage?: string }) {
  return (
    <View style={styles.wrap}>
      {model.banner.length > 0 ? (
        <View style={styles.banner}>
          {model.banner.map((line, index) => (
            <AppText key={line} weight={index === 0 ? 'bold' : 'regular'} style={styles.center}>
              {line}
            </AppText>
          ))}
        </View>
      ) : null}

      {model.isEmpty ? (
        <EmptyState title="No records" message={emptyMessage} />
      ) : (
        <>
          {model.groups.map((group) => (
            <View key={group.key} style={styles.group}>
              {group.title ? <SectionHeader title={group.title} /> : null}
              {group.cards.map((card) => (
                <ReportCard key={card.key} card={card} />
              ))}
            </View>
          ))}
          {model.total ? <ReportCard card={model.total} highlight /> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  banner: { backgroundColor: palette.surface, borderRadius: 12, padding: spacing.md, gap: 2 },
  center: { textAlign: 'center' },
  group: { gap: spacing.md },
});
