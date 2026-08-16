import { describe, expect, it } from "vitest";
import { operationSlug, tagSlug } from "./display";

describe("operationSlug", () => {
  it("prefers operationId when present", () => {
    expect(operationSlug("get", "/pets", "listPets")).toBe("listpets");
  });

  it("falls back to method+path when operationId is absent", () => {
    expect(operationSlug("get", "/pets")).toBe("get-pets");
  });

  it("strips special characters", () => {
    expect(operationSlug("get", "/pets/{petId}")).toBe("get-pets-petid");
  });

  it("trims leading and trailing dashes", () => {
    expect(operationSlug("get", "/", "___leading__")).toBe("leading");
  });
});

describe("tagSlug", () => {
  it("lowercases and hyphenates a tag name", () => {
    expect(tagSlug("Pet Store")).toBe("pet-store");
  });

  it("strips special characters and trims dashes", () => {
    expect(tagSlug(" -- Admin/Ops!! -- ")).toBe("admin-ops");
  });
});
