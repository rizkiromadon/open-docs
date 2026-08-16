import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DocsShell } from "@/components/layout/DocsShell";
import { OperationDetail } from "@/components/openapi/OperationDetail";
import { findOperationBySlug, loadActiveDocument } from "@/lib/openapi/load-document";
import { operationSlug } from "@/lib/openapi/display";

export interface OperationPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-computes every valid operation slug at build time so operation
 * pages are statically generated instead of rendered per-request.
 * Slugs outside this set still fall through to `notFound()` at
 * request time via Next's default `dynamicParams` behavior.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const document = await loadActiveDocument();
  return document.tagGroups.flatMap((group) =>
    group.operations.map((operation) => ({
      slug: operationSlug(operation.method, operation.path, operation.operationId),
    })),
  );
}

/**
 * Generates a per-route browser tab title/description from the
 * resolved operation, falling back to a generic title when the slug
 * doesn't match any operation (the page itself will 404 separately).
 */
export async function generateMetadata({
  params,
}: OperationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = await loadActiveDocument();
  const operation = findOperationBySlug(document, slug);

  if (!operation) {
    return { title: "Not found · open-docs" };
  }

  return {
    title: `${operation.summary ?? operation.path} · ${document.title}`,
    description: operation.description,
  };
}

/**
 * Renders the detail view for a single operation, resolved by slug
 * from the active document. Returns a 404 page if no operation
 * matches the given slug.
 */
export default async function OperationPage({ params }: OperationPageProps) {
  const { slug } = await params;
  const document = await loadActiveDocument();
  const operation = findOperationBySlug(document, slug);

  if (!operation) {
    notFound();
  }

  return (
    <DocsShell document={document}>
      <OperationDetail operation={operation} document={document} />
    </DocsShell>
  );
}
