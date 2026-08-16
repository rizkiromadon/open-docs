import * as yaml from "js-yaml";
import { resolveRefs } from "./resolve-refs";
import type {
  HttpMethod,
  MediaTypeNode,
  NormalizedDocument,
  OperationNode,
  ParameterNode,
  ParseResult,
  RequestBodyNode,
  ResponseNode,
  SchemaNode,
  SecuritySchemeNode,
  ServerNode,
  SupportedOpenApiVersion,
  TagGroup,
} from "@/types/openapi";

const HTTP_METHODS: HttpMethod[] = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
];

const MINIMUM_SUPPORTED_MAJOR_MINOR = "3.0";

/**
 * Parses a raw OpenAPI document string, which may be JSON or YAML, into
 * a plain JavaScript object. Throws a descriptive error if neither
 * format can be parsed.
 */
function parseRawDocument(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }
  return yaml.load(trimmed);
}

/**
 * Determines whether a document's declared `openapi` version string is
 * within the range open-docs supports (3.0.0 up to the latest 3.1.x).
 */
function detectSupportedVersion(
  version: string,
): { supported: SupportedOpenApiVersion; ok: boolean } {
  const [major, minor] = version.split(".").map(Number);
  if (major !== 3) {
    return { supported: "3.0", ok: false };
  }
  if (minor === 0) {
    return { supported: "3.0", ok: true };
  }
  if (minor === 1) {
    return { supported: "3.1", ok: true };
  }
  return { supported: "3.1", ok: minor > 1 };
}

/** Normalizes a raw parameter object into a {@link ParameterNode}. */
function normalizeParameter(raw: Record<string, unknown>): ParameterNode {
  return {
    name: String(raw.name ?? ""),
    in: (raw.in as ParameterNode["in"]) ?? "query",
    description: raw.description as string | undefined,
    required: Boolean(raw.required),
    deprecated: Boolean(raw.deprecated),
    schema: raw.schema as SchemaNode | undefined,
    example: raw.example,
  };
}

