import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SwitchRow } from '@/components/ui/misc';
import { EmptyState } from '@/components/ui/state-views';
import { spacing } from '@/theme/tokens';

import type { Flags } from '../api';
import type { MatrixColumn, MatrixItem } from '../use-matrix';

interface Props {
  items: MatrixItem[];
  columns: MatrixColumn[];
  initial: Record<string, Flags>;
  saving: boolean;
  onSave: (values: Record<string, Flags>) => void;
  saveLabel?: string;
  /** Extra buttons next to Save (e.g. Delete). */
  extra?: React.ReactNode;
  disabled?: boolean;
}

/** The mobile form of a permission matrix: one card per row with a switch for each column, and one Save. Remount (key) to reload. */
export function MatrixForm({ items, columns, initial, saving, onSave, saveLabel = 'Save', extra, disabled }: Props) {
  const [values, setValues] = useState<Record<string, Flags>>(initial);

  if (items.length === 0) {
    return <EmptyState title="Nothing to configure" />;
  }

  const toggle = (id: string, column: string, value: boolean) => setValues((current) => ({ ...current, [id]: { ...current[id], [column]: value } }));

  return (
    <>
      {items.map((item) => (
        <Card key={item.id}>
          <AppText weight="bold">{item.title}</AppText>
          {item.subtitle ? (
            <AppText variant="caption" tone="muted">
              {item.subtitle}
            </AppText>
          ) : null}
          {columns.map((column) => (
            <SwitchRow key={column.key} label={column.label} value={!!values[item.id]?.[column.key]} onChange={(value) => toggle(item.id, column.key, value)} />
          ))}
        </Card>
      ))}
      <View style={styles.actions}>
        <Button title={saveLabel} icon="save-outline" loading={saving} disabled={disabled} onPress={() => onSave(values)} />
        {extra}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
});
