import type { HttpMethod } from "@/types/openapi";

/**
 * Builds a stable, URL-safe slug for an operation, preferring its
 * `operationId` when present and falling back to the method and path.
 */
export function operationSlug(
  method: HttpMethod,
  path: string,
  operationId?: string,
): string {
  if (operationId) {
    return operationId
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  return `${method}-${path}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Builds a URL-safe slug for a tag group name. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Maps an HTTP method to its design-token color key, as declared in
 * `tailwind.config.ts` under the `method` color group.
 */
export function methodColorKey(method: HttpMethod): string {
  return method;
}

/** Returns the short uppercase label used for method badges. */
export function methodLabel(method: HttpMethod): string {
  return method.toUpperCase();
}
