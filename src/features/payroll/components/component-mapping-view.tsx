import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { SelectField } from '@/components/ui/select-field';
import { palette, radius, spacing } from '@/theme/tokens';
import type { ComponentKind } from '../api';
import { useComponentMapping } from '../use-components';

/** Component → group mapping: choose a group, tick its components, save. */
export function ComponentMappingView({ kind }: { kind: ComponentKind }) {
  const state = useComponentMapping(kind);
  const { query } = state;

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError && !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const groups = (query.data?.groups ?? []).map((group) => ({ label: `${group.group_name} (${group.group_id})`, value: group.group_id }));

  return (
    <FlatList
      data={state.selectedGroup ? query.data?.components : []}
      keyExtractor={(component) => component.comp_code}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
      ListHeaderComponent={<SelectField label="Group" value={state.selectedGroup} options={groups} onChange={state.selectGroup} placeholder="Select a group" />}
      ListEmptyComponent={<EmptyState title={state.selectedGroup ? 'No components' : 'Select a group'} message={state.selectedGroup ? undefined : 'Pick a group to map its components.'} icon="git-merge-outline" />}
      ListFooterComponent={
        state.selectedGroup ? (
          <View style={styles.footer}>
            <FormError error={state.save.error} />
            <Button title="Save mapping" icon="save-outline" loading={state.save.isPending} onPress={() => state.save.mutate()} />
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const on = state.isChecked(item.comp_code);

        return (
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => state.toggle(item.comp_code)} style={[styles.row, on && styles.rowOn]}>
            <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? palette.primary : palette.textMuted} />
            <View style={styles.text}>
              <AppText weight="medium">{item.comp_name}</AppText>
              <AppText variant="caption" tone="muted">
                {item.comp_code}
              </AppText>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.surface, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border, padding: spacing.md },
  rowOn: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  text: { flex: 1 },
  footer: { marginTop: spacing.md },
});
