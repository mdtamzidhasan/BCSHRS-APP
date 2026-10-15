import { useMutation } from '@tanstack/react-query';

import { downloadAndShare } from '@/lib/files';

import { Button } from './button';
import { toast } from './toast';

interface Props {
  /** The report endpoint, e.g. `/member/reports/payslip`. */
  path: string;
  /** The report's filters (income_year, month, employee_code ...). */
  params: { [key: string]: string | undefined } | object;
  /** Base of the saved file name, e.g. `payslip`. */
  fileName: string;
}

/** "Save as PDF": the report API with `format=pdf` (the same report as the web page, made by Laravel), then the share sheet. */
export function PdfButton({ path, params, fileName }: Props) {
  const download = useMutation({
    mutationFn: () => {
      const query = new URLSearchParams(Object.entries({ ...(params as Record<string, string | undefined>), format: 'pdf' }).filter((entry): entry is [string, string] => Boolean(entry[1])));
      const known = params as Record<string, string | undefined>;
      const stamp = [known.income_year, known.pf_year, known.month, known.employee_code].filter(Boolean).join('-');

      return downloadAndShare(`${path}?${query.toString()}`, `${fileName}${stamp ? `-${stamp}` : ''}.pdf`, 'application/pdf');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'The PDF could not be downloaded.'),
  });

  return <Button title="Save as PDF" icon="document-text-outline" variant="info" loading={download.isPending} onPress={() => download.mutate()} />;
}
