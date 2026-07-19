// @vitest-environment node
import { describe, expect, it } from "vitest";
import { clamp, lerp } from "./clamp";

describe("clamp", () => {
  it("keeps values inside bounds", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(-3, 0, 1)).toBe(0);
    expect(clamp(7, 0, 1)).toBe(1);
  });

  it("maps NaN to min", () => {
    expect(clamp(Number.NaN, 0, 1)).toBe(0);
    expect(clamp(Number.NaN, 2, 5)).toBe(2);
  });

  it("lerp interpolates", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(2, 4, 0)).toBe(2);
  });
});
