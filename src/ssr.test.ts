// @vitest-environment node
import { describe, expect, it } from "vitest";

describe("SSR safety", () => {
  it("imports the package entry without browser globals", async () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    const mod = await import("./index");
    expect(mod.OrganicParticleField).toBeDefined();
  });

  it("exposes only the public component", async () => {
    const mod = await import("./index");
    expect(Object.keys(mod)).toEqual(["OrganicParticleField"]);
  });
});
