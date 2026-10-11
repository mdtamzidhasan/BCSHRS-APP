import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { ComponentSortingView } from '@/features/payroll/components/component-sorting-view';

export default function DeductionComponentSortingScreen() {
  return (
    <Screen fixed contentStyle={styles.flush}>
      <Stack.Screen options={{ title: 'Deduction Comp Sorting' }} />
      <ComponentSortingView kind="deduction" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flush: { padding: 0, gap: 0 },
});
