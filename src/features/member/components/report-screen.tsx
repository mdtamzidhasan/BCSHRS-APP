import { Stack } from "expo-router";

import { QueryBoundary } from "@/components/ui/query-boundary";
import { ReportPdf } from "@/components/ui/report-pdf";
import { Screen } from "@/components/ui/screen";

import { REPORT_PATHS, type ReportKind } from "../api";
import { REPORT_TITLES } from "../reports";
import { useMemberReport } from "../use-member";

/**
 * The report is shown as the PDF Laravel makes (ReportPdf). The card view of the same JSON is still available: render
 * `<ReportData data={data} />` from './report-sections' here instead (the `data` of the QueryBoundary callback).
 *
 * A report viewer: fetches the report for the filters in the route query and renders the returned sections. */
export function MemberReportScreen({ kind }: { kind: ReportKind }) {
  const { query, params } = useMemberReport(kind);

  return (
    <Screen
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
    >
      <Stack.Screen options={{ title: REPORT_TITLES[kind] }} />
      <QueryBoundary query={query}>
        {() => (
          <ReportPdf
            path={REPORT_PATHS[kind]}
            params={params}
            fileName={kind}
          />
        )}
      </QueryBoundary>
    </Screen>
  );
}
