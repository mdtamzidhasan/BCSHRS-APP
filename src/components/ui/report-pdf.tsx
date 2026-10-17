import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { downloadToCache, shareFile } from "@/lib/files";
import { API_BASE_URL } from "@/lib/config";
import { palette, radius, spacing } from "@/theme/tokens";

import { Button } from "./button";
import { ErrorState } from "./state-views";
import { toast } from "./toast";

interface Props {
  /** The report endpoint, e.g. `/member/reports/payslip`. */
  path: string;
  /** The report's filters (income_year, month, employee_code ...). */
  params: object;
  /** Base of the saved file name, e.g. `payslip`. */
  fileName: string;
}

/** The server's address without `/api/v1` (where Laravel serves public/vendor/pdfjs from). */
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

/**
 * The page WebView shows: pdf.js (hosted by Laravel in public/vendor/pdfjs) draws the PDF bytes it is given, page by page.
 * The app makes no PDF itself — these are the bytes Laravel's report API returned.
 */
function viewerHtml(base64: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
<style>html,body{margin:0;background:#8a8a8a}#pages{display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px 0}canvas{width:100%;height:auto;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4)}</style>
<script src="${SERVER_ORIGIN}/vendor/pdfjs/pdf.min.js"></script></head><body><div id="pages"></div><script>
pdfjsLib.GlobalWorkerOptions.workerSrc='${SERVER_ORIGIN}/vendor/pdfjs/pdf.worker.min.js';
var raw=atob('${base64}'),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
pdfjsLib.getDocument({data:bytes}).promise.then(async function(pdf){
 for(var n=1;n<=pdf.numPages;n++){var page=await pdf.getPage(n),vp=page.getViewport({scale:2}),c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;document.getElementById('pages').appendChild(c);await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;}
}).catch(function(e){document.body.innerHTML='<p style="color:#fff;padding:16px">The PDF could not be shown: '+e.message+'</p>';});
</script></body></html>`;
}

/**
 * The report as the PDF Laravel makes (the same bytes "Save as PDF" shares): downloaded once into the app cache, shown page by
 * page, and the button below shares that very file.
 */
export function ReportPdf({ path, params, fileName }: Props) {
  const filters = params as Record<string, string | undefined>;
  const query = new URLSearchParams(
    Object.entries({ ...filters, format: "pdf" }).filter(
      (entry): entry is [string, string] => Boolean(entry[1]),
    ),
  );
  const stamp = [
    filters.income_year,
    filters.pf_year,
    filters.month,
    filters.employee_code,
  ]
    .filter(Boolean)
    .join("-");
  const name = `${fileName}${stamp ? `-${stamp}` : ""}.pdf`;

  const pdf = useQuery({
    queryKey: ["report-pdf", path, query.toString()],
    queryFn: async () => {
      const file = await downloadToCache(`${path}?${query.toString()}`, name);

      return { file, base64: await file.base64() };
    },
    gcTime: 0,
    staleTime: 0,
  });

  if (pdf.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (pdf.isError) {
    return <ErrorState error={pdf.error} onRetry={() => void pdf.refetch()} />;
  }

  const save = async () => {
    try {
      await shareFile(pdf.data.file, "application/pdf");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The PDF could not be saved.",
      );
    }
  };

  return (
    <>
      <View style={styles.frame}>
        <WebView
          source={{ html: viewerHtml(pdf.data.base64), baseUrl: SERVER_ORIGIN }}
          originWhitelist={["*"]}
          javaScriptEnabled
          scalesPageToFit
          nestedScrollEnabled
          style={styles.web}
        />
      </View>
      <Button
        title="Save as PDF"
        icon="document-text-outline"
        variant="info"
        onPress={() => void save()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { height: 220, alignItems: "center", justifyContent: "center" },
  frame: {
    height: 560,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#8a8a8a",
    marginBottom: spacing.md,
  },
  web: { flex: 1, backgroundColor: "#8a8a8a" },
});
