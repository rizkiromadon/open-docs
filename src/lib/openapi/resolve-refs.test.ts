import { describe, expect, it } from "vitest";
import { resolveRefs } from "./resolve-refs";

describe("resolveRefs", () => {
  it("resolves a simple $ref", () => {
    const root = {
      components: {
        schemas: {
          Pet: { type: "object", properties: { name: { type: "string" } } },
        },
      },
      target: { $ref: "#/components/schemas/Pet" },
    };
    const result = resolveRefs(root, root) as Record<string, unknown>;
    expect(result.target).toMatchObject({
      type: "object",
      properties: { name: { type: "string" } },
      $refSource: "#/components/schemas/Pet",
    });
  });

  it("resolves nested refs (a ref pointing to an object that itself contains a ref)", () => {
    const root = {
      components: {
        schemas: {
          Owner: { type: "object", properties: { name: { type: "string" } } },
          Pet: {
            type: "object",
            properties: { owner: { $ref: "#/components/schemas/Owner" } },
          },
        },
      },
      target: { $ref: "#/components/schemas/Pet" },
    };
    const result = resolveRefs(root, root) as Record<string, unknown>;
    const target = result.target as Record<string, unknown>;
    const properties = target.properties as Record<string, unknown>;
    expect(properties.owner).toMatchObject({
      type: "object",
      properties: { name: { type: "string" } },
    });
  });

  it("does not infinite-loop or stack overflow on circular refs", () => {
    const root = {
      components: {
        schemas: {
          Node: {
            type: "object",
            properties: { child: { $ref: "#/components/schemas/Node" } },
          },
        },
      },
    };
    expect(() => resolveRefs(root, root)).not.toThrow();
  });

  it("leaves an unresolvable pointer as-is", () => {
    const root = {
      target: { $ref: "#/components/schemas/DoesNotExist" },
    };
    const result = resolveRefs(root, root) as Record<string, unknown>;
    expect(result.target).toEqual({
      $ref: "#/components/schemas/DoesNotExist",
    });
  });

  it("merges sibling keys alongside $ref, with the sibling override winning (OpenAPI 3.1)", () => {
    const root = {
      components: {
        schemas: {
          Pet: {
            type: "object",
            description: "A generic pet.",
            properties: { name: { type: "string" } },
          },
        },
      },
      target: {
        $ref: "#/components/schemas/Pet",
        description: "A dog, specifically.",
      },
    };
    const result = resolveRefs(root, root) as Record<string, unknown>;
    expect(result.target).toMatchObject({
      type: "object",
      description: "A dog, specifically.",
      properties: { name: { type: "string" } },
      $refSource: "#/components/schemas/Pet",
    });
  });
});
