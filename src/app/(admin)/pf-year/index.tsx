import { Stack } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { PfYearView } from '@/features/payroll/components/pf-year-view';

export default function PfYearScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'PF Year' }} />
      <PfYearView />
    </Screen>
  );
}
