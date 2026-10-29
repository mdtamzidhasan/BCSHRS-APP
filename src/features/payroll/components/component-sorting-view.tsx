import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, RefreshControl, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InlineTable, type TableColumn } from '@/components/ui/data-table';
import { ListToolbar } from '@/components/ui/list-toolbar';
import { RecordCard } from '@/components/ui/record-card';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import type { ViewMode } from '@/components/ui/view-toggle';
import { useChunkedRows } from '@/hooks/use-chunked-rows';
import { palette, radius, spacing } from '@/theme/tokens';
import type { ComponentKind, SortRow } from '../api';
import { useComponentSorting } from '../use-components';

/** Component sorting and grouping: per component the sub code, the sort number and the group; one Save for all. Searchable by name, as cards or a table. */
export function ComponentSortingView({ kind }: { kind: ComponentKind }) {
  const state = useComponentSorting(kind);
  const { query } = state;
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<ViewMode>('card');

  // the search only hides rows: edits live in the hook and Save sends every component, hidden ones included
  const term = search.trim().toLowerCase();
  const rows = term ? state.rows.filter((row) => row.comp_name.toLowerCase().includes(term)) : state.rows;
  const chunk = useChunkedRows(rows, term);

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError && !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const groups = [{ label: 'No group', value: '' }, ...(query.data?.groups ?? []).map((group) => ({ label: group.group_name, value: group.group_id }))];

  const columns: TableColumn<SortRow>[] = [
    { key: 'name', title: 'Component Name', width: 210, render: (row) => row.comp_name },
    { key: 'code', title: 'Code', width: 90, render: (row) => row.comp_code },
    { key: 'sname', title: 'Sub name', width: 130, render: (row) => row.sname || '-' },
    {
      key: 'sCode',
      title: 'Sub code',
      width: 120,
      render: (row) => <CellInput value={state.valueOf(row).s_code} onChangeText={(text) => state.change(row.comp_code, { s_code: text })} />,
    },
    {
      key: 'sl',
      title: 'SL',
      width: 90,
      render: (row) => <CellInput value={state.valueOf(row).comp_sl} onChangeText={(text) => state.change(row.comp_code, { comp_sl: text })} keyboardType="number-pad" />,
    },
    {
      key: 'group',
      title: 'Group',
      width: 200,
      render: (row) => (
        // SelectField carries a bottom margin meant for forms; cancel it so the row keeps even padding
        <View style={styles.cancelMargin}>
          <SelectField value={state.valueOf(row).group_id} options={groups} onChange={(group) => state.change(row.comp_code, { group_id: group })} placeholder="Select group" />
        </View>
      ),
    },
  ];

  const empty = term ? <EmptyState title="No matching components" message={`No component name contains "${search.trim()}".`} icon="search-outline" /> : <EmptyState title="No components" />;

  const saveBar = state.rows.length ? (
    <View style={styles.footer}>
      <FormError error={state.save.error} />
      <Button title="Save" icon="save-outline" loading={state.save.isPending} disabled={!state.dirty} onPress={() => state.save.mutate()} />
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <FlatList
        // table mode draws its rows in the footer (one sideways-scrolling table); card mode lists one card per component
        data={mode === 'card' ? rows : []}
        keyExtractor={(row) => row.comp_code}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={mode === 'table' ? chunk.onScroll : undefined}
        scrollEventThrottle={100}
        automaticallyAdjustKeyboardInsets
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        ListHeaderComponent={state.rows.length ? <ListToolbar label="Search component" placeholder="Search by component name" search={search} onSearch={setSearch} mode={mode} onMode={setMode} /> : null}
        ListEmptyComponent={mode === 'card' || !state.rows.length ? empty : null}
        ListFooterComponent={
          <>
            {mode === 'table' && state.rows.length ? <InlineTable rows={chunk.visible} total={chunk.total} columns={columns} keyExtractor={(row) => row.comp_code} empty={empty} /> : null}
            {saveBar}
          </>
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
    </KeyboardAvoidingView>
  );
}

/** A compact input for a table cell. */
function CellInput({ value, onChangeText, keyboardType }: { value: string; onChangeText: (text: string) => void; keyboardType?: 'number-pad' }) {
  return <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize="none" autoCorrect={false} style={styles.cellInput} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  form: { flex: 1 },
  footer: { marginTop: spacing.md },
  cancelMargin: { marginBottom: -spacing.md },
  cellInput: { minHeight: 40, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, color: palette.text, fontSize: 14 },
});
