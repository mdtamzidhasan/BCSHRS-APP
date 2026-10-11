import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { ComponentMappingView } from '@/features/payroll/components/component-mapping-view';

export default function DeductionComponentMappingScreen() {
  return (
    <Screen fixed contentStyle={styles.flush}>
      <Stack.Screen options={{ title: 'Deduction Comp Mapping' }} />
      <ComponentMappingView kind="deduction" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flush: { padding: 0, gap: 0 },
});
