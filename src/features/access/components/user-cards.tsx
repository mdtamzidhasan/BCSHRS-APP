import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/misc';
import { RecordCard } from '@/components/ui/record-card';
import { spacing } from '@/theme/tokens';

import type { ListedUser } from '../api';

export function UserStatusBadges({ approved, online, locked }: { approved?: boolean; online?: boolean; locked?: boolean }) {
  return (
    <View style={styles.badges}>
      <Badge label={approved ? 'Active' : 'Inactive'} tone={approved ? 'success' : 'neutral'} />
      <Badge label={online ? 'Online' : 'Offline'} tone={online ? 'info' : 'neutral'} />
      {locked ? <Badge label="Locked out" tone="danger" /> : null}
    </View>
  );
}

/** A row of the Users by Role / Users by Company grids. */
export function ListedUserCard({ user }: { user: ListedUser }) {
  return (
    <RecordCard
      title={user.UserName}
      fields={[
        { label: 'Email', value: user.Email || '-' },
        { label: 'Created', value: user.CreationDate },
        { label: 'Last login', value: user.LastLoginDate },
        { label: 'Last activity', value: user.LastActivityDate },
        { label: 'Status', value: <UserStatusBadges approved={user.IsApproved} online={user.IsOnline} locked={user.IsLockedOut} /> },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
