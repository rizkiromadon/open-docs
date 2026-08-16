/**
 * Structural types for OpenAPI documents as consumed by open-docs.
 *
 * These types intentionally model a normalized subset of the OpenAPI
 * 3.0.x and 3.1.x specifications rather than the full spec surface.
 * Fields that open-docs does not render are typed as `unknown` so that
 * unsupported documents still parse without loss of data.
 */

/** Supported OpenAPI major/minor version prefixes. */
export type SupportedOpenApiVersion = "3.0" | "3.1";

/** HTTP methods recognized as OpenAPI operations. */
export type HttpMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

/** JSON Schema-like node used for request/response/schema rendering. */
export interface SchemaNode {
  type?: string | string[];
  format?: string;
  title?: string;
  description?: string;
  enum?: Array<string | number | boolean | null>;
  default?: unknown;
  example?: unknown;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  items?: SchemaNode;
  oneOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  allOf?: SchemaNode[];
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  additionalProperties?: SchemaNode | boolean;
  /** Original `$ref` string, if this node was resolved from a reference. */
  $refSource?: string;
}

/** A single named parameter on an operation. */
export interface ParameterNode {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: SchemaNode;
  example?: unknown;
}

/** A media type entry within a request or response body. */
export interface MediaTypeNode {
  schema?: SchemaNode;
  example?: unknown;
  examples?: Record<string, { summary?: string; value?: unknown }>;
}

/** Request body definition for an operation. */
export interface RequestBodyNode {
  description?: string;
  required?: boolean;
  content: Record<string, MediaTypeNode>;
}

/** A single response definition keyed by status code on the operation. */
export interface ResponseNode {
  description: string;
  content?: Record<string, MediaTypeNode>;
  headers?: Record<string, ParameterNode>;
}

/** Security requirement reference attached to an operation. */
export type SecurityRequirement = Record<string, string[]>;

/** A single normalized operation (method + path combination). */
export interface OperationNode {
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  deprecated?: boolean;
  parameters: ParameterNode[];
  requestBody?: RequestBodyNode;
  responses: Record<string, ResponseNode>;
  security?: SecurityRequirement[];
  method: HttpMethod;
  path: string;
}

/** A tag grouping used to organize the sidebar and navigation. */
export interface TagGroup {
  name: string;
  description?: string;
  operations: OperationNode[];
}

/** Server entry describing a base URL the API is reachable at. */
export interface ServerNode {
  url: string;
  description?: string;
}

/** Top-level normalized document produced by the parser. */
export interface NormalizedDocument {
  title: string;
  version: string;
  description?: string;
  openApiVersion: string;
  supportedVersion: SupportedOpenApiVersion;
  servers: ServerNode[];
  tagGroups: TagGroup[];
  securitySchemes: Record<string, SecuritySchemeNode>;
  rawSchemas: Record<string, SchemaNode>;
}

/** Security scheme definition surfaced in the "Authentication" panel. */
export interface SecuritySchemeNode {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect" | string;
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
}

/** Result of attempting to parse and normalize an OpenAPI document. */
export type ParseResult =
  | { ok: true; document: NormalizedDocument }
  | { ok: false; error: string };
