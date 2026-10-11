import { Tabs } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { tabBarScreenOptions, tabOptions } from '@/components/layout/tab-options';

/** Bottom tabs of the member app: Home (reports), Account, Contact HR. */
export default function MemberTabs() {
  return (
    <Tabs screenOptions={{ header: () => <AppHeader />, ...tabBarScreenOptions }}>
      <Tabs.Screen name="index" options={tabOptions('Home', 'home-outline', 'home')} />
      <Tabs.Screen name="account" options={tabOptions('Account', 'person-outline', 'person')} />
      <Tabs.Screen name="contact" options={tabOptions('Contact HR', 'mail-outline', 'mail')} />
    </Tabs>
  );
}
