import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { RecordCard } from '@/components/ui/record-card';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { palette, spacing } from '@/theme/tokens';
import type { ComponentKind } from '../api';
import { useComponentSorting } from '../use-components';

/** Component sorting and grouping: per component the sub code, the sort number and the group; one Save for all. */
export function ComponentSortingView({ kind }: { kind: ComponentKind }) {
  const state = useComponentSorting(kind);
  const { query } = state;

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError && !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const groups = [{ label: 'No group', value: '' }, ...(query.data?.groups ?? []).map((group) => ({ label: group.group_name, value: group.group_id }))];

  return (
    <FlatList
      data={state.rows}
      keyExtractor={(row) => row.comp_code}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
      ListEmptyComponent={<EmptyState title="No components" />}
      ListFooterComponent={
        state.rows.length ? (
          <View style={styles.footer}>
            <FormError error={state.save.error} />
            <Button title="Save" icon="save-outline" loading={state.save.isPending} disabled={!state.dirty} onPress={() => state.save.mutate()} />
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const value = state.valueOf(item);

        return (
          <RecordCard
            title={item.comp_name}
            subtitle={item.sname || undefined}
            fields={[{ label: 'Code', value: item.comp_code }]}
            actions={
              <View style={styles.form}>
                <TextField label="Sub code" value={value.s_code} onChangeText={(text) => state.change(item.comp_code, { s_code: text })} autoCapitalize="none" />
                <TextField label="SL" value={value.comp_sl} onChangeText={(text) => state.change(item.comp_code, { comp_sl: text })} keyboardType="number-pad" />
                <SelectField label="Group" value={value.group_id} options={groups} onChange={(group) => state.change(item.comp_code, { group_id: group })} />
              </View>
            }
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  form: { flex: 1 },
  footer: { marginTop: spacing.md },
});
