import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { CompaniesView } from '@/features/payroll/components/companies-view';

export default function CompaniesScreen() {
  return (
    <Screen fixed contentStyle={styles.flush}>
      <Stack.Screen options={{ title: 'Add Companies' }} />
      <CompaniesView />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flush: { padding: 0, gap: 0 },
});
