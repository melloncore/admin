import { slugify, generateId } from "@/lib/utils/id";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";

describe("slugify", () => {
  it("lowercases and hyphenates a title", () => {
    expect(slugify("Cloud Infrastructure & AI")).toBe("cloud-infrastructure-ai");
  });

  it("collapses repeated whitespace and dashes", () => {
    expect(slugify("  Product   Engineering  ")).toBe("product-engineering");
  });
});

describe("generateId", () => {
  it("produces unique ids", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });

  it("prefixes the id when given a prefix", () => {
    expect(generateId("svc")).toMatch(/^svc_/);
  });
});

describe("cn", () => {
  it("merges class names and drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("formatDate", () => {
  it("formats an ISO date into a short readable string", () => {
    expect(formatDate("2026-07-02T00:00:00.000Z")).toMatch(/Jul/);
  });

  it("returns the original string when the date is invalid", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});
