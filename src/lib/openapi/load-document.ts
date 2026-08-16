import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { parseOpenApiDocument } from "./parse-document";
import { operationSlug } from "./display";
import type { NormalizedDocument } from "@/types/openapi";

const SPEC_PATH = path.join(process.cwd(), "public", "specs", "openapi.yaml");

/**
 * Loads and parses the active OpenAPI spec from disk for server
 * components. Throws if the file is missing or fails to parse, so
 * callers should surface the error via an error boundary or page-level
 * try/catch as appropriate.
 *
 * Wrapped in React's `cache()` so that multiple calls within the same
 * request/render pass (e.g. a page's `generateMetadata` and the page
 * component itself both calling this) are deduplicated to a single
 * disk read + parse, rather than repeating the work per call. The spec
 * is static build-time content, so this work is entirely repeatable
 * and safe to memoize per-request.
 */
export const loadActiveDocument = cache(
  async (): Promise<NormalizedDocument> => {
    const raw = await readFile(SPEC_PATH, "utf-8");
    const result = parseOpenApiDocument(raw);

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result.document;
  },
);

/**
 * Finds a single operation within a loaded document by its slug,
 * matching against operationId first and falling back to method+path.
 */
export function findOperationBySlug(
  document: NormalizedDocument,
  slug: string,
) {
  for (const group of document.tagGroups) {
    for (const operation of group.operations) {
      const candidateSlug = operationSlug(
        operation.method,
        operation.path,
        operation.operationId,
      );

      if (candidateSlug === slug) {
        return operation;
      }
    }
  }
  return undefined;
}
