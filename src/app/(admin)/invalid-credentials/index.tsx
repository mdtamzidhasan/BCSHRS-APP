import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/misc';
import { RecordCard } from '@/components/ui/record-card';
import { TextField } from '@/components/ui/text-field';
import { PagedList } from '@/features/access/components/paged-list';
import { useInvalidCredentials } from '@/features/access/use-audit';
import { spacing } from '@/theme/tokens';

export default function InvalidCredentialsScreen() {
  const report = useInvalidCredentials();
  const { draft } = report;

  return (
    <>
      <Stack.Screen options={{ title: 'Invalid Credentials Report' }} />
      <PagedList
        query={report.query}
        items={report.items}
        keyExtractor={(row, index) => `${row.user}-${row.date}-${index}`}
        emptyTitle="No invalid logins"
        header={
          <Card>
            <TextField label="User" value={draft.user} onChangeText={(value) => report.setField('user', value)} autoCapitalize="none" returnKeyType="search" onSubmitEditing={report.search} />
            <TextField label="Date from (dd/mm/yyyy)" value={draft.date_from} onChangeText={(value) => report.setField('date_from', value)} placeholder="01/07/2024" keyboardType="numbers-and-punctuation" />
            <TextField label="Date to (dd/mm/yyyy)" value={draft.date_to} onChangeText={(value) => report.setField('date_to', value)} placeholder="31/07/2024" keyboardType="numbers-and-punctuation" />
            {report.searchErrors.map((message) => (
              <AppText key={message} tone="danger" variant="caption">
                {message}
              </AppText>
            ))}
            <View style={styles.actions}>
              <Button title="Search" icon="search-outline" block={false} onPress={report.search} style={styles.action} />
              <Button title="Reset" variant="secondary" block={false} onPress={report.reset} style={styles.action} />
            </View>
            {report.total !== null ? (
              <AppText variant="caption" tone="muted">
                {report.total} record(s)
              </AppText>
            ) : null}
          </Card>
        }
        renderItem={({ item }) => (
          <RecordCard
            title={item.user}
            subtitle={item.date}
            fields={[
              { label: 'IP address', value: item.ip || '-' },
              { label: 'Status', value: <Status approved={item.is_approved} locked={item.is_locked_out} /> },
            ]}
          />
        )}
      />
    </>
  );
}

function Status({ approved, locked }: { approved: boolean; locked: boolean }) {
  return (
    <View style={styles.badges}>
      <Badge label={approved ? 'Approved' : 'Not approved'} tone={approved ? 'success' : 'neutral'} />
      {locked ? <Badge label="Locked out" tone="danger" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  action: { flex: 1 },
  badges: { flexDirection: 'row', gap: spacing.xs },
});
