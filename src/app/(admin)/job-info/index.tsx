import { Stack } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { JobInfoView } from '@/features/employee/components/job-info-view';
import { useJobInfo } from '@/features/employee/use-job-info';

export default function JobInfoScreen() {
  const job = useJobInfo();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Employee Job Info' }} />
      <QueryBoundary query={job.access}>{() => <JobInfoView job={job} />}</QueryBoundary>
    </Screen>
  );
}
