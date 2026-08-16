import { describe, expect, it } from "vitest";
import {
  generateCurlSample,
  generateFetchSample,
  generatePythonSample,
} from "./code-samples";
import type { OperationNode, SchemaNode } from "@/types/openapi";

function makeOperation(overrides: Partial<OperationNode> = {}): OperationNode {
  return {
    tags: [],
    parameters: [],
    responses: {},
    method: "get",
    path: "/items",
    ...overrides,
  };
}

// exampleFromSchema is not exported, so exercise it indirectly via the
// generators, which all call it on a request body schema.
function schemaExample(schema: SchemaNode): unknown {
  const operation = makeOperation({
    method: "post",
    requestBody: { required: true, content: { "application/json": { schema } } },
  });
  const sample = generateFetchSample(operation, "https://api.example.com");
  const match = sample.match(/body: JSON\.stringify\(([\s\S]*?)\)\n\}\);/);
  return match?.[1] ? JSON.parse(match[1]) : undefined;
}

describe("exampleFromSchema (via generators)", () => {
  it("builds an example object from nested properties", () => {
    const schema: SchemaNode = {
      type: "object",
      properties: { name: { type: "string" }, age: { type: "integer" } },
    };
    expect(schemaExample(schema)).toEqual({ name: "string", age: 0 });
  });

  it("builds an example array from items", () => {
    const schema: SchemaNode = {
      type: "array",
      items: { type: "string" },
    };
    expect(schemaExample(schema)).toEqual(["string"]);
  });

  it("handles string, integer, number, and boolean types", () => {
    expect(schemaExample({ type: "string" })).toBe("string");
    expect(schemaExample({ type: "integer" })).toBe(0);
    expect(schemaExample({ type: "number" })).toBe(0);
    expect(schemaExample({ type: "boolean" })).toBe(true);
  });

  it("uses the first enum value when present", () => {
    expect(schemaExample({ type: "string", enum: ["a", "b", "c"] })).toBe("a");
  });

  it("prefers an explicit example over default and enum", () => {
    expect(
      schemaExample({
        type: "string",
        example: "explicit",
        default: "fallback",
        enum: ["a", "b"],
      }),
    ).toBe("explicit");
  });

  it("prefers default over enum when no explicit example is set", () => {
    expect(
      schemaExample({ type: "string", default: "fallback", enum: ["a", "b"] }),
    ).toBe("fallback");
  });
});

describe("generateCurlSample", () => {
  it("produces a curl command with path params substituted", () => {
    const operation = makeOperation({
      method: "get",
      path: "/items/{id}",
      parameters: [{ name: "id", in: "path", example: 42 }],
    });
    const sample = generateCurlSample(operation, "https://api.example.com");
    expect(sample).toContain("curl -X GET");
    expect(sample).toContain("https://api.example.com/items/42");
  });

  it("includes header params and a JSON body when present", () => {
    const operation = makeOperation({
      method: "post",
      path: "/items",
      parameters: [{ name: "X-Trace", in: "header" }],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } },
        },
      },
    });
    const sample = generateCurlSample(operation, "https://api.example.com");
    expect(sample).toContain('-H "X-Trace: <X-Trace>"');
    expect(sample).toContain('-H "Content-Type: application/json"');
    expect(sample).toContain('"name": "string"');
  });
});

describe("generateFetchSample", () => {
  it("produces syntactically sane fetch output with a JSON body", () => {
    const operation = makeOperation({
      method: "put",
      path: "/items/{id}",
      parameters: [{ name: "id", in: "path", example: 1 }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object" } } },
      },
    });
    const sample = generateFetchSample(operation, "https://api.example.com");
    expect(sample).toContain('fetch("https://api.example.com/items/1"');
    expect(sample).toContain('method: "PUT"');
    expect(sample).toContain('headers: { "Content-Type": "application/json" }');
  });
});

describe("generatePythonSample", () => {
  it("produces syntactically sane requests output", () => {
    const operation = makeOperation({
      method: "delete",
      path: "/items/{id}",
      parameters: [{ name: "id", in: "path", example: 7 }],
    });
    const sample = generatePythonSample(operation, "https://api.example.com");
    expect(sample).toContain("import requests");
    expect(sample).toContain(
      'requests.delete("https://api.example.com/items/7")',
    );
  });

  it("includes a json= argument when a request body schema is present", () => {
    const operation = makeOperation({
      method: "post",
      path: "/items",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { type: "object", properties: { id: { type: "integer" } } } },
        },
      },
    });
    const sample = generatePythonSample(operation, "https://api.example.com");
    expect(sample).toContain("json=");
    expect(sample).toContain("'id': 0");
  });
});
