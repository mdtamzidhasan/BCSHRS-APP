import { Stack } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { PfUploadForm } from '@/features/payroll/components/pf-upload-form';

export default function PfProfitAllocationScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Profit Upload' }} />
      <PfUploadForm kind="profit" />
    </Screen>
  );
}
