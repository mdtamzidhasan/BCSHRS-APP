import { Stack } from 'expo-router';

import { Button } from '@/components/ui/button';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { RecordCard } from '@/components/ui/record-card';
import { Screen } from '@/components/ui/screen';
import { EmptyState } from '@/components/ui/state-views';
import { openPdf, useMemberPdfs } from '@/features/member/use-member';

/** Others Reports: the PDFs published for this employee. */
export default function MemberPdfsScreen() {
  const query = useMemberPdfs();

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <Stack.Screen options={{ title: 'Others Reports' }} />
      <QueryBoundary query={query}>
        {(pdfs) =>
          pdfs.length === 0 ? (
            <EmptyState title="Data not available" />
          ) : (
            pdfs.map((pdf, index) => (
              <RecordCard
                key={`${pdf.pdf_url}-${index}`}
                title={pdf.description}
                fields={[{ label: 'Created Date', value: pdf.edited_date ?? '-' }]}
                actions={<Button title="Open" icon="document-outline" size="sm" variant="info" block={false} onPress={() => openPdf(pdf.pdf_url)} />}
              />
            ))
          )
        }
      </QueryBoundary>
    </Screen>
  );
}
