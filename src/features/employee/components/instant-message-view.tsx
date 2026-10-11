import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/misc';
import { RadioGroup } from '@/components/ui/radio-group';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { palette, radius, spacing } from '@/theme/tokens';

import type { Audience, InstantMessageApi } from '../use-instant-message';

const AUDIENCES: { label: string; value: Audience }[] = [
  { label: 'All Employee', value: 2 },
  { label: 'Department', value: 3 },
  { label: 'Costcenter', value: 4 },
];

const MAX_SHOWN = 100;

export function InstantMessageView({ im, filters }: { im: InstantMessageApi; filters: NonNullable<InstantMessageApi['filters']['data']> }) {
  const shown = im.visible.slice(0, MAX_SHOWN);

  return (
    <View style={styles.stack}>
      <Card outlined>
        <SectionHeader title="Select Employee" />
        <View style={styles.gap}>
          <RadioGroup value={im.audience} options={AUDIENCES} onChange={im.setAudience} />
          {im.audience === 3 ? <SelectField label="Dept" value={im.department || null} options={filters.departments.map((name) => ({ label: name, value: name }))} onChange={im.setDepartment} /> : null}
          {im.audience === 4 ? <SelectField label="Costcenter" value={im.costCenter || null} options={filters.costCenters.map((row) => ({ label: row.text, value: row.value }))} onChange={im.setCostCenter} /> : null}
          <FormError error={im.load.error} />
          <Button title="Add Employee" icon="people-outline" variant="info" loading={im.load.isPending} onPress={im.loadEmployees} />
        </View>
      </Card>

      {im.employees.length > 0 ? (
        <Card outlined>
          <SectionHeader title={`Employees (${im.selected.size} of ${im.employees.length} selected)`} />
          <View style={styles.gap}>
            <TextField placeholder="Search code / name / designation / mobile" value={im.search} onChangeText={im.setSearch} autoCapitalize="none" />
            <Button title={im.allSelected ? 'Clear Selection' : 'Select All'} size="sm" variant="secondary" block={false} onPress={im.toggleAll} />
            {shown.map((row) => {
              const on = im.selected.has(row.code);

              return (
                <Pressable key={row.code} onPress={() => im.toggle(row.code)} style={[styles.row, on && styles.rowOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                  <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? palette.primary : palette.textMuted} />
                  <View style={styles.rowText}>
                    <AppText weight="medium">
                      {row.code} - {row.ename}
                    </AppText>
                    <AppText tone="muted" variant="caption">
                      {row.desig} | {row.dept}
                    </AppText>
                    <AppText tone={row.mobile ? 'default' : 'danger'} variant="caption">
                      {row.mobile || 'No mobile number'}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
            {im.visible.length > MAX_SHOWN ? <AppText tone="muted" variant="caption">Showing the first {MAX_SHOWN} of {im.visible.length}. Use search to narrow the list.</AppText> : null}
          </View>
        </Card>
      ) : null}

      <Card outlined>
        <SectionHeader title="Message" />
        <View style={styles.gap}>
          <TextField label="Message" multiline value={im.text} onChangeText={im.setText} placeholder="Each employee receives: Hello {name}, then your text." />
          <FormError error={im.send.error} />
          <Button title="Send" icon="send-outline" disabled={!im.canSend} loading={im.send.isPending} onPress={im.submit} />
          <AppText tone="muted" variant="caption">Messages go by SMS only to employees with a valid mobile number. Sending many messages can take a while.</AppText>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  gap: { marginTop: spacing.md, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border },
  rowOn: { borderColor: palette.primaryBorder, backgroundColor: palette.primarySoft },
  rowText: { flex: 1 },
});
