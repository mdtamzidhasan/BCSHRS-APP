import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeader } from '@/components/ui/misc';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { palette, spacing } from '@/theme/tokens';

import type { LookupKind } from '../api';
import { LOOKUP_LABELS, type LookupMasterApi } from '../use-lookup-master';

interface ItemRow {
  name: string;
  description?: string;
}

function LookupCard({ title, kind, items, lookup, disabled, note }: { title: string; kind: LookupKind; items: ItemRow[]; lookup: LookupMasterApi; disabled?: boolean; note?: string }) {
  return (
    <Card outlined>
      <SectionHeader title={title} action={<Button title="Add" size="sm" icon="add" block={false} disabled={disabled} onPress={() => lookup.openEditor(kind)} />} />
      {note ? <AppText tone="muted" style={styles.gap}>{note}</AppText> : null}
      {items.length === 0 && !note ? <AppText tone="muted" style={styles.gap}>Nothing added yet.</AppText> : null}
      {items.map((item) => (
        <View key={item.name} style={styles.item}>
          <View style={styles.itemText}>
            <AppText weight="medium">{item.name}</AppText>
            {item.description ? <AppText tone="muted" variant="caption">{item.description}</AppText> : null}
          </View>
          <Button title="Edit" size="sm" variant="secondary" block={false} onPress={() => lookup.openEditor(kind, item.name, item.description ?? '')} />
          <Button title="Delete" size="sm" variant="danger" block={false} onPress={() => lookup.askRemove(kind, item.name)} />
        </View>
      ))}
    </Card>
  );
}

export function LookupMasterView({ lookup, data }: { lookup: LookupMasterApi; data: NonNullable<LookupMasterApi['query']['data']> }) {
  const { editor } = lookup;
  const hasDescription = editor?.kind === 'banks' || editor?.kind === 'branches';

  return (
    <View style={styles.stack}>
      <LookupCard title="Salary Circle" kind="salary-circles" items={data.salaryCircles.map((name) => ({ name }))} lookup={lookup} />
      <LookupCard title="Tax Zone" kind="tax-zones" items={data.taxZones.map((name) => ({ name }))} lookup={lookup} />
      <LookupCard title="Bank" kind="banks" items={data.banks.map((row) => ({ name: row.BankName, description: row.Description }))} lookup={lookup} />

      <Card outlined>
        <SectionHeader title="Branch" />
        <View style={styles.gap}>
          <SelectField label="Bank" value={lookup.bank || null} options={data.banks.map((row) => ({ label: row.BankName, value: row.BankName }))} onChange={lookup.setBank} placeholder="Select a bank to manage its branches" />
        </View>
      </Card>
      {lookup.bank ? (
        <LookupCard title={`Branches of ${lookup.bank}`} kind="branches" items={data.branches.map((row) => ({ name: row.BranchName, description: row.Description }))} lookup={lookup} />
      ) : null}

      <Modal visible={!!editor} transparent animationType="fade" onRequestClose={lookup.closeEditor}>
        <Pressable style={styles.backdrop} onPress={lookup.closeEditor} />
        {editor ? (
          <View style={styles.dialogWrap} pointerEvents="box-none">
            <View style={styles.dialog}>
              <AppText variant="subheading" style={styles.dialogTitle}>
                {editor.original ? 'Edit' : 'Add'} {LOOKUP_LABELS[editor.kind]}
              </AppText>
              <TextField label="Name" value={editor.name} onChangeText={(name) => lookup.editEditor({ name })} />
              {hasDescription ? <TextField label="Description" value={editor.description} onChangeText={(description) => lookup.editEditor({ description })} /> : null}
              <FormError error={lookup.save.error} />
              <View style={styles.actions}>
                <Button title="Cancel" variant="secondary" block={false} onPress={lookup.closeEditor} />
                <Button title="Save" block={false} loading={lookup.save.isPending} disabled={!editor.name.trim()} onPress={lookup.submit} />
              </View>
            </View>
          </View>
        ) : null}
      </Modal>

      <ConfirmDialog
        visible={!!lookup.removal}
        title={`Delete ${lookup.removal ? LOOKUP_LABELS[lookup.removal.kind] : ''}`}
        message={lookup.removal ? `Delete "${lookup.removal.name}"? A value that is still in use cannot be deleted.` : undefined}
        confirmLabel="Delete"
        destructive
        loading={lookup.removing}
        onConfirm={lookup.confirmRemove}
        onCancel={lookup.cancelRemove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  gap: { marginTop: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  itemText: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: palette.overlay },
  dialogWrap: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  dialog: { backgroundColor: palette.surface, borderRadius: 16, padding: spacing.xl },
  dialogTitle: { marginBottom: spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
