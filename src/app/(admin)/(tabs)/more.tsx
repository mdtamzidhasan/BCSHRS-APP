import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/misc';
import { ErrorState, LoadingView } from '@/components/ui/state-views';
import { TAB_GROUPS } from '@/features/admin/registry';
import { useAdminMenu } from '@/features/admin/use-admin-menu';
import { BiometricSetting } from '@/features/settings/biometric-setting';
import { useAuth } from '@/hooks/use-auth';

/** More: the menu groups that are not a tab (Role Mgmt, User Control, Component Mgmt, Others …), settings and log out. */
export default function MoreTab() {
  const menu = useAdminMenu();
  const router = useRouter();
  const { logout, user } = useAuth();

  if (menu.isPending) {
    return <LoadingView />;
  }

  if (menu.isError) {
    return <ErrorState error={menu.error} onRetry={() => menu.refetch()} />;
  }

  const groups = menu.data.filter((group) => !(TAB_GROUPS as readonly string[]).includes(group.name.toLowerCase()));

  return (
    <Screen onRefresh={() => menu.refetch()} refreshing={menu.isRefetching}>
      <AppText variant="heading">More</AppText>

      {groups.map((group) => (
        <View key={group.name} style={styles.group}>
          <SectionHeader title={group.name} />
          {group.features.map((feature) => (
            <ListRow key={feature.key} title={feature.title} icon={feature.icon} onPress={() => router.push(feature.href)} />
          ))}
        </View>
      ))}

      <SectionHeader title="Account" />
      <ListRow title="Change Password" icon="key-outline" onPress={() => router.push('/change-password')} />
      <BiometricSetting />
      <ListRow title={`Log out (${user?.username ?? ''})`} icon="log-out-outline" destructive onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
});
