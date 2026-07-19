// @vitest-environment node
import { describe, expect, it } from "vitest";
import { DESKTOP_RANGE, MOBILE_RANGE, particleCount, resolveDensityRange } from "./density";

describe("resolveDensityRange", () => {
  it("maps quality to documented ranges", () => {
    expect(resolveDensityRange("high", "mobile")).toEqual(DESKTOP_RANGE);
    expect(resolveDensityRange("medium", "desktop")).toEqual(MOBILE_RANGE);
    expect(resolveDensityRange("low", "desktop")).toEqual({
      min: MOBILE_RANGE.min,
      max: Math.round(MOBILE_RANGE.max * 0.5),
    });
    expect(resolveDensityRange("auto", "desktop")).toEqual(DESKTOP_RANGE);
    expect(resolveDensityRange("auto", "mobile")).toEqual(MOBILE_RANGE);
  });
});

describe("particleCount", () => {
  it("lerps inside the range", () => {
    expect(particleCount(0, DESKTOP_RANGE)).toBe(8000);
    expect(particleCount(1, DESKTOP_RANGE)).toBe(120000);
    expect(particleCount(0.5, DESKTOP_RANGE)).toBe(64000);
    expect(particleCount(0.5, MOBILE_RANGE)).toBe(19500);
  });

  it("clamps out-of-range density", () => {
    expect(particleCount(9, DESKTOP_RANGE)).toBe(120000);
    expect(particleCount(-1, MOBILE_RANGE)).toBe(4000);
    expect(particleCount(Number.NaN, DESKTOP_RANGE)).toBe(8000);
  });

  it("is monotonic in density", () => {
    const steps = [0, 0.2, 0.4, 0.6, 0.8, 1].map((d) => particleCount(d, DESKTOP_RANGE));
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });
});
