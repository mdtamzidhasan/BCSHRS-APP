import { Linking } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/config';

import { usePdfs } from '../use-admin-home';

const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/** "Others Reports": the published PDFs of the picked employee. */
export function EmployeePdfs({ code, enabled }: { code: string; enabled: boolean }) {
  const query = usePdfs(code, enabled);
  const pdfs = query.data?.pdfs ?? [];

  return (
    <Card outlined title="Other reports (PDF)">
      {!code ? <AppText tone="muted">Select a single employee to see the published PDF reports.</AppText> : null}
      {code && query.isPending ? <AppText tone="muted">Loading…</AppText> : null}
      {code && query.isError ? (
        <Button title="Retry" variant="secondary" onPress={() => query.refetch()} />
      ) : null}
      {code && query.isSuccess && pdfs.length === 0 ? <AppText tone="muted">No PDF reports available.</AppText> : null}
      {pdfs.map((pdf) => (
        <Button
          key={`${pdf.pdf_url}-${pdf.description}`}
          title={pdf.edited_date ? `${pdf.description} (${pdf.edited_date})` : pdf.description}
          variant="info"
          icon="document-text-outline"
          onPress={() => Linking.openURL(/^https?:/i.test(pdf.pdf_url) ? pdf.pdf_url : `${origin}/${pdf.pdf_url.replace(/^\//, '')}`)}
        />
      ))}
    </Card>
  );
}
