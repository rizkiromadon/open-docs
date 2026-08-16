import type { ParameterNode } from "@/types/openapi";
import { Badge } from "@/components/ui/Badge";

export interface ParameterTableProps {
  parameters: ParameterNode[];
  location: ParameterNode["in"];
}

/**
 * Renders the subset of an operation's parameters that belong to a
 * given location (query, path, header, or cookie) as a compact list.
 * Renders nothing if no parameters match that location.
 */
export function ParameterTable({ parameters, location }: ParameterTableProps) {
  const filtered = parameters.filter((param) => param.in === location);
  if (filtered.length === 0) return null;

  return (
    <div className="flex flex-col divide-y divide-border">
      {filtered.map((param) => (
        <div key={`${param.in}-${param.name}`} className="flex flex-col gap-1 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-ink">{param.name}</span>
            <span className="font-mono text-xs text-ink-muted">
              {param.schema?.type ?? "string"}
            </span>
            {param.required && <Badge tone="warning">required</Badge>}
            {param.deprecated && <Badge tone="danger">deprecated</Badge>}
          </div>
          {param.description && (
            <p className="text-xs text-ink-muted">{param.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
