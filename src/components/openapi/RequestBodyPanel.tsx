import type { RequestBodyNode } from "@/types/openapi";
import { SchemaView } from "./SchemaView";
import { Badge } from "@/components/ui/Badge";

export interface RequestBodyPanelProps {
  requestBody: RequestBodyNode;
}

/**
 * Renders an operation's request body: its content-type schemas plus
 * whether the body itself is required.
 */
export function RequestBodyPanel({ requestBody }: RequestBodyPanelProps) {
  const contentEntries = Object.entries(requestBody.content);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {requestBody.required && <Badge tone="warning">required</Badge>}
        {requestBody.description && (
          <p className="text-xs text-ink-muted">{requestBody.description}</p>
        )}
      </div>
      {contentEntries.length === 0 ? (
        <p className="text-xs text-ink-muted">
          No content schema documented for this request body.
        </p>
      ) : (
        contentEntries.map(([mediaType, media]) => (
          <div key={mediaType}>
            <div className="pb-1 font-mono text-xs text-ink-faint">
              {mediaType}
            </div>
            {media.schema && <SchemaView schema={media.schema} />}
          </div>
        ))
      )}
    </div>
  );
}
