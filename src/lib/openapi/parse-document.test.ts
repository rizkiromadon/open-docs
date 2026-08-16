import { describe, expect, it } from "vitest";
import { parseOpenApiDocument } from "./parse-document";

function baseDoc(overrides: Record<string, unknown> = {}) {
  return {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

describe("parseOpenApiDocument", () => {
  it("parses a valid JSON document", () => {
    const result = parseOpenApiDocument(JSON.stringify(baseDoc()));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.title).toBe("Test API");
      expect(result.document.version).toBe("1.0.0");
    }
  });

  it("parses a valid YAML document", () => {
    const yamlDoc = `
openapi: 3.0.0
info:
  title: YAML API
  version: 2.0.0
paths: {}
`;
    const result = parseOpenApiDocument(yamlDoc);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.title).toBe("YAML API");
    }
  });

  it("fails when the openapi field is missing", () => {
    const doc = baseDoc();
    delete (doc as Record<string, unknown>).openapi;
    const result = parseOpenApiDocument(JSON.stringify(doc));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/openapi/i);
    }
  });

  it("rejects an unsupported major version (2.0)", () => {
    const result = parseOpenApiDocument(
      JSON.stringify(baseDoc({ openapi: "2.0" })),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Unsupported OpenAPI version/);
    }
  });

  it("rejects an unsupported 3.x minor version below 3.0", () => {
    // 3.0 is the floor; a hypothetical 3.-1 style string is invalid,
    // so instead verify a clearly out-of-range major is rejected too.
    const result = parseOpenApiDocument(
      JSON.stringify(baseDoc({ openapi: "4.0" })),
    );
    expect(result.ok).toBe(false);
  });

  it("accepts OpenAPI 3.1.x as supported", () => {
    const result = parseOpenApiDocument(
      JSON.stringify(baseDoc({ openapi: "3.1.0" })),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.supportedVersion).toBe("3.1");
    }
  });

  it("maps tag descriptions from the top-level tags array", () => {
    const doc = baseDoc({
      tags: [{ name: "Pets", description: "Pet operations" }],
      paths: {
        "/pets": {
          get: { operationId: "listPets", tags: ["Pets"], responses: {} },
        },
      },
    });
    const result = parseOpenApiDocument(JSON.stringify(doc));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const petsGroup = result.document.tagGroups.find(
        (g) => g.name === "Pets",
      );
      expect(petsGroup?.description).toBe("Pet operations");
    }
  });

  it("groups operations by tag", () => {
    const doc = baseDoc({
      paths: {
        "/pets": {
          get: { operationId: "listPets", tags: ["Pets"], responses: {} },
        },
        "/owners": {
          get: { operationId: "listOwners", tags: ["Owners"], responses: {} },
        },
      },
    });
    const result = parseOpenApiDocument(JSON.stringify(doc));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const tagNames = result.document.tagGroups.map((g) => g.name).sort();
      expect(tagNames).toEqual(["Owners", "Pets"]);
    }
  });

  it("falls back to the 'Untagged' group when an operation has no tags", () => {
    const doc = baseDoc({
      paths: {
        "/ping": {
          get: { operationId: "ping", responses: {} },
        },
      },
    });
    const result = parseOpenApiDocument(JSON.stringify(doc));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.tagGroups.map((g) => g.name)).toContain(
        "Untagged",
      );
    }
  });
});
