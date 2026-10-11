import { Stack } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { SalaryApprovalView } from '@/features/payroll/components/salary-approval-view';

export default function SalaryApprovalReviewerScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Salary Reviewer' }} />
      <SalaryApprovalView page="reviewer" />
    </Screen>
  );
}
