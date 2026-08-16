import Link from "next/link";
import type { NormalizedDocument } from "@/types/openapi";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { operationSlug } from "@/lib/openapi/display";

export interface IntroductionPageProps {
  document: NormalizedDocument;
}

/**
 * Landing page for a loaded document: title, description, servers,
 * and available authentication schemes.
 */
export function IntroductionPage({ document }: IntroductionPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <div id="introduction">
        <h1 className="text-2xl font-semibold text-ink">{document.title}</h1>
        <p className="pt-1 font-mono text-xs text-ink-faint">
          v{document.version} · OpenAPI {document.openApiVersion}
        </p>
        {document.description && (
          <p className="pt-3 text-sm text-ink-muted">{document.description}</p>
        )}
      </div>

      {document.servers.length > 0 && (
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-ink">Servers</span>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col divide-y divide-border">
              {document.servers.map((server) => (
                <div key={server.url} className="flex flex-col gap-0.5 py-2">
                  <code className="font-mono text-sm text-ink">
                    {server.url}
                  </code>
                  {server.description && (
                    <span className="text-xs text-ink-muted">
                      {server.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {Object.keys(document.securitySchemes).length > 0 && (
        <Card>
          <CardHeader id="authentication">
            <span className="text-xs font-medium text-ink">Authentication</span>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col divide-y divide-border">
              {Object.entries(document.securitySchemes).map(
                ([name, scheme]) => (
                  <div key={name} className="flex flex-col gap-1 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-ink">
                        {name}
                      </span>
                      <Badge tone="neutral">{scheme.type}</Badge>
                      {scheme.scheme && (
                        <Badge tone="neutral">{scheme.scheme}</Badge>
                      )}
                    </div>
                    {scheme.description && (
                      <p className="text-xs text-ink-muted">
                        {scheme.description}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <span className="text-xs font-medium text-ink">Endpoints</span>
        </CardHeader>
        <CardBody>
          <p className="pb-3 text-sm text-ink-muted">
            {document.tagGroups.reduce(
              (total, group) => total + group.operations.length,
              0,
            )}{" "}
            operations across {document.tagGroups.length} tags. Jump straight
            into a tag below, or select an endpoint from the sidebar.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {document.tagGroups.map((group) => {
              const firstOperation = group.operations[0];
              if (!firstOperation) return null;
              const href = `/operations/${operationSlug(
                firstOperation.method,
                firstOperation.path,
                firstOperation.operationId,
              )}`;

              return (
                <Link
                  key={group.name}
                  href={href}
                  className="rounded-sm border border-border px-2 py-1 font-mono text-xs text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
                >
                  {group.name}
                  <span className="pl-1 text-ink-faint">
                    ({group.operations.length})
                  </span>
                </Link>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
