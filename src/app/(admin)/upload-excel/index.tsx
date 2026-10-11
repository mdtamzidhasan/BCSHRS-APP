import { Stack, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { UploadExcelView } from '@/features/employee/components/upload-views';
import { useUploadExcel } from '@/features/employee/use-upload-excel';

export default function UploadExcelScreen() {
  const router = useRouter();
  const upload = useUploadExcel();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Upload Excel' }} />
      <UploadExcelView upload={upload} />
      <Button title="Update by Excel column" icon="swap-horizontal-outline" variant="secondary" onPress={() => router.push('/upload-excel/data')} />
    </Screen>
  );
}
