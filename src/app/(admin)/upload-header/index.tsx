import { Stack } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { UploadHeaderView } from '@/features/payroll/components/upload-header-view';

export default function UploadHeaderScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Upload Header' }} />
      <UploadHeaderView />
    </Screen>
  );
}
