import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RecordCard } from '@/components/ui/record-card';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';
import { palette, spacing } from '@/theme/tokens';
import { useCompanies } from '../use-companies';

/** Companies: add / edit form above the list of companies (edit and delete per card). */
export function CompaniesView() {
  const state = useCompanies();
  const errors = useFormErrors(state.save.error);
  const { query } = state;

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  // a company's own domain stays selectable even when it is not one of the standard ones
  const domains = [...new Set([...query.data.domains, ...(state.domain ? [state.domain] : [])])].map((domain) => ({ label: domain, value: domain }));

  const form = (
    <Card title={state.editing ? 'Edit company' : 'Add company'} outlined>
      <TextField label="Company Code" value={state.code} onChangeText={state.setCode} maxLength={10} autoCapitalize="characters" error={errors.field('txtCompanyCode')} />
      <TextField label="Company Name" value={state.name} onChangeText={state.setName} error={errors.field('txtCompanyName')} />
      <SelectField label="Business Domain" value={state.domain ?? query.data.domains[0]} options={domains} onChange={state.setDomain} />
      <FormError error={state.save.error} />
      <Button title={state.editing ? 'Update' : 'Insert'} icon="save-outline" loading={state.save.isPending} onPress={() => state.save.mutate()} />
      {state.editing ? <Button title="Cancel" variant="ghost" onPress={state.cancel} /> : null}
    </Card>
  );

  return (
    <>
      <FlatList
        data={query.data.companies}
        keyExtractor={(company) => String(company.id)}
        ListHeaderComponent={form}
        ListEmptyComponent={<EmptyState title="No companies" />}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        renderItem={({ item }) => (
          <RecordCard
            title={item.cname}
            fields={[
              { label: 'Company Code', value: item.company_code },
              { label: 'Business Domain', value: item.type },
            ]}
            actions={
              <>
                <Button title="Edit" size="sm" variant="info" block={false} onPress={() => state.edit(item)} />
                <Button title="Delete" size="sm" variant="danger" block={false} onPress={() => state.setToDelete(item)} />
              </>
            }
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
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
});
