import { Stack, useRouter } from 'expo-router';

import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';

export default function SalaryApprovalScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Salary Approval' }} />
      <ListRow title="Salary Creator" subtitle="Request a review of the payroll" icon="create-outline" onPress={() => router.push('/salary-approval/creator')} />
      <ListRow title="Salary Reviewer" subtitle="Approve to the approver or reject" icon="eye-outline" onPress={() => router.push('/salary-approval/reviewer')} />
      <ListRow title="Salary Approver" subtitle="Final approval of the payroll" icon="checkmark-done-outline" onPress={() => router.push('/salary-approval/approver')} />
    </Screen>
  );
}
