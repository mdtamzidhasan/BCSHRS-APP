import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { palette, spacing } from '@/theme/tokens';
import { SECTION_50_OPTIONS } from '../api';
import { useSection50 } from '../use-components';

const OPTIONS = SECTION_50_OPTIONS.map((option) => ({ label: String(option), value: option }));

/** Section 50 mapping: every salary component with the Section 50 column it is summed into. */
export function Section50View() {
  const state = useSection50();
  const { query } = state;

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  return (
    <FlatList
      data={state.components}
      keyExtractor={(component) => component.code}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
      ListEmptyComponent={<EmptyState title="No components" />}
      ListFooterComponent={
        state.components.length ? (
          <View style={styles.footer}>
            <FormError error={state.save.error} />
            <Button title="Save" icon="save-outline" loading={state.save.isPending} disabled={!state.dirty} onPress={() => state.save.mutate()} />
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <Card outlined>
          <AppText weight="medium">{item.name}</AppText>
          <AppText variant="caption" tone="muted" style={styles.code}>
            {item.code}
          </AppText>
          <SelectField label="Section 50" value={item.section150} options={OPTIONS} onChange={(value) => state.change(item.code, value)} />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  code: { marginBottom: spacing.sm },
  footer: { marginTop: spacing.md },
});
