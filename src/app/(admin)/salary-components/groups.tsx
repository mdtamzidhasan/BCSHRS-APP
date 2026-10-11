import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { ComponentGroupsView } from '@/features/payroll/components/component-groups-view';

export default function SalaryComponentGroupsScreen() {
  return (
    <Screen fixed contentStyle={styles.flush}>
      <Stack.Screen options={{ title: 'Sal Comp Group' }} />
      <ComponentGroupsView kind="salary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flush: { padding: 0, gap: 0 },
});
