import type { ResponseNode } from "@/types/openapi";
import { SchemaView } from "./SchemaView";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";

export interface ResponsePanelProps {
  responses: Record<string, ResponseNode>;
}

/** Maps an HTTP status code string to a semantic badge tone. */
function toneForStatus(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status.startsWith("2")) return "success";
  if (status.startsWith("4") || status.startsWith("5")) return "danger";
  if (status === "default") return "neutral";
  return "warning";
}

/**
 * Renders every status-code response for an operation as a tabbed
 * panel, showing the response description and, when present, its
 * schema per content type.
 */
export function ResponsePanel({ responses }: ResponsePanelProps) {
  const entries = Object.entries(responses);
  if (entries.length === 0) {
    return <p className="text-xs text-ink-muted">No responses documented.</p>;
  }

  const tabs: TabItem[] = entries.map(([status, response]) => ({
    id: status,
    label: status,
    content: (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge tone={toneForStatus(status)}>{status}</Badge>
          <span className="text-xs text-ink-muted">
            {response.description}
          </span>
        </div>
        <ResponseBody response={response} />
      </div>
    ),
  }));

  return <Tabs items={tabs} />;
}

function ResponseBody({ response }: { response: ResponseNode }) {
  const contentEntries = Object.entries(response.content ?? {});
  if (contentEntries.length === 0) {
    return <p className="text-xs text-ink-muted">No response body.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {contentEntries.map(([mediaType, media]) => (
        <div key={mediaType}>
          <div className="pb-1 font-mono text-xs text-ink-faint">
            {mediaType}
          </div>
          {media.schema && <SchemaView schema={media.schema} />}
        </div>
      ))}
    </div>
  );
}
