import { useLocalSearchParams } from 'expo-router';

import { EditEmployeeScreen } from '@/features/employee/components/employee-form-screen';

export default function EditEmployeeRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return <EditEmployeeScreen code={String(code)} />;
}
