import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RecordCard } from '@/components/ui/record-card';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';
import { palette, spacing } from '@/theme/tokens';
import type { ComponentKind } from '../api';
import { useComponentGroups } from '../use-components';

/** Component groups (salary or deduction): a form to add / edit a group above the list of groups. */
export function ComponentGroupsView({ kind }: { kind: ComponentKind }) {
  const state = useComponentGroups(kind);
  const errors = useFormErrors(state.save.error);
  const { query } = state;

  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const form = (
    <Card title={state.editing ? 'Edit group' : 'New group'} outlined>
      <TextField label="Group Id" value={state.groupId} onChangeText={state.setGroupId} error={errors.field('group_id')} maxLength={50} autoCapitalize="none" />
      <TextField label="Group Name" value={state.groupName} onChangeText={state.setGroupName} error={errors.field('group_name')} maxLength={100} />
      <FormError error={errors.general ? state.save.error : null} />
      <Button title={state.editing ? 'Update' : 'Save'} icon="save-outline" loading={state.save.isPending} disabled={!state.groupId.trim() || !state.groupName.trim()} onPress={() => state.save.mutate()} />
      {state.editing ? <Button title="Cancel" variant="ghost" onPress={state.cancel} /> : null}
    </Card>
  );

  return (
    <>
      <FlatList
        data={query.data}
        keyExtractor={(group) => group.group_id}
        ListHeaderComponent={form}
        ListEmptyComponent={<EmptyState title="No groups yet" message="Add the first group above." />}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        renderItem={({ item }) => (
          <RecordCard
            title={`Group: ${item.group_name}`}
            fields={[{ label: 'Group Id', value: item.group_id }]}
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
        title="Delete group?"
        message={`Delete "${state.toDelete?.group_name ?? ''}"? Its component mapping is removed too.`}
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
