import type { OperationNode, SchemaNode } from "@/types/openapi";

/**
 * Builds a minimal example JSON value from a schema node, used to
 * populate generated code samples with plausible request bodies.
 */
function exampleFromSchema(schema: SchemaNode, depth = 0): unknown {
  if (depth > 5) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];

  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (type) {
    case "object": {
      if (!schema.properties) return {};
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        result[key] = exampleFromSchema(value, depth + 1);
      }
      return result;
    }
    case "array":
      return schema.items ? [exampleFromSchema(schema.items, depth + 1)] : [];
    case "integer":
      return 0;
    case "number":
      return 0;
    case "boolean":
      return true;
    case "string":
      return "string";
    default:
      return schema.properties ? exampleFromSchema({ ...schema, type: "object" }, depth) : null;
  }
}

/** Resolves the first JSON-compatible request body schema, if any. */
function firstJsonSchema(operation: OperationNode): SchemaNode | undefined {
  const jsonMedia = operation.requestBody?.content["application/json"];
  return jsonMedia?.schema;
}

/** Builds an example path with `{param}` placeholders filled in. */
function examplePath(operation: OperationNode): string {
  let path = operation.path;
  for (const param of operation.parameters) {
    if (param.in === "path") {
      const value = param.example ?? `{${param.name}}`;
      path = path.replace(`{${param.name}}`, String(value));
    }
  }
  return path;
}

/**
 * Generates a curl command line reproducing the given operation
 * against `baseUrl`, including a JSON body example when applicable.
 */
export function generateCurlSample(
  operation: OperationNode,
  baseUrl: string,
): string {
  const url = `${baseUrl.replace(/\/$/, "")}${examplePath(operation)}`;
  const lines = [`curl -X ${operation.method.toUpperCase()} "${url}"`];

  const headerParams = operation.parameters.filter((p) => p.in === "header");
  for (const header of headerParams) {
    lines.push(`  -H "${header.name}: <${header.name}>"`);
  }

  const schema = firstJsonSchema(operation);
  if (schema) {
    lines.push('  -H "Content-Type: application/json"');
    const example = exampleFromSchema(schema);
    lines.push(`  -d '${JSON.stringify(example, null, 2)}'`);
  }

  return lines.join(" \\\n");
}

/**
 * Generates a JavaScript `fetch` snippet reproducing the given
 * operation against `baseUrl`.
 */
export function generateFetchSample(
  operation: OperationNode,
  baseUrl: string,
): string {
  const url = `${baseUrl.replace(/\/$/, "")}${examplePath(operation)}`;
  const schema = firstJsonSchema(operation);
  const options: string[] = [`method: "${operation.method.toUpperCase()}"`];

  if (schema) {
    options.push('headers: { "Content-Type": "application/json" }');
    const example = exampleFromSchema(schema);
    options.push(`body: JSON.stringify(${JSON.stringify(example, null, 2)})`);
  }

  return `const response = await fetch("${url}", {\n  ${options.join(",\n  ")}\n});\nconst data = await response.json();`;
}

/**
 * Generates a Python `requests` snippet reproducing the given
 * operation against `baseUrl`.
 */
export function generatePythonSample(
  operation: OperationNode,
  baseUrl: string,
): string {
  const url = `${baseUrl.replace(/\/$/, "")}${examplePath(operation)}`;
  const schema = firstJsonSchema(operation);
  const args = [`"${url}"`];

  if (schema) {
    const example = exampleFromSchema(schema);
    args.push(`json=${JSON.stringify(example, null, 4).replace(/"/g, "'")}`);
  }

  return `import requests\n\nresponse = requests.${operation.method}(${args.join(", ")})\ndata = response.json()`;
}
