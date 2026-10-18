import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { RecordCard } from '@/components/ui/record-card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useEmployeeList } from '@/features/employee/use-employees';
import { palette, spacing } from '@/theme/tokens';

export default function EmployeeBasicInfoScreen() {
  const router = useRouter();
  const { query, employees, search, setSearch, loadMore } = useEmployeeList();

  const header = (
    <View style={styles.header}>
      <Button title="Add Employee" icon="person-add-outline" onPress={() => router.push('/employee-basic-info/new')} />
      <TextField label="Search" placeholder="Employee code or name" value={search} onChangeText={setSearch} autoCapitalize="none" returnKeyType="search" />
    </View>
  );

  let body: React.ReactNode;

  if (query.isPending) {
    body = <LoadingView />;
  } else if (query.isError && !query.data) {
    body = <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  } else {
    body = (
      <FlatList
        data={employees}
        keyExtractor={(employee) => String(employee.code)}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState title="No employees" message={search.trim() ? 'No employee matches your search.' : undefined} />}
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={palette.primary} style={styles.footer} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        renderItem={({ item }) => (
          <RecordCard
            title={`${item.code} - ${item.ename ?? ''}`}
            fields={[
              { label: 'Designation', value: String(item.desig ?? '-') },
              { label: 'Department', value: String(item.dept ?? '-') },
              { label: 'Email', value: String(item.email ?? '-') },
            ]}
            actions={<Button title="Edit" size="sm" variant="info" block={false} icon="create-outline" onPress={() => router.push(`/employee-basic-info/${encodeURIComponent(String(item.code))}`)} />}
            footerFacts={[{ label: 'Status', value: String(item.job_status ?? '-') }]}
          />
        )}
      />
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Employee Basic Info' }} />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.sm },
  footer: { padding: spacing.lg },
});
