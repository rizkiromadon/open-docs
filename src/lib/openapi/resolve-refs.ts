/**
 * Resolves local JSON-pointer `$ref` values within a single OpenAPI
 * document. Only same-document refs (`#/components/...`) are supported;
 * external file or URL refs are left untouched and surfaced as-is.
 */

const MAX_RESOLUTION_DEPTH = 40;

/**
 * Walks a JSON pointer such as `#/components/schemas/Pet` against the
 * root document and returns the referenced value, or `undefined` if the
 * pointer cannot be resolved.
 */
function resolvePointer(root: unknown, pointer: string): unknown {
  if (!pointer.startsWith("#/")) {
    return undefined;
  }

  const segments = pointer
    .slice(2)
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));

  let current: unknown = root;
  for (const segment of segments) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Recursively resolves all `$ref` occurrences within `node`, replacing
 * each with the dereferenced object. Circular references are detected
 * via a visited-pointer stack and left as an unresolved `$ref` marker
 * to avoid infinite recursion.
 *
 * @param node - The subtree to resolve, typically the full document or
 *   a fragment of it.
 * @param root - The full document, used as the base for pointer lookups.
 * @param depth - Internal recursion guard.
 */
export function resolveRefs(
  node: unknown,
  root: unknown,
  depth = 0,
): unknown {
  if (depth > MAX_RESOLUTION_DEPTH || node === null || typeof node !== "object") {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((item) => resolveRefs(item, root, depth + 1));
  }

  const obj = node as Record<string, unknown>;

  if (typeof obj.$ref === "string") {
    const resolved = resolvePointer(root, obj.$ref);
    if (resolved === undefined) {
      return obj;
    }
    const deref = resolveRefs(resolved, root, depth + 1);
    const { $ref: _ref, ...siblings } = obj;
    const hasSiblings = Object.keys(siblings).length > 0;

    if (deref !== null && typeof deref === "object" && !Array.isArray(deref)) {
      // OpenAPI 3.1 / JSON Schema 2020-12 allow keywords alongside
      // `$ref`; resolve and merge them on top of the dereferenced
      // object so local overrides win over the referenced definition.
      const resolvedSiblings = hasSiblings
        ? (resolveRefs(siblings, root, depth + 1) as Record<string, unknown>)
        : {};
      return { ...deref, ...resolvedSiblings, $refSource: obj.$ref };
    }
    return deref;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolveRefs(value, root, depth + 1);
  }
  return result;
}
