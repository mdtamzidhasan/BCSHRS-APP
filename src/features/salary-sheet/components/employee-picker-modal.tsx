import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ListRow } from '@/components/ui/list-row';
import { ErrorState, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { palette, spacing } from '@/theme/tokens';

import type { EmployeeBrief } from '../api';
import { useEmployeePicker } from '../use-salary-entry';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (employee: EmployeeBrief) => void;
}

/** The web's "Add Employee" modal: search by code / name and pick one. */
export function EmployeePickerModal({ visible, onClose, onPick }: Props) {
  const { search, setSearch, page, setPage, query } = useEmployeePicker(visible);
  const data = query.data;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.top}>
          <AppText variant="subheading">Select Employee</AppText>
          <Button title="Close" variant="ghost" size="sm" block={false} onPress={onClose} />
        </View>
        <TextField label="Search" value={search} onChangeText={setSearch} placeholder="Employee code or name" autoCapitalize="none" autoCorrect={false} />

        {query.isPending ? (
          <LoadingView />
        ) : query.isError && !data ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
            {data && data.employees.length === 0 ? <AppText tone="muted">No employees found.</AppText> : null}
            {data?.employees.map((employee) => (
              <ListRow
                key={employee.code}
                title={`${employee.code} - ${employee.ename}`}
                subtitle={[employee.desig, employee.dept].filter(Boolean).join(' | ')}
                onPress={() => {
                  onPick({ code: employee.code, ename: employee.ename, desig: employee.desig });
                  onClose();
                }}
              />
            ))}
          </ScrollView>
        )}

        {data ? (
          <View style={styles.pager}>
            <Button title="Previous" variant="secondary" size="sm" block={false} disabled={page <= 1} onPress={() => setPage(page - 1)} />
            <AppText tone="muted">
              Page {data.page} of {data.lastPage}
            </AppText>
            <Button title="Next" variant="secondary" size="sm" block={false} disabled={page >= data.lastPage} onPress={() => setPage(page + 1)} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background, padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { flex: 1 },
  listContent: { gap: spacing.sm },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
