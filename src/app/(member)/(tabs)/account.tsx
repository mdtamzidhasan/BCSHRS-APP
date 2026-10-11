import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { BiometricSetting } from '@/features/settings/biometric-setting';
import { useAuth } from '@/hooks/use-auth';
import { spacing } from '@/theme/tokens';

/** Member Account: change password / user name, add mobile, privacy lock and log out. */
export default function MemberAccount() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const go = (path: string) => () => router.push(path as never);

  return (
    <Screen>
      <AppText variant="heading">{user?.username}</AppText>

      <View style={styles.list}>
        <ListRow icon="key-outline" title="Change Password" onPress={go('/member/change-password')} />
        <ListRow icon="person-outline" title="Change User Name" onPress={go('/member/change-username')} />
        <ListRow icon="call-outline" title="Add Mobile Number" onPress={go('/member/add-mobile')} />
      </View>

      <BiometricSetting />

      <ListRow icon="log-out-outline" title="Log out" destructive onPress={() => setConfirming(true)} />

      <ConfirmDialog
        visible={confirming}
        title="Log out"
        message="Do you want to log out of BCSHRS?"
        confirmLabel="Log out"
        destructive
        loading={loggingOut}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setLoggingOut(true);
          void logout().finally(() => {
            setLoggingOut(false);
            setConfirming(false);
          });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});
