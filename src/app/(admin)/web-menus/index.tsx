import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeader } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { RecordCard } from '@/components/ui/record-card';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useWebMenus } from '@/features/access/use-catalogue';

export default function WebMenusScreen() {
  const screen = useWebMenus();
  const { form, setForm, save, remove } = screen;
  const [toDelete, setToDelete] = useState<number | null>(null);
  const errors = useFormErrors(save.error);

  return (
    <Screen refreshing={screen.query.isRefetching} onRefresh={() => screen.query.refetch()}>
      <Stack.Screen options={{ title: 'Web Menu' }} />
      <QueryBoundary query={screen.query}>
        {(menus) => (
          <>
            <Card title={form.id ? 'Edit menu' : 'Add menu'}>
              <TextField label="Menu Name" value={form.name} onChangeText={(name) => setForm({ ...form, name })} error={errors.field('menuName')} />
              <TextField label="Menu Location" value={form.location} onChangeText={(location) => setForm({ ...form, location })} autoCapitalize="none" error={errors.field('menuLocation')} />
              <SelectField
                label="Parent"
                value={form.parent}
                options={[{ label: 'None (top level)', value: 0 }, ...menus.filter((menu) => menu.Id !== form.id).map((menu) => ({ label: menu.MenuName, value: menu.Id }))]}
                onChange={(parent) => setForm({ ...form, parent })}
                error={errors.field('parentId')}
              />
              <FormError error={errors.general ? save.error : null} />
              <Button title={form.id ? 'Save' : 'Create'} icon="save-outline" loading={save.isPending} disabled={!form.name.trim()} onPress={() => save.mutate()} />
              {form.id ? <Button title="Cancel edit" variant="ghost" onPress={screen.reset} /> : null}
            </Card>
            <SectionHeader title="Menus" />
            {menus.map((menu) => (
              <RecordCard
                key={menu.Id}
                title={menu.MenuName}
                fields={[
                  { label: 'Location', value: menu.MenuLocation || '-' },
                  { label: 'Parent', value: menu.ParentId ? (menus.find((parent) => parent.Id === menu.ParentId)?.MenuName ?? String(menu.ParentId)) : '-' },
                ]}
                actions={
                  <>
                    <Button title="Edit" variant="info" size="sm" block={false} onPress={() => screen.edit(menu)} />
                    <Button title="Delete" variant="danger" size="sm" block={false} onPress={() => setToDelete(menu.Id)} />
                  </>
                }
              />
            ))}
          </>
        )}
      </QueryBoundary>
      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete menu"
        message="Delete this menu from the catalogue?"
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete !== null && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })}
      />
    </Screen>
  );
}
