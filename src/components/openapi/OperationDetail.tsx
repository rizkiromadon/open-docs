import type { NormalizedDocument, OperationNode } from "@/types/openapi";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ParameterTable } from "./ParameterTable";
import { RequestBodyPanel } from "./RequestBodyPanel";
import { ResponsePanel } from "./ResponsePanel";
import { CodeSamplePanel } from "./CodeSamplePanel";

export interface OperationDetailProps {
  operation: OperationNode;
  document: NormalizedDocument;
}

/**
 * Renders the full detail view for a single operation: summary,
 * parameters, request body, responses, and a right-hand rail of
 * generated request code samples.
 */
export function OperationDetail({ operation, document }: OperationDetailProps) {
  const baseUrl = document.servers[0]?.url ?? "https://api.example.com";
  const hasQueryParams = operation.parameters.some((p) => p.in === "query");
  const hasPathParams = operation.parameters.some((p) => p.in === "path");
  const hasHeaderParams = operation.parameters.some((p) => p.in === "header");

  return (
    <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_380px]">
      <div className="flex min-w-0 flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <MethodBadge method={operation.method} size="md" />
            <code className="font-mono text-sm text-ink">{operation.path}</code>
            {operation.deprecated && <Badge tone="danger">deprecated</Badge>}
          </div>
          <h1 className="pt-2 text-xl font-semibold text-ink">
            {operation.summary ?? operation.operationId ?? operation.path}
          </h1>
          {operation.description && (
            <p className="pt-1 text-sm text-ink-muted">
              {operation.description}
            </p>
          )}
        </div>

        {hasPathParams && (
          <Card>
            <CardHeader>
              <span className="text-xs font-medium text-ink">Path parameters</span>
            </CardHeader>
            <CardBody>
              <ParameterTable parameters={operation.parameters} location="path" />
            </CardBody>
          </Card>
        )}

        {hasQueryParams && (
          <Card>
            <CardHeader>
              <span className="text-xs font-medium text-ink">Query parameters</span>
            </CardHeader>
            <CardBody>
              <ParameterTable parameters={operation.parameters} location="query" />
            </CardBody>
          </Card>
        )}

        {hasHeaderParams && (
          <Card>
            <CardHeader>
              <span className="text-xs font-medium text-ink">Headers</span>
            </CardHeader>
            <CardBody>
              <ParameterTable parameters={operation.parameters} location="header" />
            </CardBody>
          </Card>
        )}

        {operation.requestBody && (
          <Card>
            <CardHeader>
              <span className="text-xs font-medium text-ink">Request body</span>
            </CardHeader>
            <CardBody>
              <RequestBodyPanel requestBody={operation.requestBody} />
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-ink">Responses</span>
          </CardHeader>
          <CardBody>
            <ResponsePanel responses={operation.responses} />
          </CardBody>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-ink">Request example</span>
          </CardHeader>
          <CardBody>
            <CodeSamplePanel operation={operation} baseUrl={baseUrl} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
