import { Stack } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { PfUploadForm } from '@/features/payroll/components/pf-upload-form';

export default function PfBalanceUploadScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'PF Balance Upload' }} />
      <PfUploadForm kind="balance" />
    </Screen>
  );
}
