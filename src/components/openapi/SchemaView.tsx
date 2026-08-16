"use client";

import { useState } from "react";
import type { SchemaNode } from "@/types/openapi";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

export interface SchemaViewProps {
  schema: SchemaNode;
  name?: string;
  depth?: number;
  required?: boolean;
}

const MAX_RENDER_DEPTH = 8;

/** Produces a short human-readable type label for a schema node. */
function typeLabel(schema: SchemaNode): string {
  if (schema.oneOf) return "one of";
  if (schema.anyOf) return "any of";
  if (schema.allOf) return "all of";
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  if (schema.type === "array") {
    const itemType = schema.items ? typeLabel(schema.items) : "unknown";
    return `${itemType}[]`;
  }
  if (schema.format) return `${schema.type ?? "string"}<${schema.format}>`;
  return schema.type ?? "object";
}

/**
 * Renders a single OpenAPI/JSON Schema node as a recursive property
 * tree, showing type, requiredness, constraints, and nested fields.
 *
 * Recursion is bounded by {@link MAX_RENDER_DEPTH} to guard against
 * pathological or circular schemas that survived ref resolution.
 */
export function SchemaView({
  schema,
  name,
  depth = 0,
  required = false,
}: SchemaViewProps) {
  if (depth > MAX_RENDER_DEPTH) {
    return (
      <div className="pl-3 text-xs text-ink-faint">
        (schema nesting truncated)
      </div>
    );
  }

  const composite = schema.oneOf ?? schema.anyOf ?? schema.allOf;
  const properties = schema.properties
    ? Object.entries(schema.properties)
    : [];
  const requiredSet = new Set(schema.required ?? []);
  const arrayItemProperties = schema.type === "array" && schema.items?.properties;
  const hasNested = Boolean(composite || properties.length > 0 || arrayItemProperties);
  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <div className={cn(depth > 0 && "border-l border-border pl-3")}>
      <div className="flex flex-wrap items-baseline gap-2 py-1">
        {hasNested && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="font-mono text-xs text-ink-faint transition-colors hover:text-ink"
          >
            {expanded ? "▾" : "▸"}
          </button>
        )}
        {name && (
          <span className="font-mono text-sm text-ink">{name}</span>
        )}
        <span className="font-mono text-xs text-ink-muted">
          {typeLabel(schema)}
        </span>
        {required && (
          <Badge tone="warning" className="normal-case">
            required
          </Badge>
        )}
        {schema.deprecated && (
          <Badge tone="danger" className="normal-case">
            deprecated
          </Badge>
        )}
        {schema.enum && (
          <span className="font-mono text-xs text-ink-faint">
            enum: {schema.enum.map((v) => String(v)).join(" | ")}
          </span>
        )}
      </div>

      {schema.description && (
        <p className="pb-1 text-xs text-ink-muted">{schema.description}</p>
      )}

      <SchemaConstraints schema={schema} />

      {expanded && composite && (
        <div className="flex flex-col gap-2 py-1">
          {composite.map((sub, index) => (
            <SchemaView key={index} schema={sub} depth={depth + 1} />
          ))}
        </div>
      )}

      {expanded && properties.length > 0 && (
        <div className="flex flex-col">
          {properties.map(([propName, propSchema]) => (
            <SchemaView
              key={propName}
              name={propName}
              schema={propSchema}
              depth={depth + 1}
              required={requiredSet.has(propName)}
            />
          ))}
        </div>
      )}

      {expanded && arrayItemProperties && (
        <SchemaView schema={schema.items!} depth={depth + 1} />
      )}
    </div>
  );
}

/** Renders inline validation constraints such as min/max and pattern. */
function SchemaConstraints({ schema }: { schema: SchemaNode }) {
  const constraints: string[] = [];
  if (schema.minimum !== undefined) constraints.push(`min ${schema.minimum}`);
  if (schema.maximum !== undefined) constraints.push(`max ${schema.maximum}`);
  if (schema.minLength !== undefined)
    constraints.push(`minLength ${schema.minLength}`);
  if (schema.maxLength !== undefined)
    constraints.push(`maxLength ${schema.maxLength}`);
  if (schema.pattern) constraints.push(`pattern ${schema.pattern}`);
  if (schema.default !== undefined)
    constraints.push(`default ${JSON.stringify(schema.default)}`);

  if (constraints.length === 0) return null;

  return (
    <div className="pb-1 font-mono text-xs text-ink-faint">
      {constraints.join(" · ")}
    </div>
  );
}
