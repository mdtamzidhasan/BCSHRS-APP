import { Tabs } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { tabBarScreenOptions, tabOptions } from '@/components/layout/tab-options';

/** Bottom tabs of the admin app: Home, Access Report, Salary Sheet, Employee Mgmt, More. */
export default function AdminTabs() {
  return (
    <Tabs screenOptions={{ header: () => <AppHeader suffix="Admin" />, ...tabBarScreenOptions }}>
      <Tabs.Screen name="index" options={tabOptions('Home', 'home-outline', 'home')} />
      <Tabs.Screen name="access-report" options={tabOptions('Access Report', 'document-text-outline', 'document-text')} />
      <Tabs.Screen name="salary-sheet" options={tabOptions('Salary Sheet', 'folder-outline', 'folder')} />
      <Tabs.Screen name="employee-mgmt" options={tabOptions('Employee Mgmt', 'people-outline', 'people')} />
      <Tabs.Screen name="more" options={tabOptions('More', 'ellipsis-horizontal-circle-outline', 'ellipsis-horizontal-circle')} />
    </Tabs>
  );
}
