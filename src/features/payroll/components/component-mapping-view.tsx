import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { InlineTable, type TableColumn } from '@/components/ui/data-table';
import { ListToolbar } from '@/components/ui/list-toolbar';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { SelectField } from '@/components/ui/select-field';
import type { ViewMode } from '@/components/ui/view-toggle';
import { useChunkedRows } from '@/hooks/use-chunked-rows';
import { palette, radius, spacing } from '@/theme/tokens';
import type { ComponentKind, MappingComponent } from '../api';
import { useComponentMapping } from '../use-components';

/** Component → group mapping: choose a group, tick its components (searchable by name, as cards or a table), save. */
export function ComponentMappingView({ kind }: { kind: ComponentKind }) {
  const state = useComponentMapping(kind);
  const { query } = state;
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<ViewMode>('card');

  // the search only hides rows: ticks live in the hook, so a hidden component keeps its tick and is still saved
  const term = search.trim().toLowerCase();
  const all = query.data?.components ?? [];
  const components = term ? all.filter((component) => component.comp_name.toLowerCase().includes(term)) : all;
  const chunk = useChunkedRows(components, `${state.selectedGroup}|${term}`);

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError && !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const groups = (query.data?.groups ?? []).map((group) => ({ label: `${group.group_name} (${group.group_id})`, value: group.group_id }));

  const toggleMark = (component: MappingComponent) => (
    <Ionicons name={state.isChecked(component.comp_code) ? 'checkbox' : 'square-outline'} size={22} color={state.isChecked(component.comp_code) ? palette.primary : palette.textMuted} />
  );

  const columns: TableColumn<MappingComponent>[] = [
    { key: 'on', title: 'Select', width: 72, align: 'center', render: toggleMark },
    { key: 'name', title: 'Component Name', width: 240, render: (component) => component.comp_name },
    { key: 'code', title: 'Code', width: 120, render: (component) => component.comp_code },
  ];

  const empty = term ? <EmptyState title="No matching components" message={`No component name contains "${search.trim()}".`} icon="search-outline" /> : <EmptyState title="No components" />;

  const saveBar = state.selectedGroup ? (
    <View style={styles.footer}>
      <FormError error={state.save.error} />
      <Button title="Save mapping" icon="save-outline" loading={state.save.isPending} onPress={() => state.save.mutate()} />
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <FlatList
        // table mode draws its rows in the footer (one sideways-scrolling table); card mode lists one row per component
        data={state.selectedGroup && mode === 'card' ? components : []}
        keyExtractor={(component) => component.comp_code}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={mode === 'table' ? chunk.onScroll : undefined}
        scrollEventThrottle={100}
        automaticallyAdjustKeyboardInsets
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        ListHeaderComponent={
          <View>
            <SelectField label="Group" value={state.selectedGroup} options={groups} onChange={state.selectGroup} placeholder="Select a group" />
            {state.selectedGroup ? <ListToolbar label="Search component" placeholder="Search by component name" search={search} onSearch={setSearch} mode={mode} onMode={setMode} /> : null}
          </View>
        }
        ListEmptyComponent={
          state.selectedGroup ? (mode === 'card' ? empty : null) : <EmptyState title="Select a group" message="Pick a group to map its components." icon="git-merge-outline" />
        }
        ListFooterComponent={
          state.selectedGroup ? (
            <>
              {mode === 'table' ? <InlineTable rows={chunk.visible} total={chunk.total} columns={columns} keyExtractor={(component) => component.comp_code} onRowPress={(component) => state.toggle(component.comp_code)} empty={empty} /> : null}
              {saveBar}
            </>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.surface, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border, padding: spacing.md },
  rowOn: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  text: { flex: 1 },
  footer: { marginTop: spacing.md },
});
