import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { ComponentSortingView } from '@/features/payroll/components/component-sorting-view';

export default function SalaryComponentSortingScreen() {
  return (
    <Screen fixed contentStyle={styles.flush}>
      <Stack.Screen options={{ title: 'Sal Comp Sorting' }} />
      <ComponentSortingView kind="salary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flush: { padding: 0, gap: 0 },
});
