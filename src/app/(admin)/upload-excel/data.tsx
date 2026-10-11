import { Stack } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { UploadExcelDataView } from '@/features/employee/components/upload-views';
import { useUploadExcelData } from '@/features/employee/use-upload-excel';

export default function UploadExcelDataScreen() {
  const data = useUploadExcelData();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Excel Data Upload' }} />
      <UploadExcelDataView data={data} />
    </Screen>
  );
}
