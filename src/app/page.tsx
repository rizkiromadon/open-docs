import { DocsShell } from "@/components/layout/DocsShell";
import { IntroductionPage } from "@/components/openapi/IntroductionPage";
import { loadActiveDocument } from "@/lib/openapi/load-document";

/**
 * Root documentation page: loads the active spec and renders the
 * introduction view inside the shared shell.
 */
export default async function HomePage() {
  const document = await loadActiveDocument();

  return (
    <DocsShell document={document}>
      <IntroductionPage document={document} />
    </DocsShell>
  );
}
