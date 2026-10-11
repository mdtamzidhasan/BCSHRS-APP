import { Stack, useRouter } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';

import type { EmployeeRecord } from '../api';
import { useEmployeeForm, useEmployeeRecord } from '../use-employee-form';
import { EmployeeForm } from './employee-form';

function FormBody({ initial }: { initial?: EmployeeRecord }) {
  const router = useRouter();
  const form = useEmployeeForm(initial, () => router.back());

  return (
    <Screen>
      <EmployeeForm form={form} />
    </Screen>
  );
}

/** Add Employee: the empty form. */
export function NewEmployeeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Add Employee' }} />
      <FormBody />
    </>
  );
}

/** Edit Employee: loads the record, then shows the filled form. */
export function EditEmployeeScreen({ code }: { code: string }) {
  const query = useEmployeeRecord(code);

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Employee' }} />
      <QueryBoundary query={query}>{(employee) => <FormBody initial={employee} />}</QueryBoundary>
    </>
  );
}
