import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { palette, radius, spacing } from '@/theme/tokens';

import type { EmployeeHit } from '../api';
import { useEmployeeSearch } from '../use-admin-home';

interface Props {
  code: string;
  onSelect: (code: string) => void;
}

/** Search an employee by code / name / user name and pick one; the picked code is shown with a Change button. */
export function EmployeePicker({ code, onSelect }: Props) {
  const [term, setTerm] = useState('');
  const [pickedName, setPickedName] = useState('');
  const search = useEmployeeSearch(term);

  if (code) {
    return (
      <View style={styles.picked}>
        <View style={styles.pickedText}>
          <AppText weight="bold">{code}</AppText>
          {pickedName ? <AppText tone="muted">{pickedName}</AppText> : null}
        </View>
        <Button
          title="Change"
          size="sm"
          variant="secondary"
          block={false}
          onPress={() => {
            onSelect('');
            setTerm('');
          }}
        />
      </View>
    );
  }

  const choose = (hit: EmployeeHit) => {
    setPickedName(hit.name);
    onSelect(hit.code);
  };

  return (
    <View>
      <TextField label="Employee Code / Name" value={term} onChangeText={setTerm} placeholder="Type at least 2 characters" autoCapitalize="none" autoCorrect={false} />
      {search.isFetching ? <AppText tone="muted">Searching…</AppText> : null}
      {search.isError ? <AppText tone="danger">Could not search employees.</AppText> : null}
      {search.data?.length === 0 && !search.isFetching ? <AppText tone="muted">No employee found.</AppText> : null}
      <View style={styles.results}>
        {search.data?.map((hit) => (
          <Pressable key={hit.code} onPress={() => choose(hit)} style={styles.hit}>
            <AppText weight="bold">
              {hit.code} - {hit.name}
            </AppText>
            <AppText tone="muted" variant="caption">
              {[hit.designation, hit.department].filter(Boolean).join(' · ')}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  picked: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md, padding: spacing.md, backgroundColor: palette.primarySoft, borderRadius: radius.md },
  pickedText: { flex: 1 },
  results: { gap: spacing.xs },
  hit: { padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border },
});