/** Normalizes a raw content map into a record of {@link MediaTypeNode}. */
function normalizeContent(
  raw: Record<string, unknown> | undefined,
): Record<string, MediaTypeNode> {
  if (!raw) return {};
  const result: Record<string, MediaTypeNode> = {};
  for (const [mediaType, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    result[mediaType] = {
      schema: v.schema as SchemaNode | undefined,
      example: v.example,
      examples: v.examples as MediaTypeNode["examples"],
    };
  }
  return result;
}

/** Normalizes a raw request body object into a {@link RequestBodyNode}. */
function normalizeRequestBody(
  raw: Record<string, unknown> | undefined,
): RequestBodyNode | undefined {
  if (!raw) return undefined;
  return {
    description: raw.description as string | undefined,
    required: Boolean(raw.required),
    content: normalizeContent(raw.content as Record<string, unknown>),
  };
}

/** Normalizes a raw responses map into a record of {@link ResponseNode}. */
function normalizeResponses(
  raw: Record<string, unknown> | undefined,
): Record<string, ResponseNode> {
  if (!raw) return {};
  const result: Record<string, ResponseNode> = {};
  for (const [status, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    result[status] = {
      description: String(v.description ?? ""),
      content: normalizeContent(v.content as Record<string, unknown>),
      headers: v.headers as Record<string, ParameterNode> | undefined,
    };
  }
  return result;
}

/**
 * Merges path-level (shared) and operation-level (own) parameters,
 * de-duplicating by the `(name, in)` pair. Per the OpenAPI spec's
 * override semantics, an operation-level parameter with the same name
 * and location takes precedence over the shared path-level one.
 */
function mergeParameters(
  sharedParameters: ParameterNode[],
  ownParameters: ParameterNode[],
): ParameterNode[] {
  const merged = new Map<string, ParameterNode>();

  for (const param of sharedParameters) {
    merged.set(`${param.in}:${param.name}`, param);
  }
  for (const param of ownParameters) {
    merged.set(`${param.in}:${param.name}`, param);
  }

  return Array.from(merged.values());
}

/**
 * Walks the `paths` object of a resolved OpenAPI document and produces
 * a flat list of {@link OperationNode} entries, one per method/path
 * combination.
 */
function extractOperations(paths: Record<string, unknown>): OperationNode[] {
  const operations: OperationNode[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    const item = pathItem as Record<string, unknown>;
    const sharedParameters = Array.isArray(item.parameters)
      ? (item.parameters as Record<string, unknown>[]).map(normalizeParameter)
      : [];

    for (const method of HTTP_METHODS) {
      const rawOperation = item[method] as Record<string, unknown> | undefined;
      if (!rawOperation) continue;

      const ownParameters = Array.isArray(rawOperation.parameters)
        ? (rawOperation.parameters as Record<string, unknown>[]).map(
            normalizeParameter,
          )
        : [];

      operations.push({
        operationId: rawOperation.operationId as string | undefined,
        summary: rawOperation.summary as string | undefined,
        description: rawOperation.description as string | undefined,
        tags: Array.isArray(rawOperation.tags)
          ? (rawOperation.tags as string[])
          : ["Untagged"],
        deprecated: Boolean(rawOperation.deprecated),
        parameters: mergeParameters(sharedParameters, ownParameters),
        requestBody: normalizeRequestBody(
          rawOperation.requestBody as Record<string, unknown> | undefined,
        ),
        responses: normalizeResponses(
          rawOperation.responses as Record<string, unknown> | undefined,
        ),
        security: rawOperation.security as
          | OperationNode["security"]
          | undefined,
        method,
        path,
      });
    }
  }

  return operations;
}

/** Groups a flat operation list into {@link TagGroup} entries. */
function groupByTag(
  operations: OperationNode[],
  tagDescriptions: Record<string, string>,
): TagGroup[] {
  const groups = new Map<string, OperationNode[]>();

  for (const operation of operations) {
    for (const tag of operation.tags) {
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag)!.push(operation);
    }
  }

  return Array.from(groups.entries()).map(([name, ops]) => ({
    name,
    description: tagDescriptions[name],
    operations: ops,
  }));
}

/**
 * Parses and normalizes a raw OpenAPI document string into a
 * {@link NormalizedDocument}, resolving all local `$ref` pointers along
 * the way.
 *
 * @param raw - The document source, either JSON or YAML text.
 * @returns A {@link ParseResult} discriminated union indicating success
 *   or the reason parsing failed.
 */
export function parseOpenApiDocument(raw: string): ParseResult {
  let source: unknown;
  try {
    source = parseRawDocument(raw);
  } catch (err) {
    return {
      ok: false,
      error: `Could not parse document as JSON or YAML: ${(err as Error).message}`,
    };
  }

  if (source === null || typeof source !== "object") {
    return { ok: false, error: "Document root must be an object." };
  }

  const doc = source as Record<string, unknown>;
  const openApiVersion = String(doc.openapi ?? "");
  if (!openApiVersion) {
    return { ok: false, error: "Missing required `openapi` version field." };
  }

  const { supported, ok } = detectSupportedVersion(openApiVersion);
  if (!ok) {
    return {
      ok: false,
      error: `Unsupported OpenAPI version "${openApiVersion}". open-docs supports ${MINIMUM_SUPPORTED_MAJOR_MINOR}.0 and later.`,
    };
  }

  const resolved = resolveRefs(doc, doc) as Record<string, unknown>;

  const info = (resolved.info as Record<string, unknown>) ?? {};
  const components = (resolved.components as Record<string, unknown>) ?? {};
  const rawTags = Array.isArray(resolved.tags)
    ? (resolved.tags as Record<string, unknown>[])
    : [];

  const tagDescriptions: Record<string, string> = {};
  for (const tag of rawTags) {
    if (typeof tag.name === "string" && typeof tag.description === "string") {
      tagDescriptions[tag.name] = tag.description;
    }
  }

  const operations = extractOperations(
    (resolved.paths as Record<string, unknown>) ?? {},
  );

  const document: NormalizedDocument = {
    title: String(info.title ?? "Untitled API"),
    version: String(info.version ?? "0.0.0"),
    description: info.description as string | undefined,
    openApiVersion,
    supportedVersion: supported,
    servers: Array.isArray(resolved.servers)
      ? (resolved.servers as ServerNode[])
      : [],
    tagGroups: groupByTag(operations, tagDescriptions),
    securitySchemes:
      (components.securitySchemes as Record<string, SecuritySchemeNode>) ??
      {},
    rawSchemas: (components.schemas as Record<string, SchemaNode>) ?? {},
  };

  return { ok: true, document };
}
