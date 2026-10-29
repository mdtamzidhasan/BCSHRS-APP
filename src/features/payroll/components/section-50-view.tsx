import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InlineTable, type TableColumn } from '@/components/ui/data-table';
import { ListToolbar } from '@/components/ui/list-toolbar';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import type { ViewMode } from '@/components/ui/view-toggle';
import { useChunkedRows } from '@/hooks/use-chunked-rows';
import { palette, spacing } from '@/theme/tokens';
import { SECTION_50_OPTIONS, type Section50Component } from '../api';
import { useSection50 } from '../use-components';

const OPTIONS = SECTION_50_OPTIONS.map((option) => ({ label: String(option), value: option }));

/** Section 50 mapping: every salary component with the Section 50 column it is summed into. Searchable by name, as cards or a table. */
export function Section50View() {
  const state = useSection50();
  const { query } = state;
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<ViewMode>('card');

  // the search only hides rows: edits live in the hook and Save sends every component, hidden ones included
  const term = search.trim().toLowerCase();
  const components = term ? state.components.filter((component) => component.name.toLowerCase().includes(term)) : state.components;
  const chunk = useChunkedRows(components, term);

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const columns: TableColumn<Section50Component>[] = [
    { key: 'name', title: 'Component Name', width: 240, render: (component) => component.name },
    { key: 'code', title: 'Code', width: 110, render: (component) => component.code },
    {
      key: 'section50',
      title: 'Section 50',
      width: 130,
      render: (component) => (
        // SelectField carries a bottom margin meant for forms; cancel it so the row keeps even padding
        <View style={styles.cancelMargin}>
          <SelectField value={component.section150} options={OPTIONS} onChange={(value) => state.change(component.code, value)} placeholder="Select" />
        </View>
      ),
    },
  ];

  const empty = term ? <EmptyState title="No matching components" message={`No component name contains "${search.trim()}".`} icon="search-outline" /> : <EmptyState title="No components" />;

  const saveBar = state.components.length ? (
    <View style={styles.footer}>
      <FormError error={state.save.error} />
      <Button title="Save" icon="save-outline" loading={state.save.isPending} disabled={!state.dirty} onPress={() => state.save.mutate()} />
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <FlatList
        // table mode draws its rows in the footer (one sideways-scrolling table); card mode lists one card per component
        data={mode === 'card' ? components : []}
        keyExtractor={(component) => component.code}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={mode === 'table' ? chunk.onScroll : undefined}
        scrollEventThrottle={100}
        automaticallyAdjustKeyboardInsets
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        ListHeaderComponent={state.components.length ? <ListToolbar label="Search component" placeholder="Search by component name" search={search} onSearch={setSearch} mode={mode} onMode={setMode} /> : null}
        ListEmptyComponent={mode === 'card' || !state.components.length ? empty : null}
        ListFooterComponent={
          <>
            {mode === 'table' && state.components.length ? <InlineTable rows={chunk.visible} total={chunk.total} columns={columns} keyExtractor={(component) => component.code} empty={empty} /> : null}
            {saveBar}
          </>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  code: { marginBottom: spacing.sm },
  footer: { marginTop: spacing.md },
  cancelMargin: { marginBottom: -spacing.md },
});
