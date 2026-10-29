import { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, RefreshControl, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InlineTable, type TableColumn } from '@/components/ui/data-table';
import { RecordCard } from '@/components/ui/record-card';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle';
import { useChunkedRows } from '@/hooks/use-chunked-rows';
import { useFormErrors } from '@/hooks/use-form-errors';
import { palette, spacing } from '@/theme/tokens';
import type { Company } from '../api';
import { useCompanies } from '../use-companies';

/** Companies: add / edit form above the list of companies, searchable by name and shown as cards or as a table. */
export function CompaniesView() {
  const state = useCompanies();
  const errors = useFormErrors(state.save.error);
  const { query } = state;
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<ViewMode>('card');

  const term = search.trim().toLowerCase();
  const companies = useMemo(() => {
    const all = query.data?.companies ?? [];

    return term ? all.filter((company) => company.cname.toLowerCase().includes(term)) : all;
  }, [query.data, term]);
  const chunk = useChunkedRows(companies, term);

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  // a company's own domain stays selectable even when it is not one of the standard ones
  const domains = [...new Set([...query.data.domains, ...(state.domain ? [state.domain] : [])])].map((domain) => ({ label: domain, value: domain }));

  const actions = (company: Company) => (
    <>
      <Button title="Edit" size="sm" variant="info" block={false} onPress={() => state.edit(company)} />
      <Button title="Delete" size="sm" variant="danger" block={false} onPress={() => state.setToDelete(company)} />
    </>
  );

  const columns: TableColumn<Company>[] = [
    { key: 'name', title: 'Company Name', width: 220, render: (company) => company.cname },
    { key: 'code', title: 'Company Code', width: 120, render: (company) => company.company_code },
    { key: 'domain', title: 'Business Domain', width: 160, render: (company) => company.type },
    { key: 'actions', title: '', width: 170, align: 'center', render: (company) => <View style={styles.rowActions}>{actions(company)}</View> },
  ];

  // nothing matches the search, as opposed to there being no companies at all
  const empty = term ? <EmptyState title="No matching companies" message={`No company name contains "${search.trim()}".`} icon="search-outline" /> : <EmptyState title="No companies" />;

  const form = (
    <View style={styles.header}>
      {/* search first: at the top it stays in view above the keyboard while typing */}
      <View style={styles.toolbar}>
        <TextField label="Search company" value={search} onChangeText={setSearch} placeholder="Search by company name" autoCorrect={false} returnKeyType="search" />
        <ViewToggle value={mode} onChange={setMode} />
      </View>
      <Card title={state.editing ? 'Edit company' : 'Add company'} outlined>
        <TextField label="Company Code" value={state.code} onChangeText={state.setCode} maxLength={10} autoCapitalize="characters" error={errors.field('txtCompanyCode')} />
        <TextField label="Company Name" value={state.name} onChangeText={state.setName} error={errors.field('txtCompanyName')} />
        <SelectField label="Business Domain" value={state.domain ?? query.data.domains[0]} options={domains} onChange={state.setDomain} />
        <FormError error={state.save.error} />
        <Button title={state.editing ? 'Update' : 'Insert'} icon="save-outline" loading={state.save.isPending} onPress={() => state.save.mutate()} />
        {state.editing ? <Button title="Cancel" variant="ghost" onPress={state.cancel} /> : null}
      </Card>
    </View>
  );

  return (
    // same as the login screens: the keyboard takes its space from the list, so the list stays scrollable above it
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <FlatList
        // table mode draws its rows in the footer (one sideways-scrolling table); card mode lists one card per company
        data={mode === 'card' ? companies : []}
        keyExtractor={(company) => String(company.id)}
        ListHeaderComponent={form}
        ListEmptyComponent={mode === 'card' ? empty : null}
        ListFooterComponent={mode === 'table' ? <InlineTable rows={chunk.visible} total={chunk.total} columns={columns} keyExtractor={(company) => String(company.id)} empty={empty} /> : null}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={mode === 'table' ? chunk.onScroll : undefined}
        scrollEventThrottle={100}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        renderItem={({ item }) => (
          <RecordCard
            title={item.cname}
            fields={[
              { label: 'Company Code', value: item.company_code },
              { label: 'Business Domain', value: item.type },
            ]}
            actions={actions(item)}
          />
        )}
      />
      <ConfirmDialog
        visible={!!state.toDelete}
        title="Delete company?"
        message={`Delete ${state.toDelete?.cname ?? ''}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={state.remove.isPending}
        onCancel={() => state.setToDelete(null)}
        onConfirm={() => state.toDelete && state.remove.mutate(state.toDelete)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.md },
  toolbar: { gap: spacing.xs },
  rowActions: { flexDirection: 'row', gap: spacing.sm },
});
