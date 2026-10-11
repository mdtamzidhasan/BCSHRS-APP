import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { ListRow } from '@/components/ui/list-row';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/state-views';
import { AppText } from '@/components/ui/app-text';

import { useAdminMenu } from './use-admin-menu';

/** A tab that lists the pages of one menu group (e.g. "Salary Sheet"); the group's pages come from the server menu. */
export function GroupHub({ group, title }: { group: string; title: string }) {
  const menu = useAdminMenu();
  const router = useRouter();

  if (menu.isPending) {
    return <LoadingView />;
  }

  if (menu.isError) {
    return <ErrorState error={menu.error} onRetry={() => menu.refetch()} />;
  }

  const found = menu.data.find((item) => item.name.toLowerCase() === group);

  return (
    <Screen onRefresh={() => menu.refetch()} refreshing={menu.isRefetching}>
      <AppText variant="heading">{title}</AppText>
      {found ? (
        found.features.map((feature) => <ListRow key={feature.key} title={feature.title} icon={feature.icon} onPress={() => router.push(feature.href)} />)
      ) : (
        <EmptyState title="No access" message={`Your role has no pages in ${title}.`} icon="lock-closed-outline" />
      )}
    </Screen>
  );
}
